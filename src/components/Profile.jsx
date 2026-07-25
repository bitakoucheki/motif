import React, { useMemo } from "react";
import { blendProfile } from "../lib/profiles";

export default function Profile({ listening, onContinue }) {
  const profile = useMemo(() => blendProfile(listening.weights), [listening]);

  const top = profile.genreBlend.slice(0, 4);
  const energyPct = Math.round(profile.energy * 100);
  const dominant = profile.genreBlend[0];
  const secondary = profile.genreBlend[1];

  const insight = secondary && secondary.weight >= 0.1
    ? <>Your taste blends <b>{dominant.label.toLowerCase()} drive</b> with a clear <b>{secondary.label.toLowerCase()} undercurrent</b> — so Motif is building you a {profile.tempo} BPM pattern with {dominant.label.toLowerCase()} rhythm at the core, colored by a {secondary.label.toLowerCase()}-flavored texture layer.</>
    : <>You listen almost purely to <b>{dominant.label.toLowerCase()}</b> — so Motif is building you a focused {profile.tempo} BPM pattern straight from that sound.</>;

  return (
    <>
      <div className="topbar">
        <div className="logo">motif<span className="dot">.</span></div>
        <div className="step-tag">Step 1 / 2 — Your profile</div>
      </div>
      <div className="profile-page">
        <h2>Here's how you listen.</h2>
        <p className="profile-lead">
          Analyzed from {listening.sourceName}. This profile drives every choice in your
          generated beat — sounds, tempo, and rhythm density.
        </p>

        <div className="cards">
          <div className="card">
            <div className="clabel">Genre blend</div>
            {top.map((g) => (
              <div className="genre-row" key={g.key}>
                <div className="genre-name">{g.label}</div>
                <div className="gbar"><div style={{ width: `${Math.round(g.weight * 100)}%` }} /></div>
                <div className="genre-pct">{Math.round(g.weight * 100)}%</div>
              </div>
            ))}
            {listening.topArtists?.length > 0 && (
              <div className="artists-line">
                Top artists: <b>{listening.topArtists.slice(0, 4).join(", ")}</b>
              </div>
            )}
          </div>

          <div className="card">
            <div className="clabel">Energy</div>
            <div><span className="big-stat">{energyPct}</span><span className="stat-unit">/100</span></div>
            <div className="stat-desc">
              {energyPct >= 70
                ? "You lean high-energy. Your beat gets a denser, punchier rhythm."
                : energyPct >= 45
                ? "Balanced energy. Your beat gets groove with room to breathe."
                : "You listen low and slow. Your beat gets space, weight, and patience."}
            </div>
          </div>

          <div className="card">
            <div className="clabel">Tempo center</div>
            <div><span className="big-stat">{profile.tempo}</span><span className="stat-unit">bpm</span></div>
            <div className="stat-desc">
              The tempo your taste clusters around — your beat starts here, and you can pull it anywhere.
            </div>
          </div>
        </div>

        <div className="insight">
          <div className="ico">◎</div>
          <p>{insight}</p>
        </div>

        <div className="continue">
          <button className="btn btn-primary" onClick={onContinue}>Build my beat →</button>
        </div>
      </div>
    </>
  );
}
