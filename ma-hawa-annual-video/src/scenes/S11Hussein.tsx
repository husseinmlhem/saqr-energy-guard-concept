// Scene 11 — HUSSEIN · THE NIGHT SHIFT.
// Bar 1 (the song's quiet bar): evening — Amr and Ali head home, lamps go off one by one; Hussein stays, lit by his screens.
// Bars 2–3 (the build-up): over his shoulder, exports fill on every beat … "And… done!" → EXPORT COMPLETE,
//                          the camera dives into his screen — and the events wall bursts out of it on the biggest drop.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character } from "../characters/Character";
import { POSES, Pose, walkPose, withIdle } from "../characters/rig";
import { clamp01, easeIn, lin, popIn } from "../fx/anim";
import { beatClock, beatPulse, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { ACCENT, FONT, GOLD, INK, PAPER, STROKE } from "../theme";
import { Workstation } from "../world/Screens";
import { Chapter, Stage, Subtitle, W, camAt } from "./kit";
import { lineText, voiceFrames } from "../voice";
import { Cues, SceneProps } from "./types";


export const husseinCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const bar = Math.max(1, Math.floor(n / 3));
  const leave = [beatOf(slot, 0), beatOf(slot, 1)];
  const lamps = [beatOf(slot, 1), beatOf(slot, 2)];
  const solo = beatOf(slot, bar);
  const night = solo;
  const exports = Array.from({ length: n - bar - 1 }, (_, i) => beatOf(slot, bar + i));
  const done = beatOf(slot, n - 1);
  const cups = exports.filter((_, i) => i % 2 === 1);
  const cues: Cues = {
    marks: [
      { f: leave[0], name: "Amr & Ali head home" },
      ...lamps.map((f, i) => ({ f, name: `lamp ${i + 1} off` })),
      { f: solo, name: "night — over Hussein's shoulder" },
      ...exports.map((f, i) => ({ f, name: `export ${Math.round(((i + 1) / exports.length) * 100)}%` })),
      { f: done, name: "And… done! → dive into the screen" },
    ],
    sfx: [...lamps.map((f) => ({ f, name: "tick" as const, volume: 0.5 })), ...exports.map((f) => ({ f, name: "tick" as const, volume: 0.4 })), { f: done, name: "ding" as const, volume: 0.9 }],
    voice: [{ f: done, id: "hussein_done" }],
  };
  return { leave, lamps, solo, night, exports, done, cups, bar, split: [] as number[], cues };
};

const Clock: React.FC<{ x: number; y: number; r: number; t: number }> = ({ x, y, r, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i} x1={0} y1={-r * 0.82} x2={0} y2={-r * 0.7} stroke={INK} strokeWidth={3} transform={`rotate(${i * 30})`} />
    ))}
    <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${t * 30})`} />
    <line x1={0} y1={0} x2={0} y2={-r * 0.75} stroke={ACCENT} strokeWidth={4} strokeLinecap="round" transform={`rotate(${t * 360})`} />
  </g>
);

const Lower: React.FC<{ text: string; frame: number; at: number; color?: string; bottom?: boolean }> = ({ text, frame, at, color = INK, bottom }) => {
  const k = popIn(frame, at, 260, 16);
  return (
    <div style={{ position: "absolute", left: 60, ...(bottom ? { bottom: 60 } : { top: 54 }), fontFamily: FONT, fontWeight: 900, fontSize: 54, letterSpacing: 6, color, transform: `translateX(${(1 - k) * -80}px)`, opacity: clamp01(k * 2) }}>
      <span style={{ background: ACCENT, color: PAPER, padding: "6px 18px", marginRight: 16 }}>▶</span>
      {text}
    </div>
  );
};

const DESK_X = { ali: 360, hussein: 960, amr: 1560 } as const;

/** evening: three desks, Amr and Ali head home, lamps go off; Hussein stays */
const Evening: React.FC<{ frame: number; c: ReturnType<typeof husseinCues> }> = ({ frame, c }) => {
  const night = lin(frame, [0, c.solo], [0.35, 0.9]);
  const cam = camAt(frame, [
    [0, { x: 960, y: 560, zoom: 1.02 }],
    [c.solo, { x: 960, y: 540, zoom: 1.12 }],
  ]);
  const clockT = lin(frame, [0, c.solo], [18.5, 21]);
  const walkT = (i: number) => clamp01((frame - c.leave[i]) / Math.max(1, c.solo - c.leave[i]));
  const lampOn = (i: number) => frame < c.lamps[i];
  const hm = idleMotion(frame, 0.6, 0.4);
  const type = (side: number) => (Math.floor(frame / 3 + side) % 2 === 0 ? 5 : 0);
  return (
    <AbsoluteFill>
      <Stage cam={cam} variant="work" night={night} light={1.4}>
        <W>
          <Clock x={1720} y={170} r={70} t={clockT} />
          {(["ali", "hussein", "amr"] as const).map((id, i) => {
            const x = DESK_X[id];
            const lit = id === "hussein" || lampOn(id === "ali" ? 0 : 1);
            return (
              <g key={id}>
                {lit && <ellipse cx={x} cy={700} rx={260} ry={150} fill={id === "hussein" ? ACCENT : "#FFE7A8"} opacity={id === "hussein" ? 0.22 : 0.18} />}
                {/* desk lamp */}
                <path d={`M ${x + 170} 760 l 0 -110 l -40 -30`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
                <path d={`M ${x + 105} 610 l 50 -10 l 10 30 l -50 10 Z`} fill={lit ? "#FFE7A8" : "#4A5160"} stroke={INK} strokeWidth={4} />
              </g>
            );
          })}
        </W>
        {/* Hussein at his desk, lit by his screens */}
        <Character id="hussein" x={DESK_X.hussein} y={1000} scale={1.35} pose={{ ...POSES.stand, lHand: { x: -60, y: -200 + type(0) }, rHand: { x: 60, y: -200 + type(1) }, head: 2 }} expression="neutral" headTilt={hm.headTilt * 0.5} frame={frame} />
        {/* Amr and Ali walking home, waving */}
        {(["ali", "amr"] as const).map((id, i) => {
          const t = walkT(i);
          const x0 = DESK_X[id];
          const x = x0 + t * (2300 - x0) * (id === "ali" ? 1.15 : 1);
          const pose: Pose = frame < c.leave[i] ? withIdle(POSES.relaxed, idleMotion(frame, i, 0.4)) : walkPose({ ...POSES.relaxed, rArm: [150, 30] }, beatClock(frame) / 2, 70, 1, 14);
          return <Character key={id} id={id} x={x} y={1000} scale={1.35} pose={pose} expression="happy" left="none" frame={frame} />;
        })}
        <W>
          {(["ali", "hussein", "amr"] as const).map((id) => (
            <g key={id}>
              <rect x={DESK_X[id] - 250} y={760} width={500} height={24} rx={6} fill="#3A3F4B" stroke={INK} strokeWidth={STROKE * 0.8} />
              <rect x={DESK_X[id] - 230} y={784} width={460} height={230} fill="#2F3440" stroke={INK} strokeWidth={STROKE * 0.8} />
              {/* monitor backs; Hussein's still on (glow on his face) */}
              {[-130, 0, 130].map((dx, k) => (
                <g key={k}>
                  <rect x={DESK_X[id] + dx - 58} y={640} width={116} height={86} rx={8} fill="#1A1D24" stroke={INK} strokeWidth={4} />
                  <rect x={DESK_X[id] + dx - 8} y={726} width={16} height={34} fill="#1A1D24" />
                  {id === "hussein" && <rect x={DESK_X[id] + dx - 58} y={640} width={116} height={86} rx={8} fill="none" stroke={ACCENT} strokeWidth={3} opacity={0.7 + 0.3 * Math.sin(frame / 4 + k)} />}
                </g>
              ))}
            </g>
          ))}
        </W>
      </Stage>
      <Lower text={`${String(Math.floor(clockT)).padStart(2, "0")}:${String(Math.floor((clockT % 1) * 60)).padStart(2, "0")}  ·  EVERYONE HEADS HOME…`} frame={frame} at={2} color={PAPER} bottom />
      <Chapter frame={frame} title="HUSSEIN" sub="THE NIGHT SHIFT" dark />
    </AbsoluteFill>
  );
};

export const S11Hussein: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => husseinCues(slot), [slot]);
  const pulse = beatPulse(frame, 5);
  if (frame < c.solo) return <Evening frame={frame} c={c} />;

  // ------------------------------------------------ bars 2–3: over Hussein's shoulder, night
  const cups = 3 + c.cups.filter((f) => frame >= f).length;
  const exportP = c.exports.length ? c.exports.filter((f) => frame >= f).length / c.exports.length : 0;
  const clockT = lin(frame, [c.solo, c.done], [22, 26.2]); // 22:00 → 02:12
  const dive = easeIn(clamp01((frame - c.done) / (slot.durationInFrames - c.done)));
  const cam = camAt(frame, [
    [c.solo, { x: 960, y: 600, zoom: 0.92 }],
    [c.done, { x: 960, y: 580, zoom: 1.0 }],
  ]);
  const monCenter = { x: 960, y: 574 };
  const camD = { x: cam.x + (monCenter.x - cam.x) * dive, y: cam.y + (monCenter.y - cam.y) * dive, zoom: cam.zoom * (1 + dive * 3.2) };
  const type = (side: number) => (Math.floor(frame / 3 + side) % 2 === 0 ? 6 : 0);
  const huss: Pose = { ...POSES.stand, lHand: { x: -64, y: -366 + type(0) }, rHand: { x: 64, y: -366 + type(1) }, hipY: 8, head: 4 };

  return (
    <AbsoluteFill>
      <Stage cam={camD} variant="work" night={1} light={1.6}>
        <W>
          <Clock x={1720} y={170} r={70} t={clockT} />
          {[140, 1780].map((x) => (
            <g key={x} opacity={0.75}>
              <rect x={x - 150} y={820} width={300} height={22} rx={5} fill="#2E3445" stroke={INK} strokeWidth={STROKE * 0.6} />
              <rect x={x - 70} y={690} width={140} height={90} rx={6} fill="#1A1E28" stroke={INK} strokeWidth={STROKE * 0.6} />
              <path d={`M ${x - 40} 980 L ${x - 50} 900 L ${x + 50} 900 L ${x + 40} 980`} fill="none" stroke="#3A4258" strokeWidth={8} />
              <rect x={x - 60} y={880} width={120} height={22} rx={8} fill="#3A4258" />
            </g>
          ))}
          <ellipse cx={960} cy={760} rx={900} ry={420} fill={ACCENT} opacity={0.12 + 0.05 * pulse} />
          <Workstation x={250} y={790} w={1420} frame={frame} kinds={["3d", "render", "edit"]} progress={exportP} glow={1} mugs={cups} />
        </W>
        <Character id="hussein" x={900} y={1340} scale={1.55} pose={huss} back expression="neutral" left="none" frame={frame} shadow={false} />
        {frame >= c.done && (
          <W>
            <g transform={`translate(960 574) scale(${popIn(frame, c.done, 420, 12)})`}>
              <rect x={-200} y={-46} width={400} height={92} rx={14} fill="#3FBF6F" stroke={INK} strokeWidth={5} />
              <text y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={PAPER}>
                EXPORT COMPLETE ✓
              </text>
            </g>
          </W>
        )}
      </Stage>
      {dive < 0.2 && <Lower text={`${String(Math.floor(clockT) % 24).padStart(2, "0")}:${String(Math.floor((clockT % 1) * 60)).padStart(2, "0")}  ·  STILL GOING`} frame={frame} at={c.solo + 2} color={PAPER} />}
      {dive < 0.3 && (
        <div style={{ position: "absolute", right: 70, top: 60, fontFamily: FONT, fontWeight: 900, fontSize: 46, color: PAPER, opacity: 0.9 }}>
          ☕ × {cups}
        </div>
      )}
      <Subtitle frame={frame} at={c.done} frames={voiceFrames("hussein_done")} speaker="Hussein" text={lineText("hussein_done")} />
      <AbsoluteFill style={{ background: PAPER, opacity: clamp01((dive - 0.75) * 4) }} />
      <AbsoluteFill style={{ pointerEvents: "none", boxShadow: `inset 0 0 0 ${8 + pulse * 6}px ${GOLD}`, opacity: frame - c.solo < 6 ? 1 - (frame - c.solo) / 6 : 0 }} />
    </AbsoluteFill>
  );
};
