// "beats debug" overlay: beat flashes, bar/beat counter, scene + cue labels and a full timeline strip.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Cues } from "../scenes/types";
import { BEATS, BPM, DURATION_IN_FRAMES, FPS, beatIndexAt, beatPulse } from "../sync/beats";
import { PLAN, SceneSlot } from "../sync/timeline";

const RED = "#E5484D";
const MONO = "'DejaVu Sans Mono', 'Menlo', monospace";

type Sheet = { slot: SceneSlot; cues: Cues };

export const BeatDebug: React.FC<{ cueSheets: Sheet[] }> = ({ cueSheets }) => {
  const frame = useCurrentFrame();
  const D = DURATION_IN_FRAMES;
  const bi = beatIndexAt(frame);
  const beat = bi >= 0 ? BEATS.beats[bi] : null;
  const pulse = beatPulse(frame, 7);
  const isDown = beat?.downbeat ?? false;
  const onBeat = beat ? frame - beat.f < 3 : false;
  const scene = PLAN.scenes.find((s) => frame >= s.from && frame < s.from + s.durationInFrames);
  const allMarks = cueSheets.flatMap(({ slot, cues }) => cues.marks.map((m) => ({ ...m, f: m.f + slot.from, scene: slot.id })));
  const recent = allMarks.filter((m) => frame >= m.f && frame - m.f < 24).slice(-5);
  const X = (f: number) => 40 + (f / D) * 1840;
  const t = frame / FPS;
  const fmt = `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, "0")}`;
  // frame error of the nearest cue vs. the nearest beat (should always be 0)
  const offBeat = allMarks.filter((m) => !BEATS.beats.some((b) => Math.abs(b.f - m.f) <= 0)).length;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", fontFamily: MONO }}>
      {/* edge flash on every beat; thicker + red on downbeats */}
      <AbsoluteFill style={{ border: `${isDown ? 14 : 7}px solid ${isDown ? RED : "#2F80ED"}`, opacity: pulse * 0.9 }} />

      {/* info panel */}
      <div style={{ position: "absolute", left: 24, top: 24, background: "rgba(0,0,0,0.78)", color: "#fff", padding: "14px 18px", borderRadius: 10, fontSize: 22, lineHeight: 1.45, minWidth: 380 }}>
        <div style={{ fontWeight: 700, color: "#9CC8F0" }}>BEATS DEBUG</div>
        <div>
          {fmt} · f{frame} · {BPM.toFixed(1)} BPM
        </div>
        <div>
          bar <b style={{ fontSize: 28 }}>{beat ? beat.bar + 1 : "-"}</b> · beat <b style={{ fontSize: 28 }}>{beat ? beat.beat + 1 : "-"}</b> · #{bi}
        </div>
        <div>scene: {scene?.title ?? "-"}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {[0, 1, 2, 3].map((k) => (
            <div
              key={k}
              style={{
                width: 54,
                height: 38,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                background: beat?.beat === k ? (k === 0 ? RED : "#2F80ED") : "rgba(255,255,255,0.12)",
                transform: beat?.beat === k ? `scale(${1 + pulse * 0.25})` : undefined,
              }}
            >
              {k + 1}
            </div>
          ))}
        </div>
        {offBeat > 0 && <div style={{ color: RED }}>⚠ {offBeat} cue(s) not on a beat</div>}
      </div>

      {/* big beat dot */}
      <div
        style={{
          position: "absolute",
          right: 40,
          top: 34,
          width: 90,
          height: 90,
          borderRadius: 45,
          background: onBeat ? (isDown ? RED : "#2F80ED") : "rgba(0,0,0,0.15)",
          transform: `scale(${0.6 + pulse * 0.6})`,
          border: "4px solid #000",
        }}
      />

      {/* cues firing now */}
      <div style={{ position: "absolute", right: 24, top: 150, width: 560, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
        {recent.map((m, i) => (
          <div key={`${m.f}-${i}`} style={{ background: frame === m.f ? RED : "rgba(0,0,0,0.78)", color: "#fff", padding: "8px 14px", borderRadius: 8, fontSize: 22, opacity: 1 - (frame - m.f) / 24 }}>
            ⚡ {m.name} <span style={{ color: "#9CC8F0" }}>f{m.f}</span>
          </div>
        ))}
      </div>

      {/* timeline strip */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={20} y={940} width={1880} height={126} rx={10} fill="rgba(0,0,0,0.78)" />
        {PLAN.scenes.map((s, i) => (
          <g key={s.id}>
            <rect x={X(s.from)} y={950} width={X(s.from + s.durationInFrames) - X(s.from)} height={30} fill={i % 2 ? "#2F4F6F" : "#3D6A93"} />
            <text x={X(s.from) + 6} y={971} fill="#fff" fontSize={16} fontFamily={MONO}>
              {s.title}
            </text>
          </g>
        ))}
        {BEATS.quiet.map((q, i) => (
          <rect key={`q${i}`} x={X(q.start * FPS)} y={984} width={X(q.end * FPS) - X(q.start * FPS)} height={44} fill="rgba(255,255,255,0.15)" />
        ))}
        {/* energy curve */}
        <polyline
          points={BEATS.energy.filter((_, i) => i % 3 === 0).map((e, k) => `${X(k * 3)},${1028 - e * 40}`).join(" ")}
          fill="none"
          stroke="#9CC8F0"
          strokeWidth={2}
        />
        {BEATS.beats.map((b, i) => (
          <line key={i} x1={X(b.f)} x2={X(b.f)} y1={b.downbeat ? 984 : 1012} y2={1028} stroke={b.downbeat ? "#fff" : "rgba(255,255,255,0.5)"} strokeWidth={b.downbeat ? 2 : 1} />
        ))}
        {allMarks.map((m, i) => (
          <circle key={i} cx={X(m.f)} cy={1042} r={4} fill="#2F80ED" />
        ))}
        {BEATS.breaks.map((b, i) => (
          <text key={`b${i}`} x={X(b.f)} y={1062} fill="#FFD166" fontSize={14} textAnchor="middle" fontFamily={MONO}>
            ▲break
          </text>
        ))}
        {BEATS.biggestDrop && (
          <text x={X(BEATS.biggestDrop.f)} y={1062} fill={RED} fontSize={14} textAnchor="middle" fontFamily={MONO}>
            ▲DROP
          </text>
        )}
        <line x1={X(frame)} x2={X(frame)} y1={944} y2={1062} stroke={RED} strokeWidth={3} />
      </svg>
    </AbsoluteFill>
  );
};
