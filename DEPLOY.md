# Put Delta City OS on a public link (5 minutes)

You need this so people in Warri can open the map on their phone without installing anything.

## Steps

1. Open **https://vercel.com/new** (sign in with the same GitHub account that owns the repo if possible).
2. Click **Import** next to **askvillageboy-bot/delta-city-os**  
   (If the repo doesn’t show: click “Adjust GitHub App Permissions” and grant access to that repo, then refresh.)
3. Framework should detect **Vite**. Leave defaults.
4. Click **Deploy**.
5. When it finishes, copy the link (looks like `https://delta-city-os-xxxx.vercel.app`).

That link is what you send on WhatsApp.

## Optional (later)

In Vercel → Project → Settings → Environment Variables, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then redeploy. The demo works without these.

## If deploy fails

- Make sure the GitHub repo is public, or Vercel has access to the private repo.
- Build command: `npm run build`
- Output directory: `dist`

## Demo script (WhatsApp)

> Open this: [your link]  
> Tap **Find me** (or Demo in Warri).  
> Then claim an offer or report a dumpster.  
> That’s the Warri map pilot.
