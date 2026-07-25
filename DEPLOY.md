# Deploying Motif — step by step

## 1. Push to GitHub
```bash
cd motif
git init
git add .
git commit -m "Motif v1: taste-driven beat generator"
```
Create a new repo named `motif` on github.com, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/motif.git
git branch -M main
git push -u origin main
```

## 2. Deploy on Vercel (free, ~3 minutes)
1. Go to vercel.com → sign in with GitHub
2. "Add New Project" → import the `motif` repo
3. Vercel auto-detects Vite. Click Deploy. Done — you get a live URL like `motif-yourname.vercel.app`

## 3. Enable Spotify mode (optional but recommended)
1. Go to developer.spotify.com/dashboard → Create app
   - App name: Motif
   - Redirect URIs: add BOTH `http://localhost:5173` and your Vercel URL (e.g. `https://motif-yourname.vercel.app/`)
   - Check "Web API"
2. Copy the Client ID
3. In Vercel: Project → Settings → Environment Variables → add `VITE_SPOTIFY_CLIENT_ID` = your client id
4. Redeploy (Vercel → Deployments → ⋯ → Redeploy)

Note: until you request Extended Quota from Spotify, only users you add
under "User Management" in the Spotify dashboard can use Connect Spotify.
Sample mode works for everyone regardless — which is why it exists.

## 4. Portfolio placement
- Resume/portfolio link: your Vercel URL (demo-first!)
- GitHub link: the repo (the README is written to be read by recruiters)
