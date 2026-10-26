import { supabase, isSupabaseConfigured } from './supabase.js';

const LOCAL_KEY = 'delta_claimed_promos';
const DEVICE_KEY = 'delta_device_key';

/** Stable anonymous device id for pre-auth claims */
function getDeviceKey() {
  let key = localStorage.getItem(DEVICE_KEY);
  if (!key) {
    key = 'dev_' + crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, key);
  }
  return key;
}

function getLocalClaims() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveLocalClaims(set) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify([...set]));
}

/**
 * Load all promo ids this user/device has already claimed.
 * Prefers Supabase when configured; always keeps local as cache/fallback.
 */
export async function loadClaimedPromoIds() {
  const local = getLocalClaims();

  if (!isSupabaseConfigured || !supabase) {
    return local;
  }

  try {
    const deviceKey = getDeviceKey();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    let query = supabase.from('promo_claims').select('promo_id');

    if (userId) {
      query = query.or(`user_id.eq.${userId},device_key.eq.${deviceKey}`);
    } else {
      query = query.eq('device_key', deviceKey);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('[claims] Supabase load failed, using local', error.message);
      return local;
    }

    const remote = new Set((data || []).map(r => r.promo_id));
    // Merge remote into local cache
    remote.forEach(id => local.add(id));
    saveLocalClaims(local);
    return local;
  } catch (err) {
    console.warn('[claims] load error', err);
    return local;
  }
}

/**
 * Claim a promo. Writes to Supabase when available, always updates local.
 * Returns { ok: boolean, alreadyClaimed?: boolean, error?: string }
 */
export async function claimPromo(promoId) {
  const local = getLocalClaims();

  if (local.has(promoId)) {
    return { ok: true, alreadyClaimed: true };
  }

  // Optimistic local write
  local.add(promoId);
  saveLocalClaims(local);

  if (!isSupabaseConfigured || !supabase) {
    return { ok: true, source: 'local' };
  }

  try {
    const deviceKey = getDeviceKey();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const row = {
      promo_id: promoId,
      device_key: deviceKey,
      user_id: userId
    };

    const { error } = await supabase.from('promo_claims').insert(row);

    if (error) {
      // Unique violation = already claimed — still treat as success
      if (error.code === '23505') {
        return { ok: true, alreadyClaimed: true, source: 'supabase' };
      }
      console.warn('[claims] Supabase insert failed', error.message);
      // Keep local claim; sync can retry later
      return { ok: true, source: 'local', warning: error.message };
    }

    return { ok: true, source: 'supabase' };
  } catch (err) {
    console.warn('[claims] claim error', err);
    return { ok: true, source: 'local', warning: String(err) };
  }
}
