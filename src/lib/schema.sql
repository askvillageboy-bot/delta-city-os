-- =====================================================
-- Delta City OS — Supabase Schema (Session 4)
-- Run this in the Supabase SQL Editor
-- =====================================================

-- Enable PostGIS for geospatial queries
create extension if not exists postgis;

-- -----------------------------------------------------
-- Profiles (extends auth.users)
-- -----------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('citizen', 'street_keeper', 'byka', 'merchant', 'admin')) default 'citizen',
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -----------------------------------------------------
-- Live positions (Street Keepers, BYKA, etc.)
-- -----------------------------------------------------
create table if not exists public.positions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null,                          -- street_keeper | byka | merchant
  location geography(point, 4326) not null,
  accuracy float,
  is_active boolean default true,
  updated_at timestamptz default now()
);

create index if not exists positions_location_idx on public.positions using gist (location);
create index if not exists positions_role_idx on public.positions (role);
create index if not exists positions_updated_at_idx on public.positions (updated_at desc);

-- -----------------------------------------------------
-- Markets / Verified Merchants (can later replace static GeoJSON)
-- -----------------------------------------------------
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

-- -----------------------------------------------------
-- Sweeping Corridors
-- -----------------------------------------------------
create table if not exists public.corridors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  geom geography(linestring, 4326) not null,
  status text check (status in ('active', 'planned', 'completed')) default 'active',
  created_at timestamptz default now()
);

create index if not exists corridors_geom_idx on public.corridors using gist (geom);

-- -----------------------------------------------------
-- Quests (skeleton for later sessions)
-- -----------------------------------------------------
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

-- -----------------------------------------------------
-- Enable Realtime on positions (for live map markers)
-- -----------------------------------------------------
alter publication supabase_realtime add table public.positions;

-- -----------------------------------------------------
-- Basic Row Level Security (adjust later as needed)
-- -----------------------------------------------------
alter table public.profiles enable row level security;
alter table public.positions enable row level security;
alter table public.markets enable row level security;
alter table public.corridors enable row level security;
alter table public.quests enable row level security;

-- Allow anyone to read markets, corridors, and active positions
create policy "Public read markets" on public.markets for select using (true);
create policy "Public read corridors" on public.corridors for select using (true);
create policy "Public read active positions" on public.positions for select using (is_active = true);

-- Users can update their own profile and position
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users insert/update own position" on public.positions
  for all using (auth.uid() = user_id);
