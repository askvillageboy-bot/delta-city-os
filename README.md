# Delta City OS

**Digital Twin & Smart City Operating Platform for Delta State, Nigeria**  
Pilot: **Warri**

## Session Log
- 0–6: Foundation → map, markets, corridor, live markers, fixed quests
- **7: Promo Quest layer** — time-bound vendor offers + claim flow

## Promo Quests (Session 7)

Verified merchants can run time-bound promos. Active offers appear as:
- Gold markers on the map
- "Active Offers" cards in the side panel with a **Claim Offer** button

**Rules in effect:**
- Only currently active promos (by start/end date) are shown
- One claim per promo per user (stored locally for now)
- Claimed state persists in the browser

Later this will move to Supabase so claims are real and vendor-side verification is possible.

## Quick Start
```bash
npm install
npm run dev
```

Built by Village Boy / Teddy Otega.
