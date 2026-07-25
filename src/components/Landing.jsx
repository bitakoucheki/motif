import React, { useState, useEffect } from "react";

const TRACK_COLORS = ["var(--c-kick)", "var(--c-snare)", "var(--c-hats)", "var(--c-bass)", "var(--c-texture)"];

// A slowly-evolving decorative grid: cells light up in shifting patterns
function HeroGrid() {
  const [lit, setLit] = useState(() => new Set([0, 9, 14, 19, 21, 28]));

  useEffect(() => {
    const id = setInterval(() => {
      setLit(() => {
        const next = new Set();
        const count = 6 + Math.floor(Math.random() * 4);
        while (next.size < count) next.add(Math.floor(Math.random() * 32));
        return next;
      });
    }, 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-grid" aria-hidden="true">
      {[...Array(8)].map((_, c) => (
        <div className="hcol" key={c}>
          {[...Array(4)].map((_, r) => {
            const idx = c * 4 + r;
            const on = lit.has(idx);
            const color = TRACK_COLORS[(c + r) % TRACK_COLORS.length];
            return (
              <div
                key={r}
                className={`hcell${on ? " lit" : ""}`}
                style={on ? { background: color, boxShadow: `0 0 14px ${color.replace("var(", "").replace(")", "") === color ? color : ""}`, boxShadow: `0 0 14px 0 color-mix(in srgb, ${color} 55%, transparent)` } : undefined}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function Landing({ onSample, onSpotify, samples, error }) {
  const [showSamples, setShowSamples] = useState(false);

  return (
    <div className="landing">
      <div className="topbar" style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        <div className="logo">motif<span className="dot">.</span></div>
      </div>

      <HeroGrid />

      <h1 className="hero-title">
        Start making music from the music <em>you already love.</em>
      </h1>
      <p className="hero-sub">
        Motif reads your listening taste and generates a personalized beat you can
        shape, remix, and share. No blank canvas. No experience needed.
      </p>

      {!showSamples ? (
        <>
          <div className="cta-row">
            <button className="btn btn-primary" onClick={() => setShowSamples(true)}>
              Try it with sample data
            </button>
            <button className="btn btn-ghost" onClick={onSpotify}>
              Connect Spotify
            </button>
          </div>
          <div className="tiny-note">Sample mode needs nothing — hear a beat in 10 seconds.</div>
        </>
      ) : (
        <>
          <div className="tiny-note" style={{ marginTop: 0, marginBottom: 4 }}>Pick a listener to become:</div>
          <div className="sample-picker">
            {samples.map((s) => (
              <button key={s.id} className="sample-card" onClick={() => onSample(s)}>
                <div className="sname">{s.name}</div>
                <div className="sdesc">{s.description}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {error && <div className="err-note">{error}</div>}
    </div>
  );
}
