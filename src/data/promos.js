// Delta City OS — Vendor Promos
// Static fallback + helper to normalise Supabase rows

export const PROMOS = [
  {
    id: 'promo-igbudu-fabrics',
    merchantName: 'Igbudu Fabric Hub',
    marketId: 'Igbudu Market',
    title: '10% off all fabrics',
    description: 'Weekend special on wrappers and lace materials',
    discountLabel: '10% OFF',
    startAt: '2026-10-25T00:00:00+01:00',
    endAt: '2026-11-02T23:59:59+01:00',
    coordinates: [5.7474, 5.5123],
    conditions: 'Valid in-store only. One claim per user.',
    active: true
  },
  {
    id: 'promo-main-market-food',
    merchantName: 'Main Market Fresh',
    marketId: 'Main Market Warri',
    title: '₦500 off foodstuff above ₦5,000',
    description: 'Buy provisions and get instant discount',
    discountLabel: '₦500 OFF',
    startAt: '2026-10-24T00:00:00+01:00',
    endAt: '2026-10-31T23:59:59+01:00',
    coordinates: [5.7440, 5.5142],
    conditions: 'Minimum spend ₦5,000. Show claim code in shop.',
    active: true
  },
  {
    id: 'promo-okere-daily',
    merchantName: 'Okere Daily Needs',
    marketId: 'Okere Market',
    title: 'Buy 2 get 1 free on selected items',
    description: 'Household essentials promo',
    discountLabel: 'BUY 2 GET 1',
    startAt: '2026-10-26T00:00:00+01:00',
    endAt: '2026-11-05T23:59:59+01:00',
    coordinates: [5.7515, 5.5180],
    conditions: 'Selected items only. Ask the vendor.',
    active: true
  }
];

export function getActivePromos(now = new Date()) {
  return PROMOS.filter(p => {
    if (!p.active) return false;
    const start = new Date(p.startAt);
    const end = new Date(p.endAt);
    return now >= start && now <= end;
  });
}

/** Map a Supabase promos row to the shape the UI expects */
export function mapPromoRow(row) {
  return {
    id: row.id,
    merchantName: row.merchant_name,
    marketId: row.market_name,
    title: row.title,
    description: row.description || '',
    discountLabel: row.discount_label,
    startAt: row.start_at,
    endAt: row.end_at,
    coordinates: [row.lng, row.lat],
    conditions: row.conditions || '',
    active: row.is_active !== false
  };
}
