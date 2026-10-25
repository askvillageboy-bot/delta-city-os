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
- **Session 0** — Foundation
- **Session 1** — Free OpenFreeMap dark style
- **Session 2** — Real Warri markets + sweeping corridor
- **Session 3** — Layer toggles + legend
- **Session 4** — Supabase scaffolding
- **Session 5** — Lightweight live markers (Street Keepers + BYKA)

## Quick Start
```bash
npm install
cp .env.example .env   # optional – map works without keys
npm run dev
```

### What you will see in Session 5
- Green = Verified markets
- Orange line = Sweeping corridor
- Blue dots = Street Keepers (live / simulated)
- Purple dots = BYKA riders (live / simulated)

Markers gently move every 20 seconds so the map feels alive.  
Once real data is in the `positions` table, the simulation is replaced automatically.

## Project Goals
Make Warri visible, navigable, and useful for citizens while generating sustainable funding for Street Keepers.

Built by Village Boy / Teddy Otega.
