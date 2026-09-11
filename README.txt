NEXT PRO — Hybrid Web Music Mode

Files:
- index.html — NEXT PRO frontend; no local music library.
- functions/api/music.js — Cloudflare Pages Function proxy for Musicae via RapidAPI.

Cloudflare setup:
1. In the Cloudflare Pages project, add an environment variable/secret named MUSICAE_API_KEY.
2. Put your Musicae RapidAPI key in that secret.
3. Deploy the project root containing index.html and functions/api/music.js.

The browser never receives the RapidAPI key. The frontend calls /api/music and the Pages Function calls Musicae.
