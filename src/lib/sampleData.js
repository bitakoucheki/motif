// Sample listening profiles for demo mode — lets anyone experience the
// full flow without a Spotify account. Each is designed to showcase a
// distinctly different generated result.

export const SAMPLE_PROFILES = [
  {
    id: "blend",
    name: "The Blend",
    description: "Hip-hop head with a classical streak",
    weights: { hiphop: 0.55, classical: 0.2, rnb: 0.15, indie: 0.1 },
    topArtists: ["Kendrick Lamar", "SZA", "Ludovico Einaudi", "Frank Ocean", "Max Richter"],
  },
  {
    id: "latenight",
    name: "Late Night",
    description: "Slow jams and smoky keys",
    weights: { rnb: 0.5, jazz: 0.3, hiphop: 0.2 },
    topArtists: ["Daniel Caesar", "Robert Glasper", "H.E.R.", "Tom Misch", "Snoh Aalegra"],
  },
  {
    id: "voltage",
    name: "Voltage",
    description: "Festival energy, four on the floor",
    weights: { electronic: 0.6, pop: 0.25, rock: 0.15 },
    topArtists: ["Fred again..", "Charli XCX", "Justice", "Peggy Gou", "The Chemical Brothers"],
  },
];
