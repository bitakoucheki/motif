import React, { useState, useEffect, useRef } from "react";
import { blendProfile } from "./lib/profiles";
import { generatePattern, TRACKS, encodeState, decodeState } from "./lib/pattern";
import {
  initEngine, play, stop, setTempo, disposeEngine, resolvePatch,
  setTrackGain, setTrackPan, setEQ, setSpace, setDrive, setSwing, setCrackle, swapInstrument,
} from "./lib/audio";
import { spotifyConfigured, startAuth, handleCallback, fetchListeningProfile } from "./lib/spotify";
import { SAMPLE_PROFILES } from "./lib/sampleData";
import Landing from "./components/Landing";
import Profile from "./components/Profile";
import Studio from "./components/Studio";
import "./styles.css";

const DEFAULT_MIX = { low: 0, mid: 0, high: 0, space: 0.08, drive: 0, swing: 0, humanize: 0.3, crackle: false };
const DEFAULT_GAINS = { kick: 0, snare: 0, hats: 0, bass: 0, texture: 0 };
const DEFAULT_PANS = { kick: 0, snare: 0, hats: 0.15, bass: 0, texture: -0.15 };

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [listening, setListening] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pattern, setPattern] = useState(null);
  const [tempo, setTempoState] = useState(92);
  const [mutes, setMutes] = useState({ kick: false, snare: false, hats: false, bass: false, texture: false });
  const [instruments, setInstruments] = useState(null);
  const [gains, setGains] = useState(DEFAULT_GAINS);
  const [pans, setPans] = useState(DEFAULT_PANS);
  const [mix, setMix] = useState(DEFAULT_MIX);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(-1);
  const [palette, setPalette] = useState("blend");
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [engineKey, setEngineKey] = useState(0); // bump to force engine rebuild

  const stateRef = useRef({});
  stateRef.current = {
    steps: pattern?.steps || {}, notes: pattern?.notes || {}, mutes, humanize: mix.humanize,
  };

  useEffect(() => {
    const shared = window.location.hash.slice(1);
    if (shared) {
      const decoded = decodeState(shared);
      if (decoded) { loadFromShared(decoded); return; }
    }
    if (new URLSearchParams(window.location.search).get("code")) {
      setScreen("loading");
      handleCallback()
        .then(async (token) => {
          if (!token) throw new Error("Auth failed");
          const data = await fetchListeningProfile(token);
          setListening({ ...data, sourceName: "your Spotify" });
          setScreen("profile");
        })
        .catch(() => {
          setError("Spotify connection failed. Try again, or use sample data.");
          setScreen("landing");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyProfile = (prof, pat, keepMix = false) => {
    setProfile(prof);
    setPattern(pat);
    setTempoState(prof.tempo);
    setInstruments({
      kick: resolvePatch("kick", prof.sounds.kick),
      snare: resolvePatch("snare", prof.sounds.snare),
      hats: resolvePatch("hats", prof.sounds.hats),
      bass: resolvePatch("bass", prof.sounds.bass),
      texture: resolvePatch("texture", prof.sounds.texture),
    });
    if (!keepMix) {
      // Genre-flavored mix defaults
      const isJazz = prof.dominantKey === "jazz";
      const isLofi = isJazz || prof.sounds.texture === "Vinyl Keys";
      setMix({
        ...DEFAULT_MIX,
        swing: prof.swing,
        space: prof.dominantKey === "classical" ? 0.16 : isJazz ? 0.1 : 0.06,
        crackle: isLofi,
        humanize: isJazz ? 0.5 : 0.3,
      });
    }
    setEngineKey((k) => k + 1);
  };

  const loadFromShared = (decoded) => {
    const prof = blendProfile(decoded.genreWeights);
    prof.tempo = decoded.tempo;
    const pat = generatePattern(prof, decoded.seed);
    pat.steps = decoded.steps;
    setListening({ weights: decoded.genreWeights, topArtists: [], sourceName: "a shared pattern" });
    applyProfile(prof, pat);
    setScreen("studio");
  };

  const startSample = (sample) => {
    setScreen("loading");
    setTimeout(() => {
      setListening({ weights: sample.weights, topArtists: sample.topArtists, sourceName: `sample: ${sample.name}` });
      setScreen("profile");
    }, 900);
  };

  const startSpotify = () => {
    if (!spotifyConfigured()) {
      setError("Spotify isn't configured on this deployment yet — try sample data instead.");
      return;
    }
    startAuth();
  };

  const buildBeat = () => {
    const prof = blendProfile(listening.weights);
    applyProfile(prof, generatePattern(prof));
    setPalette("blend");
    setScreen("studio");
  };

  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    if (screen !== "studio" || !profile || !instruments) return;
    initEngine(
      { instruments, mix, gains, pans, tempo, swing: mix.swing },
      () => stateRef.current,
      (step) => setPlayhead(step)
    );
    if (isPlayingRef.current) play();
    return () => { disposeEngine(); setPlayhead(-1); };
    // Rebuild only on screen entry / engineKey bumps — live params update via setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, engineKey]);

  const togglePlay = async () => {
    if (isPlaying) { stop(); setIsPlaying(false); setPlayhead(-1); }
    else { await play(); setIsPlaying(true); }
  };

  const toggleStep = (track, i) => {
    setPattern((p) => {
      const steps = { ...p.steps, [track]: p.steps[track].map((v, j) => (j === i ? !v : v)) };
      let notes = p.notes;
      if (!p.steps[track][i]) {
        if (track === "bass") notes = { ...notes, bass: notes.bass.map((n, j) => (j === i ? profile.scale[0] : n)) };
        else if (track === "texture") notes = { ...notes, texture: notes.texture.map((n, j) => (j === i ? profile.chords[0] : n)) };
      }
      return { ...p, steps, notes };
    });
  };

  const toggleMute = (track) => setMutes((m) => ({ ...m, [track]: !m[track] }));

  const changeTempo = (delta) => {
    setTempoState((t) => {
      const next = Math.min(180, Math.max(50, t + delta));
      setTempo(next);
      return next;
    });
  };

  const regenerate = () => setPattern(generatePattern(profile, Math.floor(Math.random() * 1e9)));

  // FIX: palette switches now adopt the genre's own tempo, sounds, swing, and character
  const switchPalette = (key) => {
    setPalette(key);
    const weights = key === "blend" ? listening.weights : { [key]: 1 };
    const prof = blendProfile(weights);
    applyProfile(prof, generatePattern(prof));
  };

  const changeInstrument = (track, patchName) => {
    setInstruments((ins) => ({ ...ins, [track]: patchName }));
    swapInstrument(track, patchName);
  };

  const changeGain = (track, db) => {
    setGains((g) => ({ ...g, [track]: db }));
    setTrackGain(track, db);
  };

  const changePan = (track, val) => {
    setPans((p) => ({ ...p, [track]: val }));
    setTrackPan(track, val);
  };

  const changeMix = (key, val) => {
    setMix((m) => ({ ...m, [key]: val }));
    if (key === "low" || key === "mid" || key === "high") setEQ(key, val);
    else if (key === "space") setSpace(val);
    else if (key === "drive") setDrive(val);
    else if (key === "swing") setSwing(val);
    else if (key === "crackle") setCrackle(val);
    // humanize is read live from stateRef
  };

  const share = async () => {
    const hash = encodeState({
      tempo, steps: pattern.steps,
      genreWeights: palette === "blend" ? listening.weights : { [palette]: 1 },
      seed: pattern.seed,
    });
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    try { await navigator.clipboard.writeText(url); showToast("Link copied — anyone who opens it hears your beat."); }
    catch { showToast(url); }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  const baseBlend = React.useMemo(
    () => (listening ? blendProfile(listening.weights).genreBlend : []),
    [listening]
  );

  const paletteOptions = baseBlend.length
    ? [{ key: "blend", label: "Your blend" },
       { key: baseBlend[0]?.key, label: `Pure ${baseBlend[0]?.label?.toLowerCase()}` },
       ...(baseBlend[1] ? [{ key: baseBlend[1].key, label: `Pure ${baseBlend[1].label.toLowerCase()}` }] : []),
       { key: "jazz", label: "Lo-fi jazz" }]
      .filter((o, i, arr) => o.key && arr.findIndex((x) => x.key === o.key) === i)
    : [];

  return (
    <div className="app">
      {screen === "landing" && (
        <Landing onSample={startSample} onSpotify={startSpotify} samples={SAMPLE_PROFILES} error={error} />
      )}
      {screen === "loading" && (
        <div className="loading-screen">
          <div className="logo">motif<span className="dot">.</span></div>
          <div className="loading-dots"><div /><div /><div /><div /></div>
          <div className="loading-text">Reading your listening taste…</div>
        </div>
      )}
      {screen === "profile" && listening && (
        <Profile listening={listening} onContinue={buildBeat} />
      )}
      {screen === "studio" && profile && pattern && instruments && (
        <Studio
          profile={profile} pattern={pattern} tempo={tempo} mutes={mutes}
          instruments={instruments} gains={gains} pans={pans} mix={mix}
          isPlaying={isPlaying} playhead={playhead}
          palette={palette} paletteOptions={paletteOptions}
          onTogglePlay={togglePlay} onToggleStep={toggleStep} onToggleMute={toggleMute}
          onTempo={changeTempo} onRegenerate={regenerate} onPalette={switchPalette} onShare={share}
          onInstrument={changeInstrument} onGain={changeGain} onPan={changePan} onMix={changeMix}
          tracks={TRACKS}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
