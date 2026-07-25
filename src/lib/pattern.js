// Pattern generation: sample a concrete 16-step pattern from the
// probability templates in a blended profile. Seeded so "Regenerate"
// gives a new-but-reproducible result.

export const TRACKS = ["kick", "snare", "hats", "bass", "texture"];

// Small seeded PRNG (mulberry32)
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generatePattern(profile, seed = Date.now()) {
  const rand = rng(seed);
  const steps = {};
  const notes = {};

  for (const track of TRACKS) {
    const tpl = profile.templates[track];
    // Energy scales overall density: low-energy listeners get sparser patterns
    const energyScale = 0.6 + profile.energy * 0.55;
    steps[track] = tpl.map((p) => rand() < Math.min(p * energyScale, 0.98));
  }

  // Guarantee musical anchors: beat 1 kick, backbeat snare if the genre calls for it
  if (!steps.kick[0]) steps.kick[0] = true;
  if (profile.templates.snare[4] > 0.5 && !steps.snare[4] && !steps.snare[12]) steps.snare[12] = true;

  // Bass notes: walk the scale, weighted toward the root
  notes.bass = steps.bass.map((on, i) => {
    if (!on) return null;
    if (i === 0 || rand() < 0.4) return profile.scale[0];
    return profile.scale[Math.floor(rand() * profile.scale.length)];
  });

  // Texture: cycle through the chord progression on active steps
  let chordIdx = 0;
  notes.texture = steps.texture.map((on) => {
    if (!on) return null;
    const chord = profile.chords[chordIdx % profile.chords.length];
    chordIdx++;
    return chord;
  });

  return { steps, notes, seed };
}

// --- Share link encoding: pattern state → URL hash and back ---

export function encodeState(state) {
  const payload = {
    v: 1,
    t: state.tempo,
    p: TRACKS.map((tr) => state.steps[tr].map((b) => (b ? 1 : 0)).join("")),
    g: state.genreWeights,
    s: state.seed,
  };
  return btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeState(hash) {
  try {
    const pad = hash.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(pad));
    if (payload.v !== 1) return null;
    const steps = {};
    TRACKS.forEach((tr, i) => {
      steps[tr] = payload.p[i].split("").map((c) => c === "1");
    });
    return { tempo: payload.t, steps, genreWeights: payload.g, seed: payload.s };
  } catch {
    return null;
  }
}
