import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase, isSupabaseConfigured } from './lib/supabase.js';

// Warri center
const WARRI = { lng: 5.7500, lat: 5.5167 };

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/dark',
  center: [WARRI.lng, WARRI.lat],
  zoom: 12.8,
  pitch: 0,
  attributionControl: true
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');
map.addControl(new maplibregl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true
}), 'top-right');

// -------------------------------------------------
// Helpers
// -------------------------------------------------
function createLiveGeoJSON(positions = []) {
  return {
    type: 'FeatureCollection',
    features: positions.map(p => ({
      type: 'Feature',
      properties: {
        id: p.id,
        role: p.role,
        name: p.name || p.role,
        updated_at: p.updated_at
      },
      geometry: {
        type: 'Point',
        coordinates: [p.lng, p.lat]
      }
    }))
  };
}

// Simple demo simulation (so the map feels alive even without real data)
function generateDemoPositions() {
  const base = [
    { id: 'sk-1', role: 'street_keeper', name: 'Street Keeper Team A', lng: 5.748, lat: 5.514 },
    { id: 'sk-2', role: 'street_keeper', name: 'Street Keeper Team B', lng: 5.755, lat: 5.520 },
    { id: 'byka-1', role: 'byka', name: 'BYKA Rider 01', lng: 5.742, lat: 5.518 },
    { id: 'byka-2', role: 'byka', name: 'BYKA Rider 02', lng: 5.760, lat: 5.512 }
  ];

  // Small random movement to simulate activity
  return base.map(p => ({
    ...p,
    lng: p.lng + (Math.random() - 0.5) * 0.004,
    lat: p.lat + (Math.random() - 0.5) * 0.004,
    updated_at: new Date().toISOString()
  }));
}

// -------------------------------------------------
// Map load
// -------------------------------------------------
map.on('load', async () => {
  console.log('Delta City OS — Session 5: Live markers ready');
  console.log('Supabase configured:', isSupabaseConfigured);

  // ========== Static layers (from Session 2) ==========
  const markets = await fetch('/src/data/warri-markets.geojson').then(r => r.json());
  map.addSource('markets', { type: 'geojson', data: markets });

  map.addLayer({
    id: 'markets-circle',
    type: 'circle',
    source: 'markets',
    paint: {
      'circle-radius': 8,
      'circle-color': '#22c55e',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });

  map.addLayer({
    id: 'markets-label',
    type: 'symbol',
    source: 'markets',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
      'text-offset': [0, 1.3],
      'text-anchor': 'top',
      'text-size': 12
    },
    paint: {
      'text-color': '#f8fafc',
      'text-halo-color': '#0f172a',
      'text-halo-width': 1.5
    }
  });

  const corridor = await fetch('/src/data/sweeping-corridor.geojson').then(r => r.json());
  map.addSource('corridor', { type: 'geojson', data: corridor });

  map.addLayer({
    id: 'corridor-line',
    type: 'line',
    source: 'corridor',
    paint: {
      'line-color': '#f97316',
      'line-width': 6,
      'line-opacity': 0.75
    }
  });

  // ========== Live positions source ==========
  map.addSource('live-positions', {
    type: 'geojson',
    data: createLiveGeoJSON([])
  });

  // Street Keepers (blue)
  map.addLayer({
    id: 'live-street-keepers',
    type: 'circle',
    source: 'live-positions',
    filter: ['==', ['get', 'role'], 'street_keeper'],
    paint: {
      'circle-radius': 9,
      'circle-color': '#3b82f6',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });

  // BYKA (purple)
  map.addLayer({
    id: 'live-byka',
    type: 'circle',
    source: 'live-positions',
    filter: ['==', ['get', 'role'], 'byka'],
    paint: {
      'circle-radius': 9,
      'circle-color': '#a855f7',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });

  // Labels for live markers
  map.addLayer({
    id: 'live-labels',
    type: 'symbol',
    source: 'live-positions',
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 11,
      'text-offset': [0, 1.4],
      'text-anchor': 'top'
    },
    paint: {
      'text-color': '#f1f5f9',
      'text-halo-color': '#0f172a',
      'text-halo-width': 1.2
    }
  });

  // Click popup for live markers
  map.on('click', 'live-street-keepers', showLivePopup);
  map.on('click', 'live-byka', showLivePopup);

  function showLivePopup(e) {
    const props = e.features[0].properties;
    const roleLabel = props.role === 'street_keeper' ? 'Street Keeper' : 'BYKA Rider';
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <strong>${props.name}</strong><br/>
        <small>${roleLabel}</small><br/>
        <span style="font-size:11px;color:#94a3b8">Live · just now</span>
      `)
      .addTo(map);
  }

  // Cursor style
  ['live-street-keepers', 'live-byka'].forEach(layer => {
    map.on('mouseenter', layer, () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', layer, () => map.getCanvas().style.cursor = '');
  });

  // ========== Layer toggles ==========
  document.getElementById('toggle-markets')?.addEventListener('change', (e) => {
    const v = e.target.checked ? 'visible' : 'none';
    map.setLayoutProperty('markets-circle', 'visibility', v);
    map.setLayoutProperty('markets-label', 'visibility', v);
  });

  document.getElementById('toggle-corridor')?.addEventListener('change', (e) => {
    map.setLayoutProperty('corridor-line', 'visibility', e.target.checked ? 'visible' : 'none');
  });

  document.getElementById('toggle-live')?.addEventListener('change', (e) => {
    const v = e.target.checked ? 'visible' : 'none';
    map.setLayoutProperty('live-street-keepers', 'visibility', v);
    map.setLayoutProperty('live-byka', 'visibility', v);
    map.setLayoutProperty('live-labels', 'visibility', v);
  });

  // ========== Live data logic ==========
  async function refreshLivePositions() {
    let positions = [];

    if (isSupabaseConfigured && supabase) {
      // Real data path (once tables have rows)
      const { data, error } = await supabase
        .from('positions')
        .select('id, role, location, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (!error && data?.length) {
        positions = data.map(row => {
          // location is geography → we need to extract coordinates
          // For simplicity in MVP we expect a helper or store lat/lng separately later
          return {
            id: row.id,
            role: row.role,
            name: row.role === 'street_keeper' ? 'Street Keeper' : 'BYKA',
            lng: 0, // placeholder – will improve once we store lat/lng columns
            lat: 0,
            updated_at: row.updated_at
          };
        });
      }
    }

    // Fallback: demo simulation so the map always feels alive
    if (positions.length === 0) {
      positions = generateDemoPositions();
    }

    const source = map.getSource('live-positions');
    if (source) {
      source.setData(createLiveGeoJSON(positions));
    }
  }

  // Initial load + gentle refresh every 20 seconds (lightweight)
  await refreshLivePositions();
  setInterval(refreshLivePositions, 20000);

  // Optional: Realtime subscription (ready when you have real rows)
  if (isSupabaseConfigured && supabase) {
    supabase
      .channel('live-positions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'positions' },
        () => refreshLivePositions()
      )
      .subscribe();
  }
});
