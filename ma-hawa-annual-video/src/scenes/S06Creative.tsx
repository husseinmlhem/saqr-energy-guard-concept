// Scene 6 — THE PLANNING TABLE. Lights down in the war room; a holographic projector on the table.
// Hussein drives it from his laptop, Amr directs with his pointer, Ali weighs in.
// On every beat the booth they're planning builds itself in 3D: grid → floor → walls → LED wall + logo →
// stage → lights → the creative extras (VR zone, drone show, LED tunnel). Last beat: it flashes gold — EUREKA.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos } from "../characters/Character";
import { POSES, Pose, lerpPose, withIdle } from "../characters/rig";
import { clamp01, easeInOut, easeOut, lin, popIn } from "../fx/anim";
import { LightRays } from "../fx/Fx";
import { beatPhase, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { FONT, GOLD, INK, PAPER, STROKE } from "../theme";
import { Chapter, Shout, Stage, W, breathe, camAt } from "./kit";
import { Cues, SceneProps } from "./types";

const HOLO = "#7FE0FF";
const G = 1000;
const CX = 960;
const CY = 600; // hologram origin (floor centre)
const STEPS = ["grid", "floor", "walls", "led", "stage", "lights", "extras", "eureka"] as const;
const IDEAS = [
  { t: "LED TUNNEL", x: -175, y: -60 },
  { t: "VR ZONE", x: 150, y: 70 },
  { t: "DRONE SHOW", x: 40, y: -150 },
];

/** isometric projection of booth-space (x right, y depth, z up) onto the screen */
const P = (x: number, y: number, z = 0) => ({ x: CX + (x - y) * 0.87, y: CY + (x + y) * 0.5 - z });
const poly = (...pts: { x: number; y: number }[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

export const creativeCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const steps = STEPS.map((_, i) => beatOf(slot, Math.min(n - 1, i)));
  const eureka = steps[steps.length - 1];
  const cues: Cues = {
    marks: STEPS.map((s, i) => ({ f: steps[i], name: `hologram: ${s}` })),
    sfx: [
      ...steps.slice(0, -1).map((f, i) => ({ f, name: (i % 2 ? "tick" : "pop") as "tick" | "pop", volume: 0.4 })),
      { f: eureka, name: "sparkle" as const, volume: 0.9 },
      { f: eureka, name: "slam" as const, volume: 0.4 },
    ],
  };
  return { steps, eureka, cues };
};

/** a hologram element that flickers on when its beat lands */
const On: React.FC<{ frame: number; at: number; children: React.ReactNode }> = ({ frame, at, children }) => {
  if (frame < at - 1) return null;
  const t = frame - at + 1;
  const flicker = t < 6 ? (t % 2 ? 0.35 : 1) : 1;
  const k = easeOut(clamp01(t / 6));
  return (
    <g opacity={flicker} transform={`translate(0 ${(1 - k) * -14})`}>
      {children}
    </g>
  );
};

const Hologram: React.FC<{ frame: number; s: number[]; gold: number }> = ({ frame, s, gold }) => {
  const col = gold > 0 ? GOLD : HOLO;
  const L = { stroke: col, strokeWidth: 3.5, strokeLinejoin: "round" as const, fill: "none" };
  const F = (o: number) => ({ fill: col, fillOpacity: o, stroke: col, strokeWidth: 3, strokeLinejoin: "round" as const });
  const scan = (frame * 6) % 520;
  const W0 = 150;
  const D0 = 100;
  const H = 170;
  return (
    <g style={{ filter: `drop-shadow(0 0 6px ${col}) drop-shadow(0 0 14px ${col})` }} opacity={0.92}>
      {/* grid */}
      <On frame={frame} at={s[0]}>
        {Array.from({ length: 7 }, (_, i) => {
          const u = -210 + i * 70;
          const a = P(u, -150);
          const b = P(u, 150);
          const c = P(-210, u * 0.72);
          const d = P(210, u * 0.72);
          return (
            <g key={i} opacity={0.35}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={col} strokeWidth={1.5} />
              <line x1={c.x} y1={c.y} x2={d.x} y2={d.y} stroke={col} strokeWidth={1.5} />
            </g>
          );
        })}
      </On>
      {/* floor */}
      <On frame={frame} at={s[1]}>
        <polygon points={poly(P(-W0, -D0), P(W0, -D0), P(W0, D0), P(-W0, D0))} {...F(0.12)} />
      </On>
      {/* walls */}
      <On frame={frame} at={s[2]}>
        <polygon points={poly(P(-W0, -D0), P(W0, -D0), P(W0, -D0, H), P(-W0, -D0, H))} {...F(0.1)} />
        <polygon points={poly(P(-W0, -D0), P(-W0, D0), P(-W0, D0, H), P(-W0, -D0, H))} {...F(0.07)} />
      </On>
      {/* LED wall + header sign */}
      <On frame={frame} at={s[3]}>
        <polygon points={poly(P(-90, -D0, 40), P(90, -D0, 40), P(90, -D0, 140), P(-90, -D0, 140))} {...F(0.3)} />
        {[0, 1, 2].map((k) => (
          <line key={k} x1={P(-80 + k * 60, -D0, 60).x} y1={P(-80 + k * 60, -D0, 60).y} x2={P(-40 + k * 60, -D0, 120).x} y2={P(-40 + k * 60, -D0, 120).y} {...L} strokeWidth={2} opacity={0.6} />
        ))}
        <polygon points={poly(P(-110, -D0, H + 4), P(110, -D0, H + 4), P(110, -D0, H + 44), P(-110, -D0, H + 44))} {...F(0.25)} />
        <text transform={`translate(${P(0, -D0, H + 16).x} ${P(0, -D0, H + 16).y}) skewY(30) `} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} letterSpacing={3} fill={col}>
          MA HAWA
        </text>
      </On>
      {/* stage */}
      <On frame={frame} at={s[4]}>
        <polygon points={poly(P(20, -40, 26), P(120, -40, 26), P(120, 50, 26), P(20, 50, 26))} {...F(0.22)} />
        <polygon points={poly(P(20, 50, 0), P(120, 50, 0), P(120, 50, 26), P(20, 50, 26))} {...F(0.12)} />
        <polygon points={poly(P(120, -40, 0), P(120, 50, 0), P(120, 50, 26), P(120, -40, 26))} {...F(0.16)} />
      </On>
      {/* lights */}
      <On frame={frame} at={s[5]}>
        {[-60, 70].map((lx, k) => {
          const top = P(lx, 30, 260);
          const a = P(lx - 40, 30, 0);
          const b = P(lx + 40, 30, 0);
          return (
            <g key={k}>
              <polygon points={poly(top, a, b)} fill={col} fillOpacity={0.08 + 0.06 * Math.exp(-beatPhase(frame) * 5)} stroke="none" />
              <circle cx={top.x} cy={top.y} r={8} fill={col} />
            </g>
          );
        })}
      </On>
      {/* the creative extras */}
      <On frame={frame} at={s[6]}>
        {[0, 1, 2].map((k) => {
          const d = P(-60 + k * 70, 20, 230 + Math.sin(frame / 6 + k) * 10);
          return (
            <g key={k} transform={`translate(${d.x} ${d.y})`}>
              <line x1={-14} y1={0} x2={14} y2={0} stroke={col} strokeWidth={3} />
              <ellipse cx={-14} cy={-4} rx={8} ry={2.5} fill={col} />
              <ellipse cx={14} cy={-4} rx={8} ry={2.5} fill={col} />
            </g>
          );
        })}
        {[0, 1, 2, 3].map((k) => {
          const a = P(-150 + k * 14, 40 + k * 14, 0);
          return <path key={k} d={`M ${a.x} ${a.y} q 20 -60 40 0`} {...L} strokeWidth={2.5} opacity={0.7} />;
        })}
        {IDEAS.map((idea, k) => {
          const p = P(idea.x, idea.y, 120);
          return (
            <g key={idea.t} transform={`translate(${p.x} ${p.y}) scale(${popIn(frame, s[6] + k * 3, 380, 14)})`}>
              <rect x={-74} y={-20} width={148} height={34} rx={6} fill="rgba(10,30,50,0.55)" stroke={col} strokeWidth={2.5} />
              <text y={4} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={17} letterSpacing={2} fill={col}>
                {idea.t}
              </text>
            </g>
          );
        })}
      </On>
      {/* scan line sweeping up through the model */}
      {frame >= s[1] && <rect x={CX - 280} y={CY + 180 - scan} width={560} height={3} fill={col} opacity={0.35} />}
    </g>
  );
};

export const S06Creative: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => creativeCues(slot), [slot]);
  const gold = frame >= c.eureka ? popIn(frame, c.eureka, 300, 10) : 0;
  const stepNow = c.steps.filter((f) => frame >= f).length - 1;
  const cam = breathe(
    camAt(frame, [
      [0, { x: 960, y: 560, zoom: 1.0 }],
      [c.steps[4], { x: 960, y: 520, zoom: 1.1 }],
      [c.eureka, { x: 960, y: 500, zoom: 1.16 }],
      [slot.durationInFrames, { x: 960, y: 500, zoom: 1.2 }],
    ]),
    frame,
  );
  const punch = frame >= c.steps[4] ? Math.exp(-(frame - c.steps[4]) / 5) * 0.03 : 0;
  cam.zoom *= 1 + punch;

  // the team: Hussein types (a keystroke on every beat), Amr points at the newest piece, Ali weighs in
  const m = (i: number) => idleMotion(frame, i * 0.3, 0.45);
  const tap = Math.exp(-beatPhase(frame) * 6);
  const hussein: Pose = withIdle({ ...POSES.type, lean: 6 + tap * 3, head: 8 }, m(2));
  const amr: Pose = gold > 0 ? withIdle(POSES.cheer, m(1)) : withIdle({ ...POSES.point, rArm: [100 + (stepNow % 2) * 14, -8 - tap * 6] }, m(1));
  const ali: Pose = gold > 0 ? withIdle(POSES.flex, m(0)) : lerpPose(withIdle(POSES.armsCrossed, m(0)), withIdle(POSES.thumbsUp, m(0)), easeInOut(clamp01((frame - c.steps[5]) / 6)));
  const hHead = headScreenPos("hussein", 515, G, 1.32, hussein);
  const beam = lin(frame, [c.steps[0] - 4, c.steps[0] + 4], [0, 1]);

  return (
    <AbsoluteFill>
      <Stage cam={cam} variant="meeting" night={0.78} light={0.9}>
        <W>
          {gold > 0 && <LightRays frame={frame} x={CX} y={CY - 80} intensity={gold * 0.5} speed={1.2} />}
          {/* projector beam from the table */}
          <polygon points={`${CX - 40},780 ${CX + 40},780 ${CX + 300},300 ${CX - 300},300`} fill={gold > 0 ? GOLD : HOLO} opacity={0.06 * beam} />
        </W>
        {/* Ali (far left) and Hussein with the laptop */}
        <Character id="ali" x={225} y={G} scale={1.32} pose={ali} expression={gold > 0 ? "happy" : "neutral"} left="none" right="none" frame={frame} />
        <Character id="hussein" x={515} y={G} scale={1.32} pose={hussein} expression={gold > 0 ? "happy" : "neutral"} left="laptop" right="none" headTilt={6} frame={frame} />
        {/* Amr on the right, pointing back at the model */}
        <Character id="amr" x={1460} y={G} scale={1.4} pose={amr} flip={gold === 0} expression={gold > 0 ? "happy" : "neutral"} left="none" right="none" frame={frame} />
        <W>
          {/* planning table + projector */}
          <path d="M 640 780 L 1280 780 L 1330 830 L 590 830 Z" fill="#2B3446" stroke={INK} strokeWidth={STROKE} />
          <rect x={620} y={830} width={680} height={22} fill="#1E2533" stroke={INK} strokeWidth={STROKE} />
          {[650, 1260].map((x) => (
            <rect key={x} x={x} y={852} width={18} height={150} fill="#1E2533" stroke={INK} strokeWidth={STROKE * 0.8} />
          ))}
          <ellipse cx={CX} cy={790} rx={46} ry={12} fill="#11161F" stroke={HOLO} strokeWidth={3} opacity={0.9} />
          <Hologram frame={frame} s={c.steps} gold={gold} />
          {/* laptop glow on Hussein's face */}
          <circle cx={hHead.x} cy={hHead.y + 40} r={110} fill={HOLO} opacity={0.06 + tap * 0.04} />
        </W>
      </Stage>
      <Chapter frame={frame} title="PLANNING" sub="THE WAR ROOM" dark />
      <Shout frame={frame} x={960} y={190} size={120} lines={[[{ text: "EUREKA!", at: c.eureka }]]} />
      <AbsoluteFill style={{ background: PAPER, opacity: frame >= c.eureka ? Math.exp(-(frame - c.eureka) / 2.5) * 0.35 : 0, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
