// Spotify integration via Authorization Code + PKCE (no backend needed).
// Profile is derived from the user's top artists' genres, since the
// audio-features endpoint is deprecated for new Spotify apps (Nov 2024).

import { classifyGenre } from "./profiles";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
const SCOPES = "user-top-read";

function redirectUri() {
  return window.location.origin + window.location.pathname;
}

export function spotifyConfigured() {
  return CLIENT_ID.length > 0;
}

// --- PKCE helpers ---
function randomString(len) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const vals = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(vals, (v) => chars[v % chars.length]).join("");
}

async function sha256Base64Url(str) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function startAuth() {
  const verifier = randomString(64);
  sessionStorage.setItem("motif_verifier", verifier);
  const challenge = await sha256Base64Url(verifier);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri(),
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return null;

  const verifier = sessionStorage.getItem("motif_verifier");
  if (!verifier) return null;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
      code_verifier: verifier,
    }),
  });
  if (!res.ok) throw new Error("Token exchange failed");
  const data = await res.json();
  // Clean the URL so refresh doesn't re-trigger the exchange
  window.history.replaceState({}, "", redirectUri());
  return data.access_token;
}

export async function fetchListeningProfile(token) {
  const res = await fetch("https://api.spotify.com/v1/me/top/artists?limit=30&time_range=medium_term", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch top artists");
  const data = await res.json();

  // Weight genres by artist rank: your #1 artist influences the blend
  // more than your #30. Linear decay.
  const weights = {};
  const artists = data.items || [];
  artists.forEach((artist, idx) => {
    const rankWeight = (artists.length - idx) / artists.length;
    for (const rawGenre of artist.genres || []) {
      const key = classifyGenre(rawGenre);
      if (key) weights[key] = (weights[key] || 0) + rankWeight;
    }
  });

  if (Object.keys(weights).length === 0) {
    // Genre-less profile (rare) — default to a pop blend
    weights.pop = 1;
  }

  return {
    weights,
    topArtists: artists.slice(0, 5).map((a) => a.name),
  };
}
