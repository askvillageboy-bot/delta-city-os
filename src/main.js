import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Warri, Delta State approximate center
const WARRI = {
  lng: 5.7500,
  lat: 5.5167
};

const map = new maplibregl.Map({
  container: 'map',
  // Free OpenFreeMap dark style — no API key required
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

map.on('load', async () => {
  console.log('Delta City OS map loaded — Session 2 layers active');

  // --- Markets layer ---
  const markets = await fetch('/src/data/warri-markets.geojson').then(r => r.json());

  map.addSource('markets', {
    type: 'geojson',
    data: markets
  });

  // Circle markers for markets
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

  // Labels for markets
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

  // --- Sweeping corridor layer ---
  const corridor = await fetch('/src/data/sweeping-corridor.geojson').then(r => r.json());

  map.addSource('corridor', {
    type: 'geojson',
    data: corridor
  });

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

  // Simple click popup for markets
  map.on('click', 'markets-circle', (e) => {
    const props = e.features[0].properties;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <strong>${props.name}</strong><br/>
        <small>${props.description || ''}</small><br/>
        <span style="color:#22c55e;font-size:12px">✓ Verified Merchant Zone</span>
      `)
      .addTo(map);
  });

  map.on('mouseenter', 'markets-circle', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'markets-circle', () => {
    map.getCanvas().style.cursor = '';
  });
});
