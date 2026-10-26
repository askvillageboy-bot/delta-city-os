# Delta City OS

**Digital Twin & Smart City Operating Platform — Warri Pilot**

## Session Log
- 0–6: Map, markets, corridor, live markers, fixed quests
- 7: Promo Quest layer (offers + claim UI)
- 7b: Promo claims wired to Supabase
- **Seed script for sample promos**

## Supabase Setup (one-time)

1. Create a free project at [supabase.com](https://supabase.com)
2. **SQL Editor** → run `src/lib/schema.sql` (full schema)
3. **SQL Editor** → run `src/lib/seed-promos.sql` (sample Warri promos)
4. Copy Project URL + anon key into `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
5. `npm install && npm run dev`

### What the seed adds
| ID | Merchant | Offer |
|----|----------|-------|
| promo-igbudu-fabrics | Igbudu Fabric Hub | 10% OFF fabrics |
| promo-main-market-food | Main Market Fresh | ₦500 OFF foodstuff |
| promo-okere-daily | Okere Daily Needs | BUY 2 GET 1 |

Safe to re-run (upserts on conflict).

## Quick Start (no Supabase yet)
```bash
npm install
npm run dev
```
Map and claims still work with local fallback.

Built by Village Boy / Teddy Otega.
