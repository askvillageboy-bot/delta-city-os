# Delta City OS

**Digital Twin & Smart City Operating Platform — Warri Pilot**

## How to find your Supabase keys

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in
2. Click your **project** (or create one → New project → name it e.g. `delta-city-os`)
3. In the left sidebar: **Project Settings** (gear icon) → **API**
4. Copy:
   - **Project URL** → this is `VITE_SUPABASE_URL`
   - **anon public** key → this is `VITE_SUPABASE_ANON_KEY`

### Put keys in `.env` (local only — never commit)

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Then run the SQL scripts once:
1. `src/lib/schema.sql`
2. `src/lib/seed-promos.sql`

Restart the app: `npm run dev`

## Session Log
- 0–6: Map foundation, markets, live markers, fixed quests
- 7 / 7b: Promo layer + claims → Supabase
- **8: Load active promos from Supabase** (static fallback if empty/offline)

## Quick Start
```bash
npm install
cp .env.example .env   # add your keys
npm run dev
```

Built by Village Boy / Teddy Otega.
