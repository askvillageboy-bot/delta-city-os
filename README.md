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
- **Frontend**: Vite + MapLibre GL JS (fast web first)
- **Maps**: OpenStreetMap / free vector styles
- **Backend** (next): Supabase (Auth + PostGIS + Realtime)
- **Mobile later**: Flutter

## Quick Start
```bash
npm install
npm run dev
```

Open http://localhost:5173 — map should center on Warri.

## Project Goals
Make Warri (and later Delta) visible, navigable, and useful for citizens while generating sustainable funding for Street Keepers and local infrastructure.

Built by Village Boy / Teddy Otega.
