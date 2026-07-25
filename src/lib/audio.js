// Audio engine v1.1
// - Instrument library: each track has selectable patches with genuinely
//   different synthesis (layered where needed), not one shared timbre.
// - Channel strips: per-track gain + pan.
// - Master chain: 3-band EQ -> saturation -> glue compressor -> limiter,
//   with a master reverb send ("Space") kept intentionally low by default.
// - Humanize: per-hit timing and velocity variation. Swing on transport.
// - Lo-fi character: optional vinyl crackle layer.

import * as Tone from "tone";
import { TRACKS } from "./pattern";

let engine = null;

// ---------- Instrument library ----------
// Every patch is a factory returning { trigger(time, note, vel), dispose() }.

const LIB = {
  kick: {
    "808 Sub": (out) => {
      const body = new Tone.MembraneSynth({
        pitchDecay: 0.09, octaves: 9,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.7, sustain: 0.01, release: 0.5 },
      }).connect(out);
      body.volume.value = -3;
      const click = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.015, sustain: 0 } }).connect(out);
      click.volume.value = -22;
      return {
        trigger: (t, _n, v) => { body.triggerAttackRelease("B0", "8n", t, v); click.triggerAttackRelease("64n", t, v * 0.7); },
        dispose: () => { body.dispose(); click.dispose(); },
      };
    },
    "Punch Kick": (out) => {
      const body = new Tone.MembraneSynth({
        pitchDecay: 0.025, octaves: 6,
        envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.1 },
      }).connect(out);
      body.volume.value = -3;
      const click = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.03, sustain: 0 } });
      const clickFilter = new Tone.Filter(3500, "bandpass").connect(out);
      click.connect(clickFilter); click.volume.value = -14;
      return {
        trigger: (t, _n, v) => { body.triggerAttackRelease("C2", "16n", t, v); click.triggerAttackRelease("64n", t, v); },
        dispose: () => { body.dispose(); click.dispose(); clickFilter.dispose(); },
      };
    },
    "Lo-fi Thump": (out) => {
      const lp = new Tone.Filter(900, "lowpass").connect(out);
      const body = new Tone.MembraneSynth({
        pitchDecay: 0.05, octaves: 5,
        envelope: { attack: 0.004, decay: 0.35, sustain: 0, release: 0.2 },
      }).connect(lp);
      body.volume.value = -4;
      return { trigger: (t, _n, v) => body.triggerAttackRelease("C2", "8n", t, v * 0.9), dispose: () => { body.dispose(); lp.dispose(); } };
    },
    "Timpani": (out) => {
      const verb = new Tone.Reverb({ decay: 1.6, wet: 0.25 }).connect(out);
      const body = new Tone.MembraneSynth({
        pitchDecay: 0.12, octaves: 3,
        envelope: { attack: 0.002, decay: 0.9, sustain: 0.02, release: 0.8 },
      }).connect(verb);
      body.volume.value = -6;
      return { trigger: (t, _n, v) => body.triggerAttackRelease("G1", "4n", t, v * 0.85), dispose: () => { body.dispose(); verb.dispose(); } };
    },
  },

  snare: {
    "Tight Clap": (out) => {
      const bp = new Tone.Filter(1600, "bandpass", -12).connect(out);
      const noise = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.11, sustain: 0 } }).connect(bp);
      noise.volume.value = -6;
      return {
        // three micro-bursts = clap character
        trigger: (t, _n, v) => { noise.triggerAttackRelease("32n", t, v * 0.7); noise.triggerAttackRelease("32n", t + 0.012, v * 0.5); noise.triggerAttackRelease("16n", t + 0.026, v); },
        dispose: () => { noise.dispose(); bp.dispose(); },
      };
    },
    "Crack Snare": (out) => {
      const noise = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.16, sustain: 0 } }).connect(out);
      noise.volume.value = -7;
      const tone = new Tone.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.001, decay: 0.08, sustain: 0 } }).connect(out);
      tone.volume.value = -14;
      return {
        trigger: (t, _n, v) => { noise.triggerAttackRelease("16n", t, v); tone.triggerAttackRelease("E3", "16n", t, v * 0.8); },
        dispose: () => { noise.dispose(); tone.dispose(); },
      };
    },
    "Rimshot": (out) => {
      const tone = new Tone.Synth({ oscillator: { type: "square" }, envelope: { attack: 0.001, decay: 0.045, sustain: 0 } });
      const bp = new Tone.Filter(2200, "bandpass").connect(out);
      tone.connect(bp); tone.volume.value = -8;
      return { trigger: (t, _n, v) => tone.triggerAttackRelease("A4", "32n", t, v), dispose: () => { tone.dispose(); bp.dispose(); } };
    },
    "Brush": (out) => {
      const noise = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.008, decay: 0.28, sustain: 0 } });
      const lp = new Tone.Filter(5000, "lowpass").connect(out);
      noise.connect(lp); noise.volume.value = -12;
      return { trigger: (t, _n, v) => noise.triggerAttackRelease("8n", t, v * 0.8), dispose: () => { noise.dispose(); lp.dispose(); } };
    },
  },

  hats: {
    "Closed 909": (out) => {
      const hp = new Tone.Filter(8500, "highpass").connect(out);
      const noise = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.045, sustain: 0 } }).connect(hp);
      noise.volume.value = -14;
      return { trigger: (t, _n, v) => noise.triggerAttackRelease("32n", t, v), dispose: () => { noise.dispose(); hp.dispose(); } };
    },
    "Crisp Hat": (out) => {
      const metal = new Tone.MetalSynth({
        frequency: 260, envelope: { attack: 0.001, decay: 0.05, release: 0.02 },
        harmonicity: 5.1, modulationIndex: 32, resonance: 5500, octaves: 1.2,
      }).connect(out);
      metal.volume.value = -20;
      return { trigger: (t, _n, v) => metal.triggerAttackRelease("32n", t, v), dispose: () => metal.dispose() };
    },
    "Ride": (out) => {
      const metal = new Tone.MetalSynth({
        frequency: 190, envelope: { attack: 0.002, decay: 0.6, release: 0.4 },
        harmonicity: 4.1, modulationIndex: 20, resonance: 4200, octaves: 1.6,
      }).connect(out);
      metal.volume.value = -22;
      return { trigger: (t, _n, v) => metal.triggerAttackRelease("8n", t, v * 0.8), dispose: () => metal.dispose() };
    },
    "Shaker": (out) => {
      const bp = new Tone.Filter(6500, "bandpass").connect(out);
      const noise = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.015, decay: 0.09, sustain: 0 } }).connect(bp);
      noise.volume.value = -14;
      return { trigger: (t, _n, v) => noise.triggerAttackRelease("16n", t, v * 0.9), dispose: () => { noise.dispose(); bp.dispose(); } };
    },
  },

  bass: {
    "808 Glide": (out) => {
      const s = new Tone.MonoSynth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.004, decay: 0.4, sustain: 0.5, release: 0.4 },
        filter: { type: "lowpass", frequency: 350, Q: 1 },
        filterEnvelope: { attack: 0.001, decay: 0.3, sustain: 0.4, baseFrequency: 60, octaves: 2.2 },
        portamento: 0.07,
      }).connect(out);
      const dist = new Tone.Distortion(0.15);
      s.disconnect(); s.connect(dist); dist.connect(out);
      s.volume.value = -5;
      return { trigger: (t, n, v) => s.triggerAttackRelease(n, "8n", t, v), dispose: () => { s.dispose(); dist.dispose(); } };
    },
    "Electric Pluck": (out) => {
      const s = new Tone.MonoSynth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.003, decay: 0.18, sustain: 0.15, release: 0.2 },
        filter: { type: "lowpass", frequency: 900, Q: 2 },
        filterEnvelope: { attack: 0.001, decay: 0.12, sustain: 0.2, baseFrequency: 220, octaves: 2.5 },
      }).connect(out);
      s.volume.value = -6;
      return { trigger: (t, n, v) => s.triggerAttackRelease(n, "16n", t, v), dispose: () => s.dispose() };
    },
    "Upright": (out) => {
      const s = new Tone.MonoSynth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.25, release: 0.3 },
        filter: { type: "lowpass", frequency: 500, Q: 0.5 },
        filterEnvelope: { attack: 0.005, decay: 0.2, sustain: 0.3, baseFrequency: 120, octaves: 1.8 },
      }).connect(out);
      const thump = new Tone.NoiseSynth({ noise: { type: "brown" }, envelope: { attack: 0.002, decay: 0.03, sustain: 0 } }).connect(out);
      thump.volume.value = -24; s.volume.value = -6;
      return {
        trigger: (t, n, v) => { s.triggerAttackRelease(n, "8n", t, v * 0.9); thump.triggerAttackRelease("64n", t, v * 0.5); },
        dispose: () => { s.dispose(); thump.dispose(); },
      };
    },
    "Acid Saw": (out) => {
      const s = new Tone.MonoSynth({
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.002, decay: 0.15, sustain: 0.3, release: 0.15 },
        filter: { type: "lowpass", frequency: 600, Q: 6 },
        filterEnvelope: { attack: 0.002, decay: 0.14, sustain: 0.15, baseFrequency: 120, octaves: 3.5 },
        portamento: 0.03,
      }).connect(out);
      s.volume.value = -8;
      return { trigger: (t, n, v) => s.triggerAttackRelease(n, "16n", t, v), dispose: () => s.dispose() };
    },
  },

  texture: {
    "Warm Strings": (out) => {
      const verb = new Tone.Reverb({ decay: 3.2, wet: 0.35 }).connect(out);
      const s = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.5, decay: 0.4, sustain: 0.7, release: 1.8 },
      });
      const lp = new Tone.Filter(2400, "lowpass").connect(verb);
      s.connect(lp); s.volume.value = -18;
      return { trigger: (t, chord, v) => s.triggerAttackRelease(chord, "2n", t, v * 0.8), dispose: () => { s.dispose(); lp.dispose(); verb.dispose(); } };
    },
    "EP Chords": (out) => {
      const chorus = new Tone.Chorus(3.5, 2.5, 0.4).connect(out).start();
      const s = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2, modulationIndex: 4,
        envelope: { attack: 0.01, decay: 0.6, sustain: 0.25, release: 0.9 },
        modulationEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 },
      }).connect(chorus);
      s.volume.value = -14;
      return { trigger: (t, chord, v) => s.triggerAttackRelease(chord, "2n", t, v * 0.85), dispose: () => { s.dispose(); chorus.dispose(); } };
    },
    "Vinyl Keys": (out) => {
      const lp = new Tone.Filter(1800, "lowpass").connect(out);
      const s = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 1.5, modulationIndex: 3,
        envelope: { attack: 0.015, decay: 0.5, sustain: 0.2, release: 0.7 },
      }).connect(lp);
      s.volume.value = -14;
      return { trigger: (t, chord, v) => s.triggerAttackRelease(chord, "2n", t, v * 0.8), dispose: () => { s.dispose(); lp.dispose(); } };
    },
    "Pad Wash": (out) => {
      const verb = new Tone.Reverb({ decay: 4.5, wet: 0.45 }).connect(out);
      const s = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.8, decay: 0.5, sustain: 0.8, release: 2.5 },
      }).connect(verb);
      s.volume.value = -16;
      return { trigger: (t, chord, v) => s.triggerAttackRelease(chord, "1n", t, v * 0.7), dispose: () => { s.dispose(); verb.dispose(); } };
    },
    "Jazz Keys": (out) => {
      const s = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3, modulationIndex: 6,
        envelope: { attack: 0.008, decay: 0.4, sustain: 0.15, release: 0.6 },
        modulationEnvelope: { attack: 0.005, decay: 0.2, sustain: 0.05, release: 0.3 },
      }).connect(out);
      s.volume.value = -15;
      return { trigger: (t, chord, v) => s.triggerAttackRelease(chord, "4n", t, v * 0.85), dispose: () => s.dispose() };
    },
    "Power Chord": (out) => {
      const dist = new Tone.Distortion(0.5).connect(out);
      const s = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.005, decay: 0.3, sustain: 0.3, release: 0.4 },
      }).connect(dist);
      s.volume.value = -16;
      return { trigger: (t, chord, v) => s.triggerAttackRelease(chord, "4n", t, v * 0.9), dispose: () => { s.dispose(); dist.dispose(); } };
    },
  },
};

export const INSTRUMENT_OPTIONS = Object.fromEntries(
  Object.entries(LIB).map(([track, patches]) => [track, Object.keys(patches)])
);

// Map legacy profile sound names → library patch names
const SOUND_ALIASES = {
  kick: { "Soft Thump": "Lo-fi Thump", "Live Kick": "Punch Kick", "Punchy Kick": "Punch Kick", "Clean Kick": "Punch Kick", "Soft Kick": "Lo-fi Thump" },
  snare: { "Room Snare": "Crack Snare", "Pop Snare": "Crack Snare", "Snap Clap": "Tight Clap", "Brush Snare": "Brush" },
  hats: { "Loose Hat": "Shaker", "Open Tamb": "Shaker", "Bright Hat": "Crisp Hat", "Ride Wash": "Ride", "Ride Cym": "Ride" },
  bass: { "Warm Sub": "808 Glide", "Cello Pizz": "Upright", "Picked Bass": "Electric Pluck", "Round Bass": "Electric Pluck", "Drive Bass": "Acid Saw", "Acid Line": "Acid Saw" },
  texture: { "Jangle Gtr": "Jazz Keys", "Synth Bell": "EP Chords" },
};

export function resolvePatch(track, soundName) {
  if (LIB[track][soundName]) return soundName;
  return SOUND_ALIASES[track]?.[soundName] || Object.keys(LIB[track])[0];
}

// ---------- Engine ----------

export function initEngine(config, getState, onStep) {
  disposeEngine();
  const { instruments, mix } = config;

  // Master chain: EQ3 -> drive -> glue comp -> limiter -> out
  const limiter = new Tone.Limiter(-1).toDestination();
  const comp = new Tone.Compressor({ threshold: -16, ratio: 2.5, attack: 0.01, release: 0.15 }).connect(limiter);
  const drive = new Tone.Distortion(mix.drive).connect(comp);
  drive.wet.value = Math.min(mix.drive * 2, 1);
  const eq = new Tone.EQ3({ low: mix.low, mid: mix.mid, high: mix.high }).connect(drive);

  // Space: master reverb in parallel, low default
  const spaceVerb = new Tone.Reverb({ decay: 2.2, wet: 1 }).connect(comp);
  const spaceSend = new Tone.Gain(mix.space).connect(spaceVerb);
  eq.connect(spaceSend);

  // Vinyl crackle bed (only audible when enabled)
  const crackleFilter = new Tone.Filter(3200, "bandpass").connect(comp);
  const crackleGain = new Tone.Gain(mix.crackle ? 0.012 : 0).connect(crackleFilter);
  const crackle = new Tone.Noise("pink").connect(crackleGain);
  crackle.start();

  // Per-track channel strips
  const strips = {};
  const patches = {};
  for (const tr of TRACKS) {
    const pan = new Tone.Panner(config.pans[tr]).connect(eq);
    const gain = new Tone.Gain(dbToGain(config.gains[tr])).connect(pan);
    strips[tr] = { gain, pan };
    patches[tr] = LIB[tr][resolvePatch(tr, instruments[tr])](gain);
  }

  const seq = new Tone.Sequence(
    (time, step) => {
      const { steps, notes, mutes, humanize } = getState();
      for (const tr of TRACKS) {
        if (!steps[tr][step] || mutes[tr]) continue;
        const jitter = humanize > 0 ? (Math.random() - 0.5) * humanize * 0.02 : 0;
        const vel = 0.9 - (humanize > 0 ? Math.random() * humanize * 0.35 : 0);
        const t = time + Math.max(jitter, 0); // never schedule in the past
        if (tr === "bass") patches.bass.trigger(t, (notes.bass && notes.bass[step]) || "C2", vel);
        else if (tr === "texture") patches.texture.trigger(t, (notes.texture && notes.texture[step]) || ["C3", "E3", "G3"], vel);
        else patches[tr].trigger(t, null, vel);
      }
      Tone.Draw.schedule(() => onStep(step), time);
    },
    [...Array(16).keys()],
    "16n"
  );

  Tone.Transport.bpm.value = config.tempo;
  Tone.Transport.swing = config.swing;
  Tone.Transport.swingSubdivision = "16n";
  seq.start(0);

  engine = { seq, strips, patches, eq, drive, spaceSend, crackleGain, _nodes: [limiter, comp, drive, eq, spaceVerb, spaceSend, crackleFilter, crackleGain, crackle] };
  return engine;
}

function dbToGain(db) { return Math.pow(10, db / 20); }

// ---------- Live parameter updates (no engine rebuild) ----------

export function setTrackGain(track, db) { engine?.strips[track].gain.gain.rampTo(dbToGain(db), 0.05); }
export function setTrackPan(track, pan) { engine?.strips[track].pan.pan.rampTo(pan, 0.05); }
export function setEQ(band, db) { if (engine) engine.eq[band].rampTo(db, 0.05); }
export function setSpace(amount) { engine?.spaceSend.gain.rampTo(amount, 0.1); }
export function setDrive(amount) {
  if (!engine) return;
  engine.drive.distortion = amount;
  engine.drive.wet.rampTo(Math.min(amount * 2, 1), 0.1);
}
export function setSwing(amount) { Tone.Transport.swing = amount; }
export function setCrackle(on) { engine?.crackleGain.gain.rampTo(on ? 0.012 : 0, 0.2); }

export function swapInstrument(track, patchName, currentGainNode) {
  if (!engine) return;
  engine.patches[track].dispose();
  engine.patches[track] = LIB[track][resolvePatch(track, patchName)](engine.strips[track].gain);
}

export async function play() { await Tone.start(); Tone.Transport.start(); }
export function stop() { Tone.Transport.stop(); }
export function setTempo(bpm) { Tone.Transport.bpm.rampTo(bpm, 0.1); }

export function disposeEngine() {
  if (!engine) return;
  Tone.Transport.stop();
  engine.seq.dispose();
  for (const tr of TRACKS) { engine.patches[tr].dispose(); engine.strips[tr].gain.dispose(); engine.strips[tr].pan.dispose(); }
  engine._nodes.forEach((n) => { try { n.dispose(); } catch {} });
  engine = null;
}
