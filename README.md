# motif.

**Start making music from the music you already love.**

Motif removes the blank-canvas problem from music production. It reads your Spotify listening taste, builds a musical profile from it, and generates a personalized multi-track beat you can edit, remix, and share — right in the browser. No account, no installs, no experience needed.

**Live demo:** _add your Vercel URL here_

---

## Why this exists

Every music-making tool starts you from nothing: an empty grid, an empty timeline. Motif starts you from *you*. If you listen to hip-hop with a classical streak, your generated beat opens with an 808 rhythm section softened by a string texture layer — then you take over and shape it.

The analytics (genre blend, energy, tempo center) aren't the product; they're the explanation. They answer *"why does my beat sound like this?"* before handing you the controls.

## How it works

```
Spotify top artists ──► genre classification ──► weighted blend profile
                                                        │
                        16-step probability templates ◄─┘
                                (per genre, per track)
                                        │
                          seeded sampling ──► playable pattern
                                        │
                          Tone.js synthesis ──► sound
```

1. **Listening analysis** — via Spotify's Web API (Authorization Code + PKCE, fully client-side), Motif pulls your top 30 artists and classifies their genres into 8 musical profiles, weighted by artist rank. *(Design note: Spotify deprecated the per-track audio-features endpoint for new apps in Nov 2024, so the profile is derived from artist genres — a constraint this architecture was designed around.)*
2. **Profile blending** — each genre profile defines tempo, energy, swing, an instrument palette, a musical scale/chord set, and 16-step rhythm probability templates for five tracks (kick, snare, hats, bass, texture). Your listening weights blend these numerically. The dominant genre owns the rhythm section; the secondary genre colors the texture layer.
3. **Pattern generation** — a seeded PRNG samples concrete steps from the blended probabilities, scaled by your energy score, with musical guardrails (beat-one kick, backbeat anchoring). Regenerate re-rolls the seed.
4. **Synthesis** — all five instruments are synthesized live with Tone.js (no samples to host). Synth character adapts to the profile: 808-style kicks get longer pitch decay, string textures get slow attack and long reverb, jazz gets swing on the transport.
5. **Sharing** — the full pattern state (steps, tempo, genre weights, seed) is base64-encoded into a URL hash. Anyone opening the link hears your exact beat.

## Features

- **Sample mode** — three curated listener profiles let anyone experience the full flow with zero login
- **Spotify mode** — connect your account and hear *your* taste as a beat
- **Interactive studio** — toggle any step, mute tracks, change tempo, regenerate, or switch palettes (your blend vs. pure-genre versions)
- **Live playhead visualization** — per-track color-coded grid that animates in sync with the audio
- **Shareable links** — the entire beat serializes into the URL; no backend, no database

## Tech

| Layer | Choice | Why |
|---|---|---|
| UI | React 18 + Vite | Fast dev/build, no framework overhead for a single-page flow |
| Audio | Tone.js (Web Audio API) | Sample-accurate sequencing, synthesis without hosting audio files |
| Auth | Spotify PKCE flow | OAuth without a backend — the app is fully static |
| Hosting | Vercel / any static host | Zero cost, zero servers |

## Run locally

```bash
npm install
npm run dev
```

Sample mode works immediately. For Spotify mode:

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Add your dev URL (e.g. `http://localhost:5173`) and your deployed URL as Redirect URIs
3. Copy `.env.example` to `.env` and set `VITE_SPOTIFY_CLIENT_ID`

```bash
npm run build   # production build in /dist
```

## Roadmap

- MIDI export (drop your Motif pattern straight into a DAW)
- More tracks + per-step velocity
- Pattern chaining (A/B sections)

---

Built by Bita Khodadad Kouchaki.
