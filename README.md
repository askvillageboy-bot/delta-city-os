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
- **Backend** (next): Supabase (Auth + PostGIS + Realtime)
- **Mobile later**: Flutter

## Session Log
- **Session 0** — Foundation: Vite + MapLibre scaffold, Warri center
- **Session 1** — Free OpenFreeMap dark style (no API key)
- **Session 2** — First real layers: 7 verified Warri markets + Warri-Sapele Road sweeping corridor
- **Session 3** — Layer toggles + clean legend

## Quick Start
```bash
npm install
npm run dev
```

Open http://localhost:5173

You should see:
- Dark base map centered on Warri
- Green markers for verified markets (toggleable)
- Orange sweeping corridor (toggleable)
- Clean legend + layer controls in the top-left panel

## Project Goals
Make Warri (and later Delta) visible, navigable, and useful for citizens while generating sustainable funding for Street Keepers and local infrastructure.

Built by Village Boy / Teddy Otega.
