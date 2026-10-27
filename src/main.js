import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { isSupabaseConfigured } from './lib/supabase.js';
import { FIXED_QUESTS, buildPromoQuests } from './data/quests.js';
import { CIVIC_QUESTS, DUMPSTERS } from './data/civic.js';
import { loadActivePromos } from './lib/promos-api.js';
import { loadClaimedPromoIds, claimPromo } from './lib/claims.js';
import { distanceMetres, formatDistance, NEAR_M } from './lib/geo.js';

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

const geolocate = new maplibregl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true,
  showUserLocation: true,
  showAccuracyCircle: true
});
map.addControl(geolocate, 'top-right');

let claimedPromos = new Set();
let activePromosCache = [];
let marketsData = null;
let userPos = null; // { lng, lat }

const CIVIC_KEY = 'delta_civic_progress';
function loadCivicProgress() {
  try { return JSON.parse(localStorage.getItem(CIVIC_KEY) || '{}'); } catch { return {}; }
}
function saveCivicProgress(data) {
  localStorage.setItem(CIVIC_KEY, JSON.stringify(data));
}
let civicProgress = loadCivicProgress();

const questProgress = {
  'quest-markets-3': 1,
  'quest-corridor': 0,
  'quest-byka': 1
};

function createLiveGeoJSON(positions = []) {
  return {
    type: 'FeatureCollection',
    features: positions.map(p => ({
      type: 'Feature',
      properties: { id: p.id, role: p.role, name: p.name || p.role },
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

function getNearby() {
  if (!userPos) return { markets: [], promos: [], dumpsters: [] };

  const markets = (marketsData?.features || []).map(f => {
    const [lng, lat] = f.geometry.coordinates;
    const d = distanceMetres(userPos.lng, userPos.lat, lng, lat);
    return { name: f.properties.name, d, lng, lat };
  }).sort((a, b) => a.d - b.d);

  const promos = activePromosCache.map(p => {
    const [lng, lat] = p.coordinates;
    const d = distanceMetres(userPos.lng, userPos.lat, lng, lat);
    return { ...p, d };
  }).sort((a, b) => a.d - b.d);

  const dumpsters = DUMPSTERS.map(d => {
    const [lng, lat] = d.coordinates;
    const dist = distanceMetres(userPos.lng, userPos.lat, lng, lat);
    return { ...d, d: dist };
  }).sort((a, b) => a.d - b.d);

  return { markets, promos, dumpsters };
}

function renderNearYou() {
  const el = document.getElementById('near-you');
  if (!el) return;

  if (!userPos) {
    el.innerHTML = `
      <div class="near-empty">
        Tap the <strong>locate</strong> button (top right) so the map can find you.
      </div>
    `;
    return;
  }

  const { markets, promos, dumpsters } = getNearby();
  const nearestMarket = markets[0];
  const nearPromos = promos.filter(p => p.d <= NEAR_M);
  const nearFull = dumpsters.filter(d => d.status === 'full' && d.d <= NEAR_M);

  let lines = [];
  if (nearestMarket) {
    lines.push(`Closest market: <strong>${nearestMarket.name}</strong> · ${formatDistance(nearestMarket.d)}`);
  }
  if (nearPromos.length) {
    lines.push(`${nearPromos.length} offer${nearPromos.length > 1 ? 's' : ''} within ${NEAR_M}m`);
  }
  if (nearFull.length) {
    lines.push(`${nearFull.length} full dumpster${nearFull.length > 1 ? 's' : ''} nearby — you can report`);
  }
  if (!nearPromos.length && !nearFull.length && nearestMarket && nearestMarket.d > NEAR_M) {
    lines.push('Nothing urgent next to you — explore the map or claim an offer below.');
  }

  el.innerHTML = `
    <div class="near-status">You are on the map</div>
    <div class="near-lines">${lines.map(l => `<div class="near-line">${l}</div>`).join('')}</div>
  `;
}

function renderQuests() {
  const container = document.getElementById('quest-list');
  if (!container) return;

  const nearby = getNearby();
  const promoQuests = buildPromoQuests(activePromosCache);
  let html = '';

  if (promoQuests.length) {
    html += `<div class="section-title">Active Offers</div>`;
    html += promoQuests.map(q => {
      const claimed = claimedPromos.has(q.reward.promoId);
      const promoNear = nearby.promos.find(p => p.id === q.reward.promoId);
      const nearTag = promoNear && promoNear.d <= NEAR_M
        ? `<span class="near-badge">Near you · ${formatDistance(promoNear.d)}</span>`
        : promoNear
          ? `<span class="far-badge">${formatDistance(promoNear.d)}</span>`
          : '';
      return `
        <div class="quest-card promo ${claimed ? 'claimed' : ''}">
          <div class="quest-header">
            <span class="quest-icon">${q.icon}</span>
            <div>
              <div class="quest-title">${q.title}</div>
              <div class="quest-desc">${q.description}</div>
              ${nearTag}
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

  html += `<div class="section-title">Civic Actions</div>`;
  html += CIVIC_QUESTS.filter(q => q.active).map(quest => {
    const done = Boolean(civicProgress[quest.id]);
    const fullNear = nearby.dumpsters.filter(d => d.status === 'full' && d.d <= NEAR_M);
    const hint = quest.type === 'report_dumpster' && fullNear.length && !done
      ? `<div class="near-badge">${fullNear.length} full bin nearby</div>`
      : '';
    return `
      <div class="quest-card civic ${done ? 'completed' : ''}">
        <div class="quest-header">
          <span class="quest-icon">${quest.icon}</span>
          <div>
            <div class="quest-title">${quest.title}</div>
            <div class="quest-desc">${quest.description}</div>
            ${hint}
          </div>
        </div>
        <div class="promo-actions">
          <span class="points-tag">+${quest.reward.points} pts</span>
          ${done
            ? `<span class="claimed-label">Done ✓ · ${quest.reward.badge}</span>`
            : `<button class="civic-btn" data-civic-id="${quest.id}">Complete</button>`
          }
        </div>
      </div>
    `;
  }).join('');

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

  container.querySelectorAll('.claim-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const promoId = e.target.dataset.promoId;
      e.target.disabled = true;
      e.target.textContent = 'Claiming…';
      const result = await claimPromo(promoId);
      if (result.ok) {
        claimedPromos.add(promoId);
        renderQuests();
        alert(result.alreadyClaimed
          ? 'You already claimed this offer.'
          : 'Offer claimed! Show this screen to the vendor to redeem.');
      } else {
        e.target.disabled = false;
        e.target.textContent = 'Claim Offer';
      }
    });
  });

  container.querySelectorAll('.civic-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.civicId;
      const quest = CIVIC_QUESTS.find(q => q.id === id);
      civicProgress[id] = {
        completedAt: new Date().toISOString(),
        points: quest?.reward?.points || 0
      };
      saveCivicProgress(civicProgress);
      renderQuests();
      alert(
        quest
          ? `Thanks for helping keep Warri clean.\n+${quest.reward.points} points · Badge: ${quest.reward.badge}`
          : 'Action recorded.'
      );
    });
  });
}

function onUserLocation(lng, lat) {
  userPos = { lng, lat };
  renderNearYou();
  renderQuests();
}

map.on('load', async () => {
  console.log('Delta City OS — Session 10: You on the map');
  console.log('Supabase configured:', isSupabaseConfigured);

  claimedPromos = await loadClaimedPromoIds();
  activePromosCache = await loadActivePromos();
  marketsData = await fetch('/src/data/warri-markets.geojson').then(r => r.json());

  map.addSource('markets', { type: 'geojson', data: marketsData });
  map.addLayer({
    id: 'markets-circle', type: 'circle', source: 'markets',
    paint: { 'circle-radius': 8, 'circle-color': '#22c55e', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }
  });
  map.addLayer({
    id: 'markets-label', type: 'symbol', source: 'markets',
    layout: { 'text-field': ['get', 'name'], 'text-size': 12, 'text-offset': [0, 1.3], 'text-anchor': 'top' },
    paint: { 'text-color': '#f8fafc', 'text-halo-color': '#0f172a', 'text-halo-width': 1.5 }
  });

  const corridor = await fetch('/src/data/sweeping-corridor.geojson').then(r => r.json());
  map.addSource('corridor', { type: 'geojson', data: corridor });
  map.addLayer({
    id: 'corridor-line', type: 'line', source: 'corridor',
    paint: { 'line-color': '#f97316', 'line-width': 6, 'line-opacity': 0.75 }
  });

  const promoGeo = {
    type: 'FeatureCollection',
    features: activePromosCache.map(p => ({
      type: 'Feature',
      properties: { id: p.id, title: p.title, merchant: p.merchantName, discount: p.discountLabel },
      geometry: { type: 'Point', coordinates: p.coordinates }
    }))
  };
  map.addSource('promos', { type: 'geojson', data: promoGeo });
  map.addLayer({
    id: 'promos-circle', type: 'circle', source: 'promos',
    paint: { 'circle-radius': 10, 'circle-color': '#eab308', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }
  });

  const dumpGeo = {
    type: 'FeatureCollection',
    features: DUMPSTERS.map(d => ({
      type: 'Feature',
      properties: { id: d.id, name: d.name, status: d.status },
      geometry: { type: 'Point', coordinates: d.coordinates }
    }))
  };
  map.addSource('dumpsters', { type: 'geojson', data: dumpGeo });
  map.addLayer({
    id: 'dumpsters-circle', type: 'circle', source: 'dumpsters',
    paint: {
      'circle-radius': 9,
      'circle-color': ['match', ['get', 'status'], 'full', '#ef4444', 'ok', '#64748b', '#64748b'],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  });

  map.on('click', 'dumpsters-circle', (e) => {
    const p = e.features[0].properties;
    new maplibregl.Popup().setLngLat(e.lngLat).setHTML(
      `<strong>${p.name}</strong><br/><small>Status: ${p.status === 'full' ? 'Needs attention' : 'OK'}</small>`
    ).addTo(map);
  });

  map.on('click', 'promos-circle', (e) => {
    const p = e.features[0].properties;
    new maplibregl.Popup().setLngLat(e.lngLat).setHTML(
      `<strong>${p.title}</strong><br/><small>${p.merchant}</small><br/><span style="color:#eab308;font-weight:600">${p.discount}</span>`
    ).addTo(map);
  });

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

  const setVis = (id, on) => map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
  document.getElementById('toggle-markets')?.addEventListener('change', e => {
    setVis('markets-circle', e.target.checked);
    setVis('markets-label', e.target.checked);
  });
  document.getElementById('toggle-corridor')?.addEventListener('change', e => setVis('corridor-line', e.target.checked));
  document.getElementById('toggle-live')?.addEventListener('change', e => {
    setVis('live-street-keepers', e.target.checked);
    setVis('live-byka', e.target.checked);
  });
  document.getElementById('toggle-promos')?.addEventListener('change', e => setVis('promos-circle', e.target.checked));
  document.getElementById('toggle-dumpsters')?.addEventListener('change', e => setVis('dumpsters-circle', e.target.checked));

  // Location events
  geolocate.on('geolocate', (e) => {
    onUserLocation(e.coords.longitude, e.coords.latitude);
  });

  document.getElementById('btn-find-me')?.addEventListener('click', () => {
    geolocate.trigger();
  });

  // Demo: if user is not in Warri, allow "Simulate in Warri" for demos
  document.getElementById('btn-simulate-warri')?.addEventListener('click', () => {
    const sim = { lng: 5.7485, lat: 5.5150 };
    map.flyTo({ center: [sim.lng, sim.lat], zoom: 14.5 });
    onUserLocation(sim.lng, sim.lat);
  });

  async function refreshLive() {
    const source = map.getSource('live-positions');
    if (source) source.setData(createLiveGeoJSON(generateDemoPositions()));
  }
  await refreshLive();
  setInterval(refreshLive, 20000);

  renderNearYou();
  renderQuests();
});
