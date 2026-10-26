-- =====================================================
-- Delta City OS — Supabase Schema
-- Run this in the Supabase SQL Editor (full script)
-- =====================================================

create extension if not exists postgis;

-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('citizen', 'street_keeper', 'byka', 'merchant', 'admin')) default 'citizen',
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Live positions
create table if not exists public.positions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null,
  location geography(point, 4326) not null,
  accuracy float,
  is_active boolean default true,
  updated_at timestamptz default now()
);
create index if not exists positions_location_idx on public.positions using gist (location);
create index if not exists positions_role_idx on public.positions (role);
create index if not exists positions_updated_at_idx on public.positions (updated_at desc);

-- Markets
create table if not exists public.markets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  location geography(point, 4326) not null,
  verified boolean default false,
  owner_id uuid references public.profiles(id),
  created_at timestamptz default now()
);
create index if not exists markets_location_idx on public.markets using gist (location);

-- Corridors
create table if not exists public.corridors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  geom geography(linestring, 4326) not null,
  status text check (status in ('active', 'planned', 'completed')) default 'active',
  created_at timestamptz default now()
);
create index if not exists corridors_geom_idx on public.corridors using gist (geom);

-- Quests
create table if not exists public.quests (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  quest_type text,
  target_count int default 1,
  reward_badge text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =====================================================
-- PROMOS + CLAIMS (Session 7b)
-- =====================================================

create table if not exists public.promos (
  id text primary key,                          -- e.g. promo-igbudu-fabrics
  merchant_name text not null,
  market_name text not null,
  title text not null,
  description text,
  discount_label text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  lat double precision,
  lng double precision,
  conditions text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.promo_claims (
  id uuid default gen_random_uuid() primary key,
  promo_id text not null references public.promos(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  -- For anonymous / demo users before auth is required:
  device_key text,
  claimed_at timestamptz default now(),
  redeemed boolean default false,
  redeemed_at timestamptz,
  unique (promo_id, user_id),
  unique (promo_id, device_key)
);

create index if not exists promo_claims_promo_idx on public.promo_claims (promo_id);
create index if not exists promo_claims_user_idx on public.promo_claims (user_id);
create index if not exists promo_claims_device_idx on public.promo_claims (device_key);

-- Realtime
alter publication supabase_realtime add table public.positions;

-- RLS
alter table public.profiles enable row level security;
alter table public.positions enable row level security;
alter table public.markets enable row level security;
alter table public.corridors enable row level security;
alter table public.quests enable row level security;
alter table public.promos enable row level security;
alter table public.promo_claims enable row level security;

-- Public read
create policy "Public read markets" on public.markets for select using (true);
create policy "Public read corridors" on public.corridors for select using (true);
create policy "Public read active positions" on public.positions for select using (is_active = true);
create policy "Public read active promos" on public.promos for select using (is_active = true);

-- Claims: anyone can insert (with device_key or user_id); users can read their own
create policy "Anyone can claim promo" on public.promo_claims
  for insert with check (true);

create policy "Users read own claims" on public.promo_claims
  for select using (
    auth.uid() = user_id
    or device_key is not null
  );

create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users insert/update own position" on public.positions
  for all using (auth.uid() = user_id);
