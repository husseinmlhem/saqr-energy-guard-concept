// Scene 9 — AMR · THE PLAN. Amr stands and thinks it through while the timeline fills in row by row on the beat.
// Around him, Hussein and Ali sprint back and forth — in front of him, behind him, out of frame and back in —
// until they run straight into each other (BONK). "Timeline's locked. Let's go, team!" — Amr heads off,
// and the two scramble up and race past him, out in front.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos } from "../characters/Character";
import { POSES, Pose, lerpPose, walkPose, withIdle } from "../characters/rig";
import { clamp01, easeIn, easeInOut, easeOut, popIn, shake } from "../fx/anim";
import { ImpactLines, OrbitStars, SpeedLines } from "../fx/Fx";
import { BEAT_FRAMES, beatClock, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { lineText, voiceFrames } from "../voice";
import { ACCENT, FONT, GOLD, INK, PAPER, STROKE } from "../theme";
import { Chapter, Stage, Subtitle, W, breathe, camAt, faceCam } from "./kit";
import { Cues, SceneProps } from "./types";

const ROWS = [
  { name: "Design", start: 0.0, len: 0.3, color: ACCENT },
  { name: "Booth build", start: 0.22, len: 0.38, color: "#5D8FC2" },
  { name: "Content", start: 0.35, len: 0.4, color: "#7B61C4" },
  { name: "Event day", start: 0.78, len: 0.16, color: GOLD },
];
const BOARD = { x: 200, y: 170, w: 980, h: 500 };
const AX = 1440;
const G = 1010;
const FRONT = { y: G + 40, s: 1.5 };
const BACK = { y: G - 95, s: 1.02 };
const LEFT = -260;
const RIGHT = 2180;
const MEET = 800; // where they collide

type Runner = "hussein" | "ali";
/** a pass across the screen: centred on beat `at` (fractional), lasting `dur` beats, on the front or back plane */
type Pass = { at: number; dir: 1 | -1; plane: "front" | "back" };
const PASSES: Record<Runner, Pass[]> = {
  hussein: [
    { at: 0.4, dir: 1, plane: "front" },
    { at: 1.4, dir: -1, plane: "back" },
  ],
  ali: [
    { at: 0.9, dir: -1, plane: "back" },
    { at: 1.9, dir: 1, plane: "front" },
  ],
};
const PASS_BEATS = 0.75;

export const amrCues = (slot: SceneSlot) => {
  const bf = (x: number) => Math.round(beatOf(slot, Math.floor(x)) + (x - Math.floor(x)) * BEAT_FRAMES);
  const rows = ROWS.map((_, i) => beatOf(slot, i));
  const collide = beatOf(slot, 3);
  const lock = beatOf(slot, 5);
  const go = lock;
  const walk = beatOf(slot, 6);
  const overtake = bf(6.4);
  const passes = (Object.keys(PASSES) as Runner[]).flatMap((id) => PASSES[id].map((p) => ({ id, ...p, mid: bf(p.at) })));
  const cues: Cues = {
    marks: [
      { f: 0, name: "Amr thinks it through" },
      ...rows.map((f, i) => ({ f, name: `timeline: ${ROWS[i].name}` })),
      ...passes.map((p) => ({ f: p.mid, name: `${p.id} runs past (${p.plane})` })),
      { f: collide, name: "BONK — Hussein & Ali collide" },
      { f: lock, name: "LOCKED — Let's go, team!" },
      { f: walk, name: "Amr heads off" },
      { f: overtake, name: "they race past him" },
    ],
    sfx: [
      ...rows.map((f) => ({ f, name: "tick" as const, volume: 0.45 })),
      ...passes.map((p) => ({ f: p.mid - 3, name: "whoosh" as const, volume: 0.45 })),
      { f: collide, name: "bonk", volume: 1 },
      { f: collide, name: "boing", volume: 0.6 },
      { f: lock, name: "stamp", volume: 0.9 },
      { f: overtake - 3, name: "whoosh", volume: 0.6 },
    ],
    voice: [
      { f: 0, id: "amr_think", sub: true },
      { f: collide + 1, id: "hussein_watch", sub: true },
      { f: go, id: "amr_lead" },
    ],
  };
  return { rows, collide, lock, go, walk, overtake, passes, cues };
};

const Gantt: React.FC<{ frame: number; c: ReturnType<typeof amrCues> }> = ({ frame, c }) => {
  const { x, y, w, h } = BOARD;
  const lx = x + 300;
  const cw = w - 340;
  const locked = frame >= c.lock;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="rgba(255,255,255,0.92)" stroke={INK} strokeWidth={STROKE} />
      <text x={x + 36} y={y + 64} fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>
        PROJECT TIMELINE
      </text>
      {["W1", "W2", "W3", "W4", "W5", "W6"].map((wk, i) => (
        <g key={wk}>
          <text x={lx + (i + 0.5) * (cw / 6)} y={y + 120} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill="#7A8496">
            {wk}
          </text>
          <line x1={lx + i * (cw / 6)} x2={lx + i * (cw / 6)} y1={y + 136} y2={y + h - 24} stroke="#E3E8EF" strokeWidth={3} />
        </g>
      ))}
      {ROWS.map((r, i) => {
        const ry = y + 150 + i * 80;
        const k = easeOut(clamp01((frame - c.rows[i] + 2) / 8));
        return (
          <g key={r.name}>
            <text x={x + 36} y={ry + 40} fontFamily={FONT} fontWeight={800} fontSize={26} fill={INK}>
              {r.name}
            </text>
            <rect x={lx} y={ry + 12} width={cw} height={44} rx={10} fill="#F1F4F8" />
            <rect x={lx + r.start * cw} y={ry + 12} width={r.len * cw * k} height={44} rx={10} fill={r.color} stroke={INK} strokeWidth={4} opacity={k > 0 ? 1 : 0} />
            {k >= 1 && (
              <g transform={`translate(${lx + (r.start + r.len) * cw + 30} ${ry + 34}) scale(${popIn(frame, c.rows[i] + 6, 500, 12)})`}>
                <circle r={18} fill="#3FBF6F" stroke={INK} strokeWidth={4} />
                <path d="M -8 0 l 6 6 l 10 -12" fill="none" stroke={PAPER} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
          </g>
        );
      })}
      {locked && (
        <g transform={`translate(${x + w - 200} ${y + 70}) rotate(-10) scale(${1 + (1 - popIn(frame, c.lock - 1, 500, 12)) * 1.3})`}>
          <rect x={-150} y={-46} width={300} height={92} rx={14} fill="rgba(255,255,255,0.85)" stroke={ACCENT} strokeWidth={9} />
          <text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} letterSpacing={6} fill={ACCENT}>
            LOCKED
          </text>
        </g>
      )}
    </g>
  );
};

/** where a runner is (screen space), what they're doing */
const runnerAt = (id: Runner, frame: number, c: ReturnType<typeof amrCues>) => {
  const dur = PASS_BEATS * BEAT_FRAMES;
  // 1) passes across the screen
  for (const p of c.passes.filter((q) => q.id === id)) {
    const t = (frame - (p.mid - dur / 2)) / dur;
    if (t >= 0 && t <= 1) {
      const x = p.dir > 0 ? LEFT + (RIGHT - LEFT) * t : RIGHT - (RIGHT - LEFT) * t;
      const pl = p.plane === "front" ? FRONT : BACK;
      return { x, y: pl.y, s: pl.s, flip: p.dir < 0, state: "run" as const, plane: p.plane };
    }
  }
  // 2) the collision: both come in on the front plane and meet in the middle
  const approach = Math.round(0.45 * BEAT_FRAMES);
  const from = id === "hussein" ? LEFT : RIGHT;
  const to = id === "hussein" ? MEET - 70 : MEET + 70;
  if (frame >= c.collide - approach && frame < c.collide) {
    const t = (frame - (c.collide - approach)) / approach;
    return { x: from + (to - from) * easeIn(t), y: FRONT.y, s: FRONT.s, flip: id === "ali", state: "run" as const, plane: "front" as const };
  }
  // 3) knocked back, dazed on the floor
  if (frame >= c.collide && frame < c.overtake - 6) {
    const k = easeOut(clamp01((frame - c.collide) / 8));
    return { x: to + (id === "hussein" ? -90 : 90) * k, y: FRONT.y, s: FRONT.s, flip: id === "ali", state: "dazed" as const, plane: "front" as const };
  }
  // 4) scramble up and race past Amr, out to the right
  if (frame >= c.overtake - 6) {
    const t = clamp01((frame - (c.overtake - 6)) / (BEAT_FRAMES * 1.1));
    const x0 = to + (id === "hussein" ? -90 : 90);
    return { x: x0 + (RIGHT + 200 - x0) * easeIn(t) - (id === "ali" ? 120 : 0) * (1 - t), y: FRONT.y, s: FRONT.s, flip: false, state: t > 0.02 ? ("run" as const) : ("up" as const), plane: "front" as const };
  }
  return null;
};

export const S09Amr: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => amrCues(slot), [slot]);
  const m = idleMotion(frame, 0.1, 0.6);
  const sh = shake(frame, [c.collide], 16);
  const amrFace = headScreenPos("amr", AX, G, 1.55, POSES.point);
  const cam = breathe(
    camAt(frame, [
      [0, { x: 960, y: 540, zoom: 1.0 }],
      [c.collide - 1, { x: 960, y: 540, zoom: 1.0 }],
      [c.collide + 3, { x: MEET, y: 640, zoom: 1.3 }],
      [c.lock - 3, { x: MEET + 40, y: 640, zoom: 1.32 }],
      [c.lock + 3, faceCam(amrFace, 1.8, 120, 160)],
      [c.walk - 1, faceCam(amrFace, 1.85, 120, 160)],
      [c.walk + 8, { x: 1100, y: 540, zoom: 1.0 }],
      [slot.durationInFrames, { x: 1160, y: 540, zoom: 1.02 }],
    ]),
    frame,
  );
  cam.x += sh.x;
  cam.y += sh.y;

  // Amr: thinking (hand on chin, head following the chaos), then points, then walks off right
  const walkT = clamp01((frame - c.walk) / (slot.durationInFrames - c.walk));
  const amrX = AX + easeIn(walkT) * 700;
  let amrPose: Pose = withIdle({ ...POSES.think, head: 6 + Math.sin(frame / 7) * 6 }, m);
  if (frame >= c.lock - 2) amrPose = lerpPose(amrPose, withIdle({ ...POSES.point, rArm: [104, -6] }, m), easeInOut(clamp01((frame - c.lock + 2) / 6)));
  if (frame >= c.walk) amrPose = walkPose(POSES.relaxed, beatClock(frame), 70, 1, 20);

  const runners = (["hussein", "ali"] as Runner[]).map((id) => ({ id, r: runnerAt(id, frame, c) }));
  const draw = (id: Runner, r: NonNullable<ReturnType<typeof runnerAt>>) => {
    const phase = beatClock(frame) * 2 + (id === "ali" ? 0.5 : 0);
    let pose: Pose = walkPose({ ...POSES.relaxed, lean: 14 }, phase, 95, 1, 34);
    let rot = 0;
    let y = r.y;
    if (r.state === "dazed") {
      pose = POSES.sitDazed;
      rot = id === "hussein" ? -8 : 8;
    }
    if (r.state === "up") pose = POSES.stand;
    const head = headScreenPos(id, r.x, y, r.s * (r.state === "dazed" ? 0.95 : 1), pose, r.flip, rot);
    return (
      <React.Fragment key={id}>
        <Character id={id} x={r.x} y={y} scale={r.s * (r.state === "dazed" ? 0.95 : 1)} pose={pose} rotate={rot} flip={r.flip} expression={r.state === "dazed" ? (id === "ali" ? "shocked" : "tired") : "happy"} left="none" right="none" frame={frame} shadow={r.state !== "run"} />
        <W>
          {r.state === "run" && (
            <g opacity={0.8}>
              {[0, 1, 2].map((k) => (
                <circle key={k} cx={r.x - (r.flip ? -1 : 1) * (60 + k * 40)} cy={y - 10 - k * 6} r={14 - k * 3} fill="#E3E8EF" stroke={INK} strokeWidth={2} opacity={0.7 - k * 0.2} />
              ))}
              {[0, 1, 2, 3].map((k) => (
                <line key={`l${k}`} x1={r.x - (r.flip ? -1 : 1) * (90 + k * 22)} x2={r.x - (r.flip ? -1 : 1) * (190 + k * 40)} y1={y - 260 * r.s + k * 70 * r.s} y2={y - 260 * r.s + k * 70 * r.s} stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
              ))}
            </g>
          )}
          {r.state === "dazed" && <OrbitStars frame={frame} x={head.x} y={head.y - head.r * 1.05} rx={head.r * 0.95} n={4} />}
        </W>
      </React.Fragment>
    );
  };

  return (
    <AbsoluteFill>
      <Stage cam={cam} variant="meeting">
        <W>
          <Gantt frame={frame} c={c} />
          {/* Amr's thought bubble while he plans */}
          {frame < c.lock - 2 && (
            <g transform={`translate(${AX + 150} ${G - 640}) scale(${popIn(frame, 2, 300, 16)})`}>
              <circle cx={-70} cy={120} r={10} fill={PAPER} stroke={INK} strokeWidth={4} />
              <circle cx={-40} cy={84} r={16} fill={PAPER} stroke={INK} strokeWidth={4} />
              <ellipse cx={20} cy={20} rx={92} ry={60} fill={PAPER} stroke={INK} strokeWidth={4} />
              {[0, 1, 2].map((k) => (
                <rect key={k} x={-40} y={-4 + k * 18} width={30 + ((k * 37 + Math.floor(frame / 6) * 13) % 50)} height={10} rx={5} fill={[ACCENT, "#7B61C4", GOLD][k]} />
              ))}
            </g>
          )}
        </W>
        {/* back plane runners pass behind Amr */}
        {runners.filter(({ r }) => r && r.plane === "back").map(({ id, r }) => draw(id, r!))}
        <Character id="amr" x={amrX} y={G} scale={1.55} pose={amrPose} expression={frame >= c.collide ? "happy" : "neutral"} left="none" right="none" headTilt={m.headTilt} frame={frame} />
        {runners.filter(({ r }) => r && r.plane === "front").map(({ id, r }) => draw(id, r!))}
        <W>
          <ImpactLines frame={frame} at={c.collide} x={MEET} y={FRONT.y - 330} r={150} n={12} />
          {frame >= c.overtake && frame < c.overtake + 14 && <SpeedLines frame={frame} n={12} dir={1} y0={600} y1={1000} opacity={1 - (frame - c.overtake) / 14} />}
        </W>
      </Stage>
      <Chapter frame={frame} title="AMR" sub="THE PLAN" />
      <Subtitle frame={frame} at={c.go} frames={voiceFrames("amr_lead")} speaker="Amr" text={lineText("amr_lead")} />
    </AbsoluteFill>
  );
};
