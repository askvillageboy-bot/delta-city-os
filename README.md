# Delta City OS

**Digital Twin & Smart City Operating Platform — Warri Pilot**

## Session Log
- 0–6: Map, markets, corridor, live markers, fixed quests
- 7: Promo Quest layer (offers + claim UI)
- **7b: Promo claims wired to Supabase** (with local fallback)

## Promo Claims

Claims are stored in:
1. **Supabase** `promo_claims` table (when keys are configured)
2. **localStorage** as cache + offline fallback

Anonymous users get a stable `device_key` so claims persist before login.

### One-time Supabase setup
1. Create project at supabase.com
2. SQL Editor → paste full `src/lib/schema.sql` → Run
3. Copy URL + anon key into `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. Restart `npm run dev`

Optional: seed the sample promos into the `promos` table so they exist server-side too.

## Quick Start
```bash
npm install
cp .env.example .env   # add keys when ready
npm run dev
```

Built by Village Boy / Teddy Otega.
