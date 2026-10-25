import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase, isSupabaseConfigured } from './lib/supabase.js';
import { QUESTS } from './data/quests.js';

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

function generateDemoPositions() {
  const base = [
    { id: 'sk-1', role: 'street_keeper', name: 'Street Keeper Team A', lng: 5.748, lat: 5.514 },
    { id: 'sk-2', role: 'street_keeper', name: 'Street Keeper Team B', lng: 5.755, lat: 5.520 },
    { id: 'byka-1', role: 'byka', name: 'BYKA Rider 01', lng: 5 co.742, lat: 5.518 },
    { id: 'byka-2', role: 'byka', name: 'BYKA Rider 02', lng: 5.760, lat: 5.512 }
  ];

  return base.map(p => ({
    ...p,
    lng: p.lng + (Math.random() - 0.5) * 0.004,
    lat: p.lat + (Math.random() - 0.5) * 0.004,
    updated_at: new Date().toISOString()
  }));
}

// Simple local progress for demo (later this will come from Supabase)
const questProgress = {
  'quest-markets-3': 1,
  'quest-corridor': 0,
  'quest-byka': 1
};

function renderQuests() {
  const container = document.getElementById('quest-list');
  if (!container) return;

  container.innerHTML = QUESTS.filter(q => q.active).map(quest => {
    const progress = questProgress[quest.id] || 0;
    const percent = Math.min(100, Math.round((progress / quest.target) * 100));
    const completed = progress >= quest.target;

    return `
      <div class="quest-card ${completed ? 'completed' : ''}">
        <div class="quest-header">
          <span class="quest-icon">${quest.icon}</span>
          <div>
            <div class="quest-title">${quest.title}</div>
            <div class="quest-desc">${quest.description}</div>
          </div>
        </div>
        <div class="quest-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percent}%"></div>
          </div>
          <div class="progress-text">${progress}/${quest.target}</div>
        </div>
        ${completed ? `<div class="quest-reward">Badge unlocked: ${quest.reward.badge}</div>` : ''}
      </div>
    `;
  }).join('');
}

// -------------------------------------------------
// Map load
// -------------------------------------------------
map.on('load', async () => {
  console.log('Delta City OS — Session 6: City Quests skeleton');

  // ========== Static layers ==========
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

  // ========== Live positions ==========
  map.addSource('live-positions', {
    type: 'geojson',
    data: createLiveGeoJSON([])
  });

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

  // Popups
  map.on('click', 'markets-circle', (e) => {
    const props = e.features[0].properties;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`<strong>${props.name}</strong><br/><small>${props.description || ''}</small>`)
      .addTo(map);
  });

  // Toggles
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

  // Live data
  async function refreshLivePositions() {
    let positions = generateDemoPositions(); // demo for now
    const source = map.getSource('live-positions');
    if (source) source.setData(createLiveGeoJSON(positions));
  }

  await refreshLivePositions();
  setInterval(refreshLivePositions, 20000);

  // Render quests
  renderQuests();
});
