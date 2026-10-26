-- =====================================================
-- Delta City OS — Seed sample promos
-- Run this AFTER schema.sql in the Supabase SQL Editor
-- Safe to re-run (uses ON CONFLICT DO UPDATE)
-- =====================================================

insert into public.promos (
  id,
  merchant_name,
  market_name,
  title,
  description,
  discount_label,
  start_at,
  end_at,
  lat,
  lng,
  conditions,
  is_active
) values
(
  'promo-igbudu-fabrics',
  'Igbudu Fabric Hub',
  'Igbudu Market',
  '10% off all fabrics',
  'Weekend special on wrappers and lace materials',
  '10% OFF',
  '2026-10-25T00:00:00+01:00',
  '2026-11-02T23:59:59+01:00',
  5.5123,
  5.7474,
  'Valid in-store only. One claim per user.',
  true
),
(
  'promo-main-market-food',
  'Main Market Fresh',
  'Main Market Warri',
  '₦500 off foodstuff above ₦5,000',
  'Buy provisions and get instant discount',
  '₦500 OFF',
  '2026-10-24T00:00:00+01:00',
  '2026-10-31T23:59:59+01:00',
  5.5142,
  5.7440,
  'Minimum spend ₦5,000. Show claim code in shop.',
  true
),
(
  'promo-okere-daily',
  'Okere Daily Needs',
  'Okere Market',
  'Buy 2 get 1 free on selected items',
  'Household essentials promo',
  'BUY 2 GET 1',
  '2026-10-26T00:00:00+01:00',
  '2026-11-05T23:59:59+01:00',
  5.5180,
  5.7515,
  'Selected items only. Ask the vendor.',
  true
)
on conflict (id) do update set
  merchant_name = excluded.merchant_name,
  market_name = excluded.market_name,
  title = excluded.title,
  description = excluded.description,
  discount_label = excluded.discount_label,
  start_at = excluded.start_at,
  end_at = excluded.end_at,
  lat = excluded.lat,
  lng = excluded.lng,
  conditions = excluded.conditions,
  is_active = excluded.is_active;

-- Quick check
select id, merchant_name, discount_label, start_at, end_at, is_active
from public.promos
order by start_at;
