import React, { useState } from "react";
import { INSTRUMENT_OPTIONS } from "../lib/audio";

const TRACK_META = {
  kick: { label: "Kick", color: "var(--c-kick)" },
  snare: { label: "Snare", color: "var(--c-snare)" },
  hats: { label: "Hats", color: "var(--c-hats)" },
  bass: { label: "Bass", color: "var(--c-bass)" },
  texture: { label: "Texture", color: "var(--c-texture)" },
};

// Simple EQ curve: three points (low/mid/high gains in dB, ±12) → smooth SVG path
function EQCurve({ low, mid, high }) {
  const W = 260, H = 90, cy = H / 2;
  const y = (db) => cy - (db / 12) * (H / 2 - 8);
  const pts = [[0, y(low)], [W * 0.25, y(low)], [W * 0.5, y(mid)], [W * 0.75, y(high)], [W, y(high)]];
  const d = `M ${pts[0][0]} ${pts[0][1]} C ${W * 0.15} ${y(low)}, ${W * 0.35} ${y(mid)}, ${W * 0.5} ${y(mid)} S ${W * 0.85} ${y(high)}, ${W} ${y(high)}`;
  return (
    <svg width={W} height={H} className="eq-curve" aria-hidden="true">
      <line x1="0" y1={cy} x2={W} y2={cy} stroke="var(--border)" strokeDasharray="3 4" />
      <path d={d} fill="none" stroke="url(#eqgrad)" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="eqgrad" x1="0" x2="1">
          <stop offset="0" stopColor="#9B6BFF" /><stop offset="1" stopColor="#4DD8E6" />
        </linearGradient>
      </defs>
      {[[W * 0.13, y(low)], [W * 0.5, y(mid)], [W * 0.87, y(high)]].map(([x, yy], i) => (
        <circle key={i} cx={x} cy={yy} r="4.5" fill="#0C0C12" stroke="#9B6BFF" strokeWidth="2" />
      ))}
    </svg>
  );
}

function Slider({ label, value, min, max, step, onChange, format }) {
  return (
    <label className="mslider">
      <span className="mslider-head">
        <span>{label}</span>
        <span className="mslider-val">{format ? format(value) : value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
    </label>
  );
}

export default function Studio({
  profile, pattern, tempo, mutes, instruments, gains, pans, mix,
  isPlaying, playhead, palette, paletteOptions,
  onTogglePlay, onToggleStep, onToggleMute, onTempo, onRegenerate, onPalette, onShare,
  onInstrument, onGain, onPan, onMix, tracks,
}) {
  const [mixOpen, setMixOpen] = useState(false);

  const blendLine = profile.genreBlend
    .slice(0, 3)
    .map((g) => `${Math.round(g.weight * 100)}% ${g.label.toLowerCase()}`)
    .join(" · ");

  return (
    <>
      <div className="topbar">
        <div className="logo">motif<span className="dot">.</span></div>
        <div className="step-tag">Step 2 / 2 — Studio</div>
      </div>
      <div className="studio">
        <div className="studio-head">
          <div>
            <h2>Your beat.</h2>
            <div className="built-from">Built from <b>{blendLine}</b> — every step, sound, and fader is yours.</div>
          </div>
          <div className="transport">
            <button className={`btn btn-ghost mix-toggle${mixOpen ? " open" : ""}`} onClick={() => setMixOpen(!mixOpen)}>
              Mix {mixOpen ? "▴" : "▾"}
            </button>
            <div className="bpm-ctl">
              <button onClick={() => onTempo(-2)} aria-label="Slower">−</button>
              <div className="bpm-val">{tempo}<span>BPM</span></div>
              <button onClick={() => onTempo(2)} aria-label="Faster">+</button>
            </div>
            <button className="play-btn" onClick={onTogglePlay} aria-label={isPlaying ? "Stop" : "Play"}>
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0C0C12"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0C0C12" style={{ marginLeft: 3 }}><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          </div>
        </div>

        {mixOpen && (
          <div className="mix-panel">
            <div className="mix-col mix-eq">
              <div className="mix-title">Master EQ</div>
              <EQCurve low={mix.low} mid={mix.mid} high={mix.high} />
              <div className="eq-sliders">
                <Slider label="Low" value={mix.low} min={-12} max={12} step={0.5} onChange={(v) => onMix("low", v)} format={(v) => `${v > 0 ? "+" : ""}${v} dB`} />
                <Slider label="Mid" value={mix.mid} min={-12} max={12} step={0.5} onChange={(v) => onMix("mid", v)} format={(v) => `${v > 0 ? "+" : ""}${v} dB`} />
                <Slider label="High" value={mix.high} min={-12} max={12} step={0.5} onChange={(v) => onMix("high", v)} format={(v) => `${v > 0 ? "+" : ""}${v} dB`} />
              </div>
            </div>
            <div className="mix-col">
              <div className="mix-title">Character</div>
              <Slider label="Space" value={mix.space} min={0} max={0.4} step={0.01} onChange={(v) => onMix("space", v)} format={(v) => `${Math.round(v * 250)}%`} />
              <Slider label="Drive" value={mix.drive} min={0} max={0.6} step={0.01} onChange={(v) => onMix("drive", v)} format={(v) => `${Math.round(v * 167)}%`} />
              <label className="mcheck">
                <input type="checkbox" checked={mix.crackle} onChange={(e) => onMix("crackle", e.target.checked)} />
                Vinyl crackle
              </label>
            </div>
            <div className="mix-col">
              <div className="mix-title">Feel</div>
              <Slider label="Swing" value={mix.swing} min={0} max={0.5} step={0.01} onChange={(v) => onMix("swing", v)} format={(v) => `${Math.round(v * 200)}%`} />
              <Slider label="Humanize" value={mix.humanize} min={0} max={1} step={0.05} onChange={(v) => onMix("humanize", v)} format={(v) => `${Math.round(v * 100)}%`} />
            </div>
          </div>
        )}

        <div className="seq">
          {tracks.map((tr) => {
            const meta = TRACK_META[tr];
            return (
              <div className="track" key={tr}>
                <div className="tinfo">
                  <button
                    className={`tmute${mutes[tr] ? " muted" : ""}`}
                    onClick={() => onToggleMute(tr)}
                    aria-label={`${mutes[tr] ? "Unmute" : "Mute"} ${meta.label}`}
                  >M</button>
                  <div className="tmain">
                    <div className="tname">
                      <span className="tdot" style={{ background: meta.color }} />
                      {meta.label}
                    </div>
                    <select
                      className="tselect"
                      value={instruments[tr]}
                      onChange={(e) => onInstrument(tr, e.target.value)}
                      aria-label={`${meta.label} instrument`}
                    >
                      {INSTRUMENT_OPTIONS[tr].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
                <div className="tstrip">
                  <input className="vslider" type="range" min={-18} max={6} step={0.5} value={gains[tr]}
                    onChange={(e) => onGain(tr, parseFloat(e.target.value))}
                    title={`Volume ${gains[tr]} dB`} aria-label={`${meta.label} volume`} />
                  <input className="pslider" type="range" min={-1} max={1} step={0.05} value={pans[tr]}
                    onChange={(e) => onPan(tr, parseFloat(e.target.value))}
                    title={`Pan ${pans[tr] < 0 ? "L" : pans[tr] > 0 ? "R" : "C"}`} aria-label={`${meta.label} pan`} />
                </div>
                <div className="steps">
                  {pattern.steps[tr].map((on, i) => (
                    <button
                      key={i}
                      className={`cell${i % 4 === 0 && !on ? " q" : ""}${playhead === i && isPlaying ? " playhead" : ""}`}
                      style={on ? {
                        background: meta.color,
                        boxShadow: `0 0 12px 0 color-mix(in srgb, ${meta.color} 50%, transparent)`,
                        opacity: mutes[tr] ? 0.3 : 1,
                      } : { opacity: mutes[tr] ? 0.4 : 1 }}
                      onClick={() => onToggleStep(tr, i)}
                      aria-label={`${meta.label} step ${i + 1} ${on ? "on" : "off"}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="studio-foot">
          <div className="palette">
            <span className="plabel">Palette</span>
            {paletteOptions.map((o) => (
              <button key={o.key} className={`chip${palette === o.key ? " active" : ""}`} onClick={() => onPalette(o.key)}>
                {o.label}
              </button>
            ))}
          </div>
          <div className="foot-actions">
            <button className="btn btn-ghost" onClick={onRegenerate}>Regenerate</button>
            <button className="btn btn-primary" onClick={onShare}>Share</button>
          </div>
        </div>
      </div>
    </>
  );
}
