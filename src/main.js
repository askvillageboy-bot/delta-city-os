import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Warri, Delta State approximate center
const WARRI = {
  lng: 5.7500,
  lat: 5.5167
};

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json', // free demo style — replace later with OSM vector
  center: [WARRI.lng, WARRI.lat],
  zoom: 12.5,
  pitch: 0,
  attributionControl: true
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');
map.addControl(new maplibregl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true
}), 'top-right');

map.on('load', () => {
  console.log('Delta City OS map loaded — centered on Warri');
  // Future layers will go here:
  // - Street Keepers markers
  // - BYKA cyclists
  // - Verified merchants
  // - Safety geofence corridors
  // - Quest points
});
