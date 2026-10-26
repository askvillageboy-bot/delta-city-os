import { supabase, isSupabaseConfigured } from './supabase.js';
import { getActivePromos, mapPromoRow } from '../data/promos.js';

/**
 * Load active promos.
 * Prefer Supabase when configured and rows exist; otherwise static fallback.
 */
export async function loadActivePromos() {
  if (!isSupabaseConfigured || !supabase) {
    return getActivePromos();
  }

  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('promos')
      .select('*')
      .eq('is_active', true)
      .lte('start_at', now)
      .gte('end_at', now);

    if (error) {
      console.warn('[promos] Supabase fetch failed, using static', error.message);
      return getActivePromos();
    }

    if (!data || data.length === 0) {
      console.info('[promos] No rows in Supabase yet — using static fallback');
      return getActivePromos();
    }

    return data.map(mapPromoRow);
  } catch (err) {
    console.warn('[promos] load error', err);
    return getActivePromos();
  }
}
