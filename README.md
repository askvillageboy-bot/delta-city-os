# Delta City OS

**Digital Twin & Smart City Operating Platform for Delta State, Nigeria**  
Pilot city: **Warri**

Interactive spatial dashboard that combines:
- Live city map (MapLibre + OpenStreetMap)
- Real-time markers for Street Keepers, BYKA cyclists, verified merchants
- Safety geofences around sweeping corridors
- Gamified city quests & badges
- Civic revenue engine (future)

## Stack (MVP)
- **Frontend**: Vite + MapLibre GL JS
- **Maps**: OpenFreeMap (free OSM vector tiles, no API key)
- **Backend**: Supabase (Auth + PostGIS + Realtime)
- **Mobile later**: Flutter

## Session Log
- **Session 0** — Foundation: Vite + MapLibre scaffold, Warri center
- **Session 1** — Free OpenFreeMap dark style (no API key)
- **Session 2** — First real layers: 7 verified Warri markets + Warri-Sapele Road sweeping corridor
- **Session 3** — Layer toggles + clean legend
- **Session 4** — Supabase scaffolding (client, env, schema, Realtime ready)

## Quick Start
```bash
npm install
cp .env.example .env
# → paste your Supabase URL + anon key into .env
npm run dev
```

## Supabase Setup (one-time)
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the contents of `src/lib/schema.sql` → Run
3. Copy your Project URL and anon key into `.env`
4. Restart the dev server

The map works even without Supabase keys (it falls back gracefully).

## Project Goals
Make Warri (and later Delta) visible, navigable, and useful for citizens while generating sustainable funding for Street Keepers and local infrastructure.

Built by Village Boy / Teddy Otega.
