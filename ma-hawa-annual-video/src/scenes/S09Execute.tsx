// Scene 9 — Making it happen.
// Bar 1: three-way split — Ali builds the booth, Amr runs the schedule, Hussein at his screens.
// Bar 2: over Hussein's shoulder — 3D booth, edit timeline, key visual; cups pile up, the clock spins, day → dusk.
// Bar 3: night, everyone's gone, only his desk is lit; exports fill on the beat → EXPORT COMPLETE,
//        and the camera dives into his screen (the events come out of it in the next scene).
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character } from "../characters/Character";
import { POSES, Pose, withIdle } from "../characters/rig";
import { clamp01, easeIn, easeOut, lin, popIn } from "../fx/anim";
import { beatPhase, beatPulse, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { ACCENT, FONT, GOLD, INK, PAPER, STROKE } from "../theme";
import { Workstation } from "../world/Screens";
import { Stage, W, camAt } from "./kit";
import { Cues, SceneProps } from "./types";

const PW = 640;

export const executeCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const bar = Math.max(1, Math.floor(n / 3));
  const split = Array.from({ length: bar }, (_, i) => beatOf(slot, i));
  const solo = beatOf(slot, bar);
  const cups = Array.from({ length: bar }, (_, i) => beatOf(slot, bar + i));
  const night = beatOf(slot, bar * 2);
  const exports = Array.from({ length: n - bar * 2 }, (_, i) => beatOf(slot, bar * 2 + i));
  const done = beatOf(slot, n - 1);
  const cues: Cues = {
    marks: [
      ...split.map((f, i) => ({ f, name: `split: hammer / tick / type (${i + 1})` })),
      { f: solo, name: "Hussein — full screen" },
      ...cups.map((f, i) => ({ f, name: `coffee #${i + 2}` })),
      { f: night, name: "night shift" },
      ...exports.map((f, i) => ({ f, name: `export ${Math.round(((i + 1) / exports.length) * 100)}%` })),
      { f: done, name: "EXPORT COMPLETE → dive into the screen" },
    ],
    sfx: [
      ...split.map((f) => ({ f, name: "stamp" as const, volume: 0.45 })),
      { f: solo, name: "whoosh" as const, volume: 0.6 },
      ...cups.map((f) => ({ f, name: "tick" as const, volume: 0.5 })),
      { f: night, name: "whoosh" as const, volume: 0.4 },
      ...exports.map((f) => ({ f, name: "tick" as const, volume: 0.45 })),
      { f: done, name: "ding" as const, volume: 0.9 },
    ],
  };
  return { split, solo, cups, night, exports, done, bar, cues };
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

const Lower: React.FC<{ text: string; frame: number; at: number; color?: string }> = ({ text, frame, at, color = INK }) => {
  const k = popIn(frame, at, 260, 16);
  return (
    <div style={{ position: "absolute", left: 60, top: 54, fontFamily: FONT, fontWeight: 900, fontSize: 54, letterSpacing: 6, color, transform: `translateX(${(1 - k) * -80}px)`, opacity: clamp01(k * 2) }}>
      <span style={{ background: ACCENT, color: PAPER, padding: "6px 18px", marginRight: 16 }}>▶</span>
      {text}
    </div>
  );
};

export const S09Execute: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => executeCues(slot), [slot]);
  const pulse = beatPulse(frame, 5);
  const ph = beatPhase(frame);

  // ------------------------------------------------ bar 1: split screen
  if (frame < c.solo) {
    const k = c.split.filter((f) => frame >= f).length;
    const hammer = 1 - Math.pow(Math.sin(Math.PI * ph), 0.7); // down on the beat
    const panelIn = (i: number) => easeOut(clamp01((frame - c.split[Math.min(i, c.split.length - 1)] + 2) / 6));
    return (
      <AbsoluteFill style={{ background: INK }}>
        {/* Ali */}
        <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: 1080, overflow: "hidden", background: "#F2F5F9", transform: `translateY(${(1 - panelIn(0)) * -1080}px)` }}>
          <svg width={PW} height={1080} style={{ position: "absolute" }}>
            <rect y={860} width={PW} height={220} fill="#E4E9F0" />
            {[0, 1, 2, 3].map((i) => {
              const s = popIn(frame, c.split[Math.min(i, c.split.length - 1)], 420, 13);
              if (i >= k) return null;
              const x = 40 + (i % 2) * 280;
              const y = i < 2 ? 520 : 240;
              return (
                <g key={i} transform={`translate(${x + 130} ${y + 170}) scale(${s}) translate(${-x - 130} ${-y - 170})`}>
                  <rect x={x} y={y} width={260} height={300} fill={i % 2 ? ACCENT : "#1F3B66"} stroke={INK} strokeWidth={STROKE} />
                  <rect x={x + 30} y={y + 30} width={200} height={120} fill={PAPER} opacity={0.25} />
                </g>
              );
            })}
          </svg>
          <Character id="ali" x={430} y={1000} scale={1.0} pose={{ ...POSES.hammerUp, rArm: [70 + 70 * (1 - hammer), 20 + 10 * hammer], hipY: 10 * hammer }} expression="neutral" right="hammer" left="none" frame={frame} />
        </div>
        {/* Amr — centre */}
        <div style={{ position: "absolute", left: PW, top: 0, width: PW, height: 1080, overflow: "hidden", background: "#F7F9FC", transform: `translateY(${(1 - panelIn(1)) * 1080}px)` }}>
          <svg width={PW} height={1080} style={{ position: "absolute" }}>
            <rect y={860} width={PW} height={220} fill="#E4E9F0" />
            <rect x={60} y={150} width={520} height={360} rx={10} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
            <text x={84} y={200} fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK}>
              RUN OF SHOW
            </text>
            {Array.from({ length: 5 }, (_, i) => (
              <g key={i}>
                <rect x={84} y={226 + i * 54} width={30} height={30} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
                {i < k + 1 && <path d={`M ${88} ${240 + i * 54} l 9 9 l 16 -18`} fill="none" stroke="#3FBF6F" strokeWidth={6} strokeLinecap="round" />}
                <rect x={130} y={234 + i * 54} width={280 + (i % 3) * 50} height={14} rx={7} fill="#C9D2DE" />
              </g>
            ))}
          </svg>
          <Character id="amr" x={330} y={1000} scale={1.0} pose={withIdle(POSES.phoneTalk, idleMotion(frame, 0.1, 0.6))} expression="neutral" right="phone" left="none" frame={frame} />
        </div>
        {/* Hussein */}
        <div style={{ position: "absolute", left: PW * 2, top: 0, width: PW, height: 1080, overflow: "hidden", background: "#E9EEF5", transform: `translateY(${(1 - panelIn(2)) * -1080}px)` }}>
          <svg width={PW} height={1080} style={{ position: "absolute" }}>
            <Workstation x={40} y={640} w={560} frame={frame} kinds={["code", "3d", "edit"]} progress={0.4} glow={0.4} />
          </svg>
          <Character id="hussein" x={330} y={1260} scale={1.1} pose={{ ...POSES.stand, lHand: { x: -40, y: -360 + (ph < 0.5 ? 6 : 0) }, rHand: { x: 40, y: -360 + (ph >= 0.5 ? 6 : 0) } }} back expression="neutral" left="none" frame={frame} shadow={false} />
        </div>
        {[1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: i * PW - 5, top: 0, width: 10, height: 1080, background: pulse > 0.6 ? ACCENT : INK }} />
        ))}
      </AbsoluteFill>
    );
  }

  // ------------------------------------------------ bars 2–3: over Hussein's shoulder
  const night = lin(frame, [c.solo, c.night], [0, 0.55]) + lin(frame, [c.night - 4, c.night + 4], [0, 0.45]);
  const cups = 1 + c.cups.filter((f) => frame >= f).length;
  const exportP = c.exports.length ? c.exports.filter((f) => frame >= f).length / c.exports.length : 0;
  const isNight = frame >= c.night;
  const clockT = lin(frame, [c.solo, c.done], [9, 26]); // 09:00 → 02:00
  const dive = easeIn(clamp01((frame - c.done) / (slot.durationInFrames - c.done)));
  const cam = camAt(frame, [
    [c.solo, { x: 960, y: 560, zoom: 1.0 }],
    [c.night, { x: 960, y: 560, zoom: 1.04 }],
    [c.night + 8, { x: 960, y: 600, zoom: 0.92 }],
    [c.done, { x: 960, y: 580, zoom: 0.98 }],
  ]);
  const monCenter = { x: 960, y: 574 };
  const camD = { x: cam.x + (monCenter.x - cam.x) * dive, y: cam.y + (monCenter.y - cam.y) * dive, zoom: cam.zoom * (1 + dive * 3.2) };
  const type = (side: number) => (Math.floor(frame / 3 + side) % 2 === 0 ? 6 : 0);
  const huss: Pose = { ...POSES.stand, lHand: { x: -64, y: -366 + type(0) }, rHand: { x: 64, y: -366 + type(1) }, hipY: isNight ? 8 : 0, head: isNight ? 4 : 0 };
  const pool = isNight ? 1 : 0;

  return (
    <AbsoluteFill>
      <Stage cam={camD} variant="work" night={Math.min(1, night)} light={1 + pool * 0.6}>
        <W>
          <Clock x={1720} y={170} r={70} t={clockT} />
          {isNight &&
            [140, 1780].map((x) => (
              <g key={x} opacity={0.75}>
                <rect x={x - 150} y={820} width={300} height={22} rx={5} fill="#2E3445" stroke={INK} strokeWidth={STROKE * 0.6} />
                <rect x={x - 70} y={690} width={140} height={90} rx={6} fill="#1A1E28" stroke={INK} strokeWidth={STROKE * 0.6} />
                <path d={`M ${x - 40} 980 L ${x - 50} 900 L ${x + 50} 900 L ${x + 40} 980`} fill="none" stroke="#3A4258" strokeWidth={8} />
                <rect x={x - 60} y={880} width={120} height={22} rx={8} fill="#3A4258" />
              </g>
            ))}
          {/* pool of screen light */}
          {isNight && <ellipse cx={960} cy={760} rx={900} ry={420} fill={ACCENT} opacity={0.12} />}
          <Workstation
            x={250}
            y={790}
            w={1420}
            frame={frame}
            kinds={isNight ? ["dash", "render", "code"] : ["3d", "edit", "design"]}
            progress={isNight ? exportP : lin(frame, [c.solo, c.night], [0.2, 0.9])}
            glow={isNight ? 1 : 0.35}
            mugs={cups}
          />
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
      {!isNight && <Lower text={`${String(Math.floor(clockT) % 24).padStart(2, "0")}:${String(Math.floor((clockT % 1) * 60)).padStart(2, "0")}  ·  DESIGN · EDIT · BUILD`} frame={frame} at={c.solo + 2} />}
      {isNight && dive < 0.2 && <Lower text={`${String(Math.floor(clockT) % 24).padStart(2, "0")}:${String(Math.floor((clockT % 1) * 60)).padStart(2, "0")}  ·  STILL GOING`} frame={frame} at={c.night + 2} color={PAPER} />}
      <AbsoluteFill style={{ background: PAPER, opacity: clamp01((dive - 0.75) * 4) }} />
      {frame >= c.cups[0] && frame < c.night && (
        <div style={{ position: "absolute", right: 70, bottom: 64, fontFamily: FONT, fontWeight: 900, fontSize: 46, color: INK, opacity: 0.9 }}>
          ☕ × {cups}
        </div>
      )}
      <AbsoluteFill style={{ pointerEvents: "none", boxShadow: `inset 0 0 0 ${8 + pulse * 6}px ${isNight ? GOLD : ACCENT}`, opacity: 0.0 + (frame - c.solo < 6 ? 1 - (frame - c.solo) / 6 : 0) }} />
    </AbsoluteFill>
  );
};
