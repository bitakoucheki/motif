// Genre profiles: each genre maps to musical parameters.
// A user's profile is a weighted blend of these based on their listening data.

export const GENRE_PROFILES = {
  hiphop: {
    label: "Hip-hop",
    tempo: 92,
    energy: 0.75,
    swing: 0.12,
    density: { kick: 0.32, snare: 0.18, hats: 0.55, bass: 0.28, texture: 0.1 },
    sounds: { kick: "808 Sub", snare: "Tight Clap", hats: "Closed 909", bass: "808 Glide", texture: "Vinyl Keys" },
    scale: ["C2", "Eb2", "F2", "G2", "Bb2"],
    chords: [["C3", "Eb3", "G3"], ["Bb2", "D3", "F3"]],
    // step probability templates (16 steps) — the rhythmic DNA of the genre
    templates: {
      kick:  [0.95, 0.05, 0.1, 0.05, 0.1, 0.05, 0.6, 0.1, 0.7, 0.05, 0.15, 0.4, 0.05, 0.1, 0.5, 0.05],
      snare: [0.02, 0.02, 0.05, 0.05, 0.95, 0.02, 0.05, 0.1, 0.02, 0.05, 0.05, 0.05, 0.95, 0.05, 0.1, 0.25],
      hats:  [0.8, 0.2, 0.7, 0.3, 0.8, 0.2, 0.7, 0.5, 0.8, 0.2, 0.7, 0.3, 0.8, 0.4, 0.7, 0.4],
      bass:  [0.9, 0.05, 0.1, 0.1, 0.05, 0.1, 0.6, 0.1, 0.1, 0.5, 0.05, 0.1, 0.05, 0.1, 0.55, 0.1],
      texture: [0.7, 0, 0, 0, 0, 0, 0, 0, 0.6, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  rnb: {
    label: "R&B",
    tempo: 78,
    energy: 0.55,
    swing: 0.18,
    density: { kick: 0.25, snare: 0.15, hats: 0.45, bass: 0.25, texture: 0.15 },
    sounds: { kick: "Soft Thump", snare: "Rimshot", hats: "Loose Hat", bass: "Warm Sub", texture: "EP Chords" },
    scale: ["D2", "F2", "G2", "A2", "C3"],
    chords: [["D3", "F3", "A3", "C4"], ["G3", "Bb3", "D4"]],
    templates: {
      kick:  [0.9, 0.05, 0.1, 0.3, 0.05, 0.1, 0.5, 0.05, 0.7, 0.05, 0.2, 0.05, 0.1, 0.35, 0.1, 0.05],
      snare: [0.02, 0.02, 0.05, 0.1, 0.9, 0.05, 0.05, 0.15, 0.05, 0.05, 0.1, 0.05, 0.9, 0.05, 0.15, 0.1],
      hats:  [0.7, 0.1, 0.5, 0.4, 0.7, 0.1, 0.5, 0.3, 0.7, 0.15, 0.5, 0.3, 0.7, 0.2, 0.5, 0.35],
      bass:  [0.85, 0.05, 0.05, 0.2, 0.05, 0.05, 0.4, 0.1, 0.1, 0.4, 0.05, 0.05, 0.3, 0.05, 0.2, 0.1],
      texture: [0.8, 0, 0, 0, 0, 0, 0.3, 0, 0.6, 0, 0, 0, 0.3, 0, 0, 0],
    },
  },
  classical: {
    label: "Classical",
    tempo: 70,
    energy: 0.3,
    swing: 0,
    density: { kick: 0.12, snare: 0.06, hats: 0.1, bass: 0.2, texture: 0.35 },
    sounds: { kick: "Timpani", snare: "Brush", hats: "Shaker", bass: "Cello Pizz", texture: "Warm Strings" },
    scale: ["C2", "D2", "E2", "G2", "A2"],
    chords: [["C3", "E3", "G3", "B3"], ["A2", "C3", "E3"], ["F3", "A3", "C4"]],
    templates: {
      kick:  [0.6, 0, 0.05, 0, 0.1, 0, 0.05, 0, 0.5, 0, 0.05, 0, 0.1, 0, 0.05, 0],
      snare: [0, 0, 0.05, 0, 0.1, 0, 0.05, 0, 0, 0, 0.05, 0, 0.15, 0, 0.05, 0],
      hats:  [0.2, 0, 0.15, 0, 0.2, 0, 0.15, 0, 0.2, 0, 0.15, 0, 0.2, 0, 0.15, 0],
      bass:  [0.7, 0, 0, 0, 0.3, 0, 0.1, 0, 0.5, 0, 0.1, 0, 0.3, 0, 0.1, 0],
      texture: [0.9, 0, 0, 0, 0.5, 0, 0, 0, 0.8, 0, 0, 0, 0.5, 0, 0, 0],
    },
  },
  indie: {
    label: "Indie",
    tempo: 112,
    energy: 0.6,
    swing: 0.05,
    density: { kick: 0.28, snare: 0.16, hats: 0.5, bass: 0.3, texture: 0.18 },
    sounds: { kick: "Live Kick", snare: "Room Snare", hats: "Open Tamb", bass: "Picked Bass", texture: "Jangle Gtr" },
    scale: ["E2", "G2", "A2", "B2", "D3"],
    chords: [["E3", "G3", "B3"], ["A3", "C4", "E4"], ["D3", "F#3", "A3"]],
    templates: {
      kick:  [0.9, 0.05, 0.1, 0.05, 0.4, 0.05, 0.2, 0.05, 0.8, 0.05, 0.15, 0.05, 0.4, 0.05, 0.25, 0.1],
      snare: [0.02, 0.05, 0.05, 0.05, 0.95, 0.02, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.95, 0.05, 0.05, 0.2],
      hats:  [0.75, 0.3, 0.7, 0.3, 0.75, 0.3, 0.7, 0.3, 0.75, 0.3, 0.7, 0.3, 0.75, 0.3, 0.7, 0.45],
      bass:  [0.9, 0.1, 0.3, 0.1, 0.5, 0.1, 0.3, 0.1, 0.8, 0.1, 0.3, 0.1, 0.5, 0.1, 0.35, 0.15],
      texture: [0.7, 0, 0, 0, 0.4, 0, 0, 0, 0.6, 0, 0, 0, 0.4, 0, 0.2, 0],
    },
  },
  electronic: {
    label: "Electronic",
    tempo: 124,
    energy: 0.85,
    swing: 0.02,
    density: { kick: 0.3, snare: 0.14, hats: 0.6, bass: 0.35, texture: 0.15 },
    sounds: { kick: "Punch Kick", snare: "Snap Clap", hats: "Crisp Hat", bass: "Acid Line", texture: "Pad Wash" },
    scale: ["A1", "C2", "D2", "E2", "G2"],
    chords: [["A2", "C3", "E3"], ["F2", "A2", "C3"]],
    templates: {
      kick:  [0.98, 0.02, 0.05, 0.02, 0.98, 0.02, 0.05, 0.02, 0.98, 0.02, 0.05, 0.02, 0.98, 0.02, 0.1, 0.05],
      snare: [0.02, 0.02, 0.05, 0.05, 0.9, 0.02, 0.05, 0.05, 0.02, 0.05, 0.05, 0.05, 0.9, 0.05, 0.05, 0.3],
      hats:  [0.3, 0.7, 0.3, 0.7, 0.3, 0.7, 0.3, 0.7, 0.3, 0.7, 0.3, 0.7, 0.3, 0.7, 0.3, 0.8],
      bass:  [0.8, 0.2, 0.6, 0.2, 0.3, 0.2, 0.7, 0.2, 0.8, 0.2, 0.6, 0.2, 0.3, 0.3, 0.7, 0.3],
      texture: [0.6, 0, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  pop: {
    label: "Pop",
    tempo: 108,
    energy: 0.7,
    swing: 0.04,
    density: { kick: 0.28, snare: 0.15, hats: 0.5, bass: 0.28, texture: 0.16 },
    sounds: { kick: "Clean Kick", snare: "Pop Snare", hats: "Bright Hat", bass: "Round Bass", texture: "Synth Bell" },
    scale: ["G2", "A2", "B2", "D3", "E3"],
    chords: [["G3", "B3", "D4"], ["E3", "G3", "B3"], ["C3", "E3", "G3"]],
    templates: {
      kick:  [0.95, 0.02, 0.1, 0.05, 0.5, 0.05, 0.3, 0.05, 0.9, 0.05, 0.1, 0.05, 0.5, 0.05, 0.3, 0.1],
      snare: [0.02, 0.02, 0.05, 0.05, 0.95, 0.02, 0.05, 0.05, 0.02, 0.05, 0.05, 0.05, 0.95, 0.05, 0.1, 0.2],
      hats:  [0.7, 0.3, 0.65, 0.3, 0.7, 0.3, 0.65, 0.35, 0.7, 0.3, 0.65, 0.3, 0.7, 0.35, 0.65, 0.4],
      bass:  [0.9, 0.05, 0.2, 0.1, 0.4, 0.1, 0.4, 0.1, 0.8, 0.1, 0.2, 0.1, 0.4, 0.1, 0.45, 0.15],
      texture: [0.7, 0, 0, 0, 0.3, 0, 0, 0, 0.6, 0, 0, 0, 0.3, 0, 0, 0],
    },
  },
  rock: {
    label: "Rock",
    tempo: 130,
    energy: 0.9,
    swing: 0,
    density: { kick: 0.3, snare: 0.18, hats: 0.55, bass: 0.35, texture: 0.14 },
    sounds: { kick: "Punchy Kick", snare: "Crack Snare", hats: "Ride Wash", bass: "Drive Bass", texture: "Power Chord" },
    scale: ["E2", "G2", "A2", "B2", "D3"],
    chords: [["E3", "B3", "E4"], ["G3", "D4", "G4"], ["A3", "E4", "A4"]],
    templates: {
      kick:  [0.95, 0.05, 0.2, 0.05, 0.4, 0.05, 0.6, 0.1, 0.9, 0.05, 0.2, 0.05, 0.4, 0.1, 0.5, 0.1],
      snare: [0.02, 0.05, 0.05, 0.05, 0.95, 0.05, 0.05, 0.1, 0.05, 0.05, 0.05, 0.05, 0.95, 0.05, 0.1, 0.3],
      hats:  [0.85, 0.4, 0.8, 0.4, 0.85, 0.4, 0.8, 0.4, 0.85, 0.4, 0.8, 0.4, 0.85, 0.4, 0.8, 0.5],
      bass:  [0.9, 0.2, 0.5, 0.2, 0.6, 0.2, 0.5, 0.2, 0.9, 0.2, 0.5, 0.2, 0.6, 0.25, 0.55, 0.25],
      texture: [0.75, 0, 0, 0, 0.3, 0, 0, 0, 0.65, 0, 0, 0, 0.35, 0, 0, 0],
    },
  },
  jazz: {
    label: "Jazz",
    tempo: 96,
    energy: 0.45,
    swing: 0.25,
    density: { kick: 0.18, snare: 0.14, hats: 0.4, bass: 0.32, texture: 0.2 },
    sounds: { kick: "Soft Kick", snare: "Brush Snare", hats: "Ride Cym", bass: "Upright", texture: "Jazz Keys" },
    scale: ["F2", "G2", "A2", "C3", "D3"],
    chords: [["F3", "A3", "C4", "E4"], ["D3", "F3", "A3", "C4"], ["G3", "B3", "D4", "F4"]],
    templates: {
      kick:  [0.6, 0.05, 0.1, 0.15, 0.1, 0.05, 0.3, 0.1, 0.5, 0.05, 0.15, 0.1, 0.1, 0.2, 0.15, 0.1],
      snare: [0.05, 0.1, 0.2, 0.1, 0.3, 0.1, 0.25, 0.15, 0.05, 0.15, 0.2, 0.1, 0.35, 0.1, 0.25, 0.2],
      hats:  [0.8, 0.1, 0.4, 0.5, 0.8, 0.1, 0.4, 0.5, 0.8, 0.1, 0.4, 0.5, 0.8, 0.1, 0.45, 0.5],
      bass:  [0.85, 0.1, 0.4, 0.15, 0.6, 0.1, 0.45, 0.15, 0.8, 0.1, 0.4, 0.15, 0.6, 0.15, 0.5, 0.2],
      texture: [0.6, 0, 0.2, 0, 0.3, 0, 0.25, 0, 0.55, 0, 0.2, 0, 0.35, 0, 0.25, 0],
    },
  },
};

export const GENRE_KEYS = Object.keys(GENRE_PROFILES);

// Map raw Spotify artist genre strings → our profile keys
const GENRE_MATCHERS = [
  { key: "hiphop", patterns: ["hip hop", "hip-hop", "rap", "trap", "drill", "grime"] },
  { key: "rnb", patterns: ["r&b", "rnb", "soul", "neo soul", "funk"] },
  { key: "classical", patterns: ["classical", "orchestra", "baroque", "romantic era", "opera", "piano", "soundtrack", "score"] },
  { key: "indie", patterns: ["indie", "folk", "singer-songwriter", "alt z", "bedroom"] },
  { key: "electronic", patterns: ["edm", "house", "techno", "electronic", "dubstep", "dnb", "drum and bass", "trance", "electro"] },
  { key: "pop", patterns: ["pop", "k-pop", "dance pop"] },
  { key: "rock", patterns: ["rock", "metal", "punk", "grunge", "emo"] },
  { key: "jazz", patterns: ["jazz", "bossa", "swing", "blues"] },
];

export function classifyGenre(raw) {
  const g = raw.toLowerCase();
  for (const m of GENRE_MATCHERS) {
    if (m.patterns.some((p) => g.includes(p))) return m.key;
  }
  return null;
}

// Build a weighted blend profile from {genreKey: weight} map
export function blendProfile(weights) {
  const entries = Object.entries(weights).filter(([k, w]) => w > 0 && GENRE_PROFILES[k]);
  const total = entries.reduce((s, [, w]) => s + w, 0) || 1;
  const norm = entries.map(([k, w]) => [k, w / total]).sort((a, b) => b[1] - a[1]);

  const dominant = GENRE_PROFILES[norm[0][0]];
  const secondary = norm[1] && norm[1][1] >= 0.1 ? GENRE_PROFILES[norm[1][0]] : null;

  const blend = { tempo: 0, energy: 0, swing: 0 };
  const templates = { kick: new Array(16).fill(0), snare: new Array(16).fill(0), hats: new Array(16).fill(0), bass: new Array(16).fill(0), texture: new Array(16).fill(0) };

  for (const [k, w] of norm) {
    const p = GENRE_PROFILES[k];
    blend.tempo += p.tempo * w;
    blend.energy += p.energy * w;
    blend.swing += p.swing * w;
    for (const track of Object.keys(templates)) {
      for (let i = 0; i < 16; i++) templates[track][i] += p.templates[track][i] * w;
    }
  }

  // Sounds: dominant genre owns the rhythm section; secondary genre colors the texture layer.
  const sounds = { ...dominant.sounds };
  if (secondary) sounds.texture = secondary.sounds.texture;

  return {
    tempo: Math.round(blend.tempo),
    energy: blend.energy,
    swing: blend.swing,
    templates,
    sounds,
    scale: dominant.scale,
    chords: secondary ? secondary.chords : dominant.chords,
    genreBlend: norm.map(([k, w]) => ({ key: k, label: GENRE_PROFILES[k].label, weight: w })),
    dominantKey: norm[0][0],
    secondaryKey: secondary ? norm[1][0] : null,
  };
}
