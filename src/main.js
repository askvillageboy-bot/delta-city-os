import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase, isSupabaseConfigured } from './lib/supabase.js';
import { FIXED_QUESTS, buildPromoQuests } from './data/quests.js';
import { getActivePromos } from './data/promos.js';

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

// Local claim state (demo — later moves to Supabase)
const claimedPromos = new Set(
  JSON.parse(localStorage.getItem('delta_claimed_promos') || '[]')
);

function saveClaims() {
  localStorage.setItem('delta_claimed_promos', JSON.stringify([...claimedPromos]));
}

function createLiveGeoJSON(positions = []) {
  return {
    type: 'FeatureCollection',
    features: positions.map(p => ({
      type: 'Feature',
      properties: {
        id: p.id,
        role: p.role,
        name: p.name || p.role
      },
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] }
    }))
  };
}

function generateDemoPositions() {
  const base = [
    { id: 'sk-1', role: 'street_keeper', name: 'Street Keeper Team A', lng: 5.748, lat: 5.514 },
    { id: 'sk-2', role: 'street_keeper', name: 'Street Keeper Team B', lng: 5.755, lat: 5.520 },
    { id: 'byka-1', role: 'byka', name: 'BYKA Rider 01', lng: 5.742, lat: 5.518 },
    { id: 'byka-2', role: 'byka', name: 'BYKA Rider 02', lng: 5.760, lat: 5.512 }
  ];
  return base.map(p => ({
    ...p,
    lng: p.lng + (Math.random() - 0.5) * 0.004,
    lat: p.lat + (Math.random() - 0.5) * 0.004
  }));
}

const questProgress = {
  'quest-markets-3': 1,
  'quest-corridor': 0,
  'quest-byka': 1
};

function renderQuests() {
  const container = document.getElementById('quest-list');
  if (!container) return;

  const activePromos = getActivePromos();
  const promoQuests = buildPromoQuests(activePromos);

  let html = '';

  // Promo Quests first (time-sensitive)
  if (promoQuests.length) {
    html += `<div class="section-title">Active Offers</div>`;
    html += promoQuests.map(q => {
      const claimed = claimedPromos.has(q.reward.promoId);
      return `
        <div class="quest-card promo ${claimed ? 'claimed' : ''}" data-promo-id="${q.reward.promoId}">
          <div class="quest-header">
            <span class="quest-icon">${q.icon}</span>
            <div>
              <div class="quest-title">${q.title}</div>
              <div class="quest-desc">${q.description}</div>
            </div>
          </div>
          <div class="promo-actions">
            <span class="discount-tag">${q.reward.discount}</span>
            ${claimed
              ? `<span class="claimed-label">Claimed ✓</span>`
              : `<button class="claim-btn" data-promo-id="${q.reward.promoId}">Claim Offer</button>`
            }
          </div>
        </div>
      `;
    }).join('');
  }

  // Fixed Quests
  html += `<div class="section-title">Daily Quests</div>`;
  html += FIXED_QUESTS.filter(q => q.active).map(quest => {
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
          <div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div>
          <div class="progress-text">${progress}/${quest.target}</div>
        </div>
        ${completed && quest.reward.badge ? `<div class="quest-reward">Badge: ${quest.reward.badge}</div>` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = html;

  // Claim buttons
  container.querySelectorAll('.claim-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const promoId = e.target.dataset.promoId;
      claimedPromos.add(promoId);
      saveClaims();
      renderQuests();
      // Simple feedback
      alert('Offer claimed! Show this screen to the vendor to redeem.');
    });
  });
}

map.on('load', async () => {
  console.log('Delta City OS — Session 7: Promo Quests live');

  // Markets
  const markets = await fetch('/src/data/warri-markets.geojson').then(r => r.json());
  map.addSource('markets', { type: 'geojson', data: markets });
  map.addLayer({
    id: 'markets-circle', type: 'circle', source: 'markets',
    paint: { 'circle-radius': 8, 'circle-color': '#22c55e', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }
  });
  map.addLayer({
    id: 'markets-label', type: 'symbol', source: 'markets',
    layout: { 'text-field': ['get', 'name'], 'text-size': 12, 'text-offset': [0, 1.3], 'text-anchor': 'top' },
    paint: { 'text-color': '#f8fafc', 'text-halo-color': '#0f172a', 'text-halo-width': 1.5 }
  });

  // Corridor
  const corridor = await fetch('/src/data/sweeping-corridor.geojson').then(r => r.json());
  map.addSource('corridor', { type: 'geojson', data: corridor });
  map.addLayer({
    id: 'corridor-line', type: 'line', source: 'corridor',
    paint: { 'line-color': '#f97316', 'line-width': 6, 'line-opacity': 0.75 }
  });

  // Promo markers (gold)
  const activePromos = getActivePromos();
  const promoGeo = {
    type: 'FeatureCollection',
    features: activePromos.map(p => ({
      type: 'Feature',
      properties: { id: p.id, title: p.title, merchant: p.merchantName, discount: p.discountLabel },
      geometry: { type: 'Point', coordinates: p.coordinates }
    }))
  };
  map.addSource('promos', { type: 'geojson', data: promoGeo });
  map.addLayer({
    id: 'promos-circle', type: 'circle', source: 'promos',
    paint: {
      'circle-radius': 10,
      'circle-color': '#eab308',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  });

  map.on('click', 'promos-circle', (e) => {
    const p = e.features[0].properties;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <strong>${p.title}</strong><br/>
        <small>${p.merchant}</small><br/>
        <span style="color:#eab308;font-weight:600">${p.discount}</span>
      `)
      .addTo(map);
  });

  // Live markers
  map.addSource('live-positions', { type: 'geojson', data: createLiveGeoJSON([]) });
  map.addLayer({
    id: 'live-street-keepers', type: 'circle', source: 'live-positions',
    filter: ['==', ['get', 'role'], 'street_keeper'],
    paint: { 'circle-radius': 9, 'circle-color': '#3b82f6', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }
  });
  map.addLayer({
    id: 'live-byka', type: 'circle', source: 'live-positions',
    filter: ['==', ['get', 'role'], 'byka'],
    paint: { 'circle-radius': 9, 'circle-color': '#a855f7', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }
  });

  // Toggles
  document.getElementById('toggle-markets')?.addEventListener('change', e => {
    const v = e.target.checked ? 'visible' : 'none';
    map.setLayoutProperty('markets-circle', 'visibility', v);
    map.setLayoutProperty('markets-label', 'visibility', v);
  });
  document.getElementById('toggle-corridor')?.addEventListener('change', e => {
    map.setLayoutProperty('corridor-line', 'visibility', e.target.checked ? 'visible' : 'none');
  });
  document.getElementById('toggle-live')?.addEventListener('change', e => {
    const v = e.target.checked ? 'visible' : 'none';
    map.setLayoutProperty('live-street-keepers', 'visibility', v);
    map.setLayoutProperty('live-byka', 'visibility', v);
  });
  document.getElementById('toggle-promos')?.addEventListener('change', e => {
    map.setLayoutProperty('promos-circle', 'visibility', e.target.checked ? 'visible' : 'none');
  });

  async function refreshLive() {
    const source = map.getSource('live-positions');
    if (source) source.setData(createLiveGeoJSON(generateDemoPositions()));
  }
  await refreshLive();
  setInterval(refreshLive, 20000);

  renderQuests();
});
