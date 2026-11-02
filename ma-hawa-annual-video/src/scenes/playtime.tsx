// Playtime kit: what each of the three is "busy" with before Michael walks in.
//   Ali     — dumbbell curls, one rep on every beat (left on even beats, right on odd ones)
//   Amr     — stretched out on a sun lounger, blowing up a balloon: one breath per beat
//   Hussein — shisha + balloon: a pull from the hose, then he blows the smoke into the balloon (alternating beats)
// Used by the split-screen intro (S01Play) and by the office scenes that follow (S02Stop, S03Bonk).
import React from "react";
import { headScreenPos, jointScreenPos } from "../characters/Character";
import { HEAD_R, charCfg, CharId } from "../characters/config";
import { DIMS, Pose, POSES, Pt, solve, withIdle } from "../characters/rig";
import { clamp01, easeInOut, easeOut, rand } from "../fx/anim";
import { BEAT_FRAMES, beatClock, beatPhase, idleMotion } from "../sync/beats";
import { ACCENT, INK, PAPER, STROKE } from "../theme";

export const balloonR = (breaths: number) => 10 + 54 * (1 - Math.exp(-breaths / 3.6));

/** body-space mouth of a character in a pose (hand IK targets are body space too) */
export const mouthOf = (id: CharId, pose: Pose): Pt => solve(pose, DIMS[charCfg(id).body], HEAD_R).mouth;

/** 0..1, peaks exactly on the beat: how far a "move that lands on the beat" has travelled */
export const onBeat = (frame: number, sharp = 1.6) => {
  const p = beatPhase(frame);
  // rise through the second half of the previous beat, hit at 0, fall during the first half
  const d = p < 0.5 ? p : 1 - p;
  return Math.pow(1 - clamp01(d / 0.5), sharp);
};

// ------------------------------------------------------------------ Ali: dumbbell curls
/** alternating curls: the left dumbbell tops out on even beats, the right one on odd beats */
export const curlPose = (frame: number, seed = 0, amount = 1): Pose => {
  const t = beatClock(frame);
  const even = Math.round(t) % 2 === 0;
  const up = onBeat(frame, 1.3) * amount;
  const l = even ? up : 0;
  const r = even ? 0 : up;
  const m = idleMotion(frame, seed, 0.5);
  return withIdle(
    {
      ...POSES.stand,
      lean: (r - l) * 3,
      hipY: 6 + up * 6,
      lArm: [-12 - l * 6, -8 - l * 140],
      rArm: [12 + r * 6, 8 + r * 140],
      head: (r - l) * 4,
      lFoot: { x: -34, y: 0 },
      rFoot: { x: 34, y: 0 },
    },
    m,
  );
};

/** a hex dumbbell centred on a hand (screen space) */
export const Dumbbell: React.FC<{ x: number; y: number; s: number; rot?: number; color?: string }> = ({ x, y, s, rot = 0, color = "#2B2F38" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-34} y={-5} width={68} height={10} rx={4} fill="#B9C0CC" stroke={INK} strokeWidth={3} />
    {[-1, 1].map((k) => (
      <g key={k} transform={`translate(${k * 34} 0)`}>
        <rect x={-11} y={-24} width={22} height={48} rx={6} fill={color} stroke={INK} strokeWidth={4} />
        <rect x={-6} y={-18} width={5} height={30} rx={2} fill="#FFFFFF" opacity={0.18} />
      </g>
    ))}
  </g>
);

// ------------------------------------------------------------------ Amr: balloon by mouth on a sun lounger
/** reclined on a lounger (body space; render with rotate = LOUNGE_ROT around the hips) */
export const LOUNGE_ROT = -38;
export const loungePose = (frame: number): Pose => {
  const breath = onBeat(frame, 1.2);
  return {
    ...POSES.stand,
    plant: false,
    hipY: 0,
    lean: 0,
    lLeg: [38, 18],
    rLeg: [46, 10],
    hold: "mouth",
    armsFront: true,
    head: 4 - breath * 3,
  };
};

/** blowing a balloon while standing (office version) */
export const blowStandPose = (frame: number, seed = 0): Pose => {
  const breath = onBeat(frame, 1.2);
  return withIdle({ ...POSES.blow, lean: -breath * 2, hipY: 4 + breath * 4 }, idleMotion(frame, seed, 0.4));
};

/** how inflated a mouth-blown balloon is: one breath on every beat from `from` */
export const breathsAt = (frame: number, beats: number[]) => {
  const done = beats.filter((f) => frame >= f).length;
  const next = beats.find((f) => f > frame);
  const grow = next !== undefined ? easeOut(clamp01(1 - (next - frame) / (BEAT_FRAMES * 0.5))) : 0;
  return done + (done < beats.length ? grow : 0);
};

/** a balloon at someone's lips, bulging out to the side so the face stays visible */
export const MouthBalloon: React.FC<{ mouth: Pt; headR: number; r: number; fill: string; side?: 1 | -1; frame: number; smoke?: number }> = ({ mouth, headR, r, fill, side = 1, frame, smoke = 0 }) => {
  const cx = mouth.x + side * (headR * 0.55 + r * 0.95);
  const cy = mouth.y - r * 0.15;
  const wob = Math.sin(frame / 5) * 2;
  return (
    <g>
      <path d={`M ${mouth.x + side * 6} ${mouth.y + 2} Q ${mouth.x + side * headR * 0.35} ${mouth.y + 6} ${cx - side * r * 0.95} ${cy + 4}`} fill="none" stroke={INK} strokeWidth={STROKE * 2.4} strokeLinecap="round" />
      <path d={`M ${mouth.x + side * 6} ${mouth.y + 2} Q ${mouth.x + side * headR * 0.35} ${mouth.y + 6} ${cx - side * r * 0.95} ${cy + 4}`} fill="none" stroke={fill} strokeWidth={STROKE * 1.2} strokeLinecap="round" />
      <g transform={`translate(${cx} ${cy}) rotate(${side * (90 + wob)})`}>
        <ellipse rx={r} ry={r * 1.1} fill={fill} stroke={INK} strokeWidth={STROKE} />
        {smoke > 0 && (
          <g opacity={0.55 * smoke}>
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={Math.sin(frame / 9 + k * 2) * r * 0.35} cy={Math.cos(frame / 11 + k) * r * 0.35} r={r * (0.38 - k * 0.07)} fill="#E7ECF2" />
            ))}
          </g>
        )}
        <path d={`M ${-r * 0.45} ${-r * 0.45} q ${r * 0.15} ${-r * 0.3} ${r * 0.45} ${-r * 0.35}`} fill="none" stroke={PAPER} strokeWidth={7} strokeLinecap="round" opacity={0.9} />
      </g>
    </g>
  );
};

/** side-view sun lounger; hip = where the back rest meets the seat (screen space) */
export const Lounger: React.FC<{ hip: Pt; s: number; ground: number }> = ({ hip, s, ground }) => {
  const a = (LOUNGE_ROT * Math.PI) / 180;
  // back rest leans left/up along the (rotated) torso
  const bx = Math.sin(a);
  const by = -Math.cos(a);
  const p0 = { x: hip.x - 18 * s, y: hip.y + 34 * s };
  const top = { x: p0.x + bx * 210 * s, y: p0.y + by * 210 * s };
  const seatEnd = { x: p0.x + 250 * s, y: p0.y + 6 * s };
  const stripes = 5;
  return (
    <g>
      {/* frame legs */}
      {[p0.x + 10 * s, seatEnd.x - 16 * s].map((lx, i) => (
        <line key={i} x1={lx} y1={p0.y + 8 * s} x2={lx + (i ? 10 : -10) * s} y2={ground} stroke="#8A6A48" strokeWidth={8 * s} strokeLinecap="round" />
      ))}
      <line x1={top.x} y1={top.y} x2={p0.x - 40 * s} y2={ground} stroke="#8A6A48" strokeWidth={7 * s} strokeLinecap="round" />
      {/* back rest + seat, striped canvas */}
      <path d={`M ${top.x} ${top.y} L ${p0.x} ${p0.y} L ${seatEnd.x} ${seatEnd.y}`} fill="none" stroke={INK} strokeWidth={30 * s} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${top.x} ${top.y} L ${p0.x} ${p0.y} L ${seatEnd.x} ${seatEnd.y}`} fill="none" stroke={PAPER} strokeWidth={22 * s} strokeLinecap="round" strokeLinejoin="round" />
      {Array.from({ length: stripes }, (_, k) => {
        const t0 = k / stripes;
        const t1 = t0 + 0.5 / stripes;
        const q = (t: number) => (t < 0.45 ? { x: top.x + (p0.x - top.x) * (t / 0.45), y: top.y + (p0.y - top.y) * (t / 0.45) } : { x: p0.x + (seatEnd.x - p0.x) * ((t - 0.45) / 0.55), y: p0.y + (seatEnd.y - p0.y) * ((t - 0.45) / 0.55) });
        const A = q(t0);
        const B = q(Math.min(1, t1));
        return <line key={k} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={ACCENT} strokeWidth={22 * s} />;
      })}
    </g>
  );
};

/** beach umbrella planted in the sand / on the office carpet */
export const Umbrella: React.FC<{ x: number; ground: number; s: number; tilt?: number; base?: string }> = ({ x, ground, s, tilt = -12, base = PAPER }) => (
  <g transform={`translate(${x} ${ground}) rotate(${tilt}) scale(${s})`}>
    <line x1={0} y1={0} x2={0} y2={-430} stroke="#7A6248" strokeWidth={9} strokeLinecap="round" />
    <path d="M -230 -380 Q 0 -560 230 -380 Z" fill={base} stroke={INK} strokeWidth={STROKE / s} strokeLinejoin="round" />
    {[-1, 0, 1].map((k) => (
      <path key={k} d={`M ${k * 153 - 38} -${k === 0 ? 474 : 420} Q ${k * 153} -${k === 0 ? 500 : 455} ${k * 153 + 38} -${k === 0 ? 474 : 420} L ${k * 115} -380 Z`} fill={ACCENT} opacity={0.95} />
    ))}
    <path d="M -230 -380 Q 0 -560 230 -380" fill="none" stroke={INK} strokeWidth={STROKE / s} />
    {[-230, -115, 0, 115, 230].map((ex) => (
      <path key={ex} d={`M ${ex - 57} -380 q 28 18 57 0 q 28 18 57 0`} fill="none" stroke={INK} strokeWidth={3} opacity={ex === 230 ? 0 : 0.5} />
    ))}
  </g>
);

// ------------------------------------------------------------------ Hussein: shisha + balloon
/** even beats: a pull on the shisha (left hand at the lips); odd beats: blow it into the balloon (right hand) */
export const shishaPose = (id: CharId, frame: number, seed = 0, sitting = false): { pose: Pose; inhale: number; blow: number } => {
  const t = beatClock(frame);
  const k = Math.round(t);
  const hit = onBeat(frame, 1.1);
  const inhale = k % 2 === 0 ? hit : 0;
  const blow = k % 2 === 1 ? hit : 0;
  const m = idleMotion(frame, seed, 0.35);
  const base: Pose = sitting
    ? { ...POSES.stand, hipY: 64, lFoot: { x: -62, y: 0 }, rFoot: { x: 62, y: 0 }, lean: -2 }
    : { ...POSES.stand, hipY: 4, lFoot: { x: -30, y: 0 }, rFoot: { x: 30, y: 0 } };
  const mouth = mouthOf(id, base);
  const restL = { x: -64, y: mouth.y + 120 };
  const restR = { x: 72, y: mouth.y + 112 };
  const atL = { x: mouth.x - 18, y: mouth.y + 14 };
  const atR = { x: mouth.x + 18, y: mouth.y + 14 };
  const mix = (a: Pt, b: Pt, u: number) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
  const reachL = easeInOut(clamp01(inhale * 1.25));
  const reachR = easeInOut(clamp01(blow * 1.25));
  const pose = withIdle({ ...base, lHand: mix(restL, atL, reachL), rHand: mix(restR, atR, reachR), head: -inhale * 4 + blow * 3, armsFront: reachL > 0.4 || reachR > 0.4 }, m);
  return { pose, inhale, blow };
};

/** a tall shisha standing on the floor; `glow` lights the coals (0..1) */
export const Shisha: React.FC<{ x: number; ground: number; s: number; glow: number; frame: number }> = ({ x, ground, s, glow, frame }) => {
  const bub = glow > 0.05;
  return (
    <g transform={`translate(${x} ${ground}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={70} ry={10} fill="rgba(20,20,30,0.18)" />
      {/* glass base */}
      <path d="M -24 -120 C -26 -96, -62 -86, -62 -46 C -62 -12, -34 0, 0 0 C 34 0, 62 -12, 62 -46 C 62 -86, 26 -96, 24 -120 Z" fill="#7FC7C2" fillOpacity={0.75} stroke={INK} strokeWidth={STROKE / s} />
      <path d="M -52 -48 C -52 -16, -30 -6, 0 -6 C 30 -6, 52 -16, 52 -48 Z" fill="#4E9E98" opacity={0.6} />
      <path d="M -40 -80 q -8 22 -4 44" fill="none" stroke={PAPER} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
      {bub &&
        [0, 1, 2, 3].map((k) => {
          const ph = (frame * 0.35 + k * 0.27) % 1;
          return <circle key={k} cx={(rand(k) - 0.5) * 50} cy={-14 - ph * 34} r={4 + rand(k + 5) * 4} fill={PAPER} opacity={(1 - ph) * glow} />;
        })}
      {/* stem with brass rings */}
      <rect x={-9} y={-330} width={18} height={214} rx={6} fill="#C9A24A" stroke={INK} strokeWidth={STROKE / s} />
      {[-300, -250, -190, -150].map((yy) => (
        <ellipse key={yy} cx={0} cy={yy} rx={17} ry={7} fill="#D9B25A" stroke={INK} strokeWidth={(STROKE * 0.7) / s} />
      ))}
      {/* tray + bowl + coals */}
      <ellipse cx={0} cy={-330} rx={56} ry={11} fill="#B8913E" stroke={INK} strokeWidth={STROKE / s} />
      <path d="M -26 -340 L 26 -340 L 18 -378 L -18 -378 Z" fill="#9B4B32" stroke={INK} strokeWidth={STROKE / s} />
      {[-12, 2, 14].map((cx, k) => (
        <rect key={k} x={cx - 8} y={-394} width={16} height={14} rx={3} fill={glow > 0.05 ? `rgb(${200 + 55 * glow}, ${80 + 60 * glow}, 40)` : "#5C5C5C"} stroke={INK} strokeWidth={2.5} />
      ))}
      {glow > 0.05 && <circle cx={0} cy={-388} r={30 + glow * 14} fill="#FFB347" opacity={0.25 * glow} />}
      {/* hose port */}
      <circle cx={-20} cy={-112} r={8} fill="#C9A24A" stroke={INK} strokeWidth={2.5} />
    </g>
  );
};

/** the hose from the shisha's port to a hand (screen space) */
export const ShishaHose: React.FC<{ from: Pt; to: Pt; sag?: number }> = ({ from, to, sag = 140 }) => {
  const d = `M ${from.x} ${from.y} C ${from.x - 60} ${from.y + sag}, ${to.x - 30} ${to.y + sag}, ${to.x} ${to.y}`;
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={15} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#8C2F39" strokeWidth={9} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#C9A24A" strokeWidth={9} strokeLinecap="round" strokeDasharray="4 16" />
      <rect x={to.x - 6} y={to.y - 22} width={12} height={30} rx={4} fill="#C9A24A" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** soft smoke puffs rising from a point, born every `every` frames (screen space) */
export const Smoke: React.FC<{ frame: number; x: number; y: number; amount?: number; spread?: number; seed?: number }> = ({ frame, x, y, amount = 1, spread = 1, seed = 0 }) => (
  <g opacity={0.85 * amount}>
    {Array.from({ length: 6 }, (_, k) => {
      const life = 42;
      const ph = ((frame + k * 7 + seed * 13) % life) / life;
      const r = (16 + ph * 46) * spread;
      return <circle key={k} cx={x + Math.sin(ph * 5 + k + seed) * 26 * spread + ph * 30} cy={y - ph * 170 * spread} r={r} fill="#EEF2F6" opacity={(1 - ph) * 0.7} stroke="rgba(17,17,17,0.15)" strokeWidth={2} />;
    })}
  </g>
);

// ------------------------------------------------------------------ the same activities in the office (S02Stop, S03Bonk)
export const OFFICE_SHISHA = { x: 1250, s: 1.0 };

/** pose + props for one of the three, doing their thing in the office (screen space, around x/ground/scale) */
export const officeActivity = (id: "ali" | "amr" | "hussein", frame: number, x: number, g: number, s: number, fills: Record<string, string>) => {
  if (id === "ali") {
    const pose = curlPose(frame, 0.1);
    const hl = jointScreenPos(id, x, g, s, pose, "handL");
    const hr = jointScreenPos(id, x, g, s, pose, "handR");
    return {
      pose,
      front: (
        <>
          <Dumbbell x={hl.x} y={hl.y} s={s * 0.9} />
          <Dumbbell x={hr.x} y={hr.y} s={s * 0.9} />
        </>
      ),
    };
  }
  if (id === "amr") {
    const pose = blowStandPose(frame, 0.3);
    const head = headScreenPos(id, x, g, s, pose);
    const mouth = jointScreenPos(id, x, g, s, pose, "mouth");
    return { pose, front: <MouthBalloon mouth={mouth} headR={head.r} r={balloonR(9) * s * (1 + onBeat(frame) * 0.06)} fill={fills.amr} frame={frame} /> };
  }
  const sh = shishaPose(id, frame, 0.4, false);
  const head = headScreenPos(id, x, g, s, sh.pose);
  const mouth = jointScreenPos(id, x, g, s, sh.pose, "mouth");
  const hl = jointScreenPos(id, x, g, s, sh.pose, "handL");
  const hr = jointScreenPos(id, x, g, s, sh.pose, "handR");
  const r = balloonR(8) * s;
  const port = { x: OFFICE_SHISHA.x - 20 * OFFICE_SHISHA.s, y: g - 112 * OFFICE_SHISHA.s };
  return {
    pose: sh.pose,
    inhale: sh.inhale,
    front: (
      <>
        <ShishaHose from={port} to={hl} sag={150} />
        {sh.blow > 0.35 ? (
          <MouthBalloon mouth={mouth} headR={head.r} r={r} fill={fills.hussein} frame={frame} smoke={1} />
        ) : (
          <g>
            <ellipse cx={hr.x + 6} cy={hr.y - r * 1.15} rx={r} ry={r * 1.1} fill={fills.hussein} stroke={INK} strokeWidth={STROKE} />
            <ellipse cx={hr.x + 6} cy={hr.y - r * 1.15} rx={r * 0.6} ry={r * 0.55} fill="#E7ECF2" opacity={0.45} />
            <path d={`M ${hr.x - 2} ${hr.y - 6} l 8 -10 l 8 10 Z`} fill={fills.hussein} stroke={INK} strokeWidth={3} />
          </g>
        )}
      </>
    ),
  };
};

/** props hidden behind the back: drawn BEFORE the character so the body covers them, only the ends peek out */
export const HiddenProps: React.FC<{ id: "ali" | "amr" | "hussein"; x: number; g: number; s: number; pose: Pose; fill: string; frame: number; side: 1 | -1 }> = ({ id, x, g, s, pose, fill, frame, side }) => {
  const head = headScreenPos(id, x, g, s, pose);
  const hip = jointScreenPos(id, x, g, s, pose, "hip");
  if (id === "ali")
    return (
      <>
        <Dumbbell x={hip.x - 52 * s} y={hip.y - 18 * s} s={s * 0.9} rot={-12} />
        <Dumbbell x={hip.x + 52 * s} y={hip.y - 22 * s} s={s * 0.9} rot={10} />
      </>
    );
  const r = balloonR(9) * s * 0.92;
  const bx = head.x + side * 92;
  const by = head.y + 30 + Math.sin(frame / 7) * 3;
  return (
    <>
      {id === "hussein" && <ShishaHose from={{ x: OFFICE_SHISHA.x - 20, y: g - 112 }} to={{ x: hip.x + 20, y: hip.y - 40 }} sag={120} />}
      <ellipse cx={bx} cy={by} rx={r} ry={r * 1.1} fill={fill} stroke={INK} strokeWidth={STROKE} />
      <path d={`M ${bx - r * 0.45} ${by - r * 0.45} q ${r * 0.15} ${-r * 0.3} ${r * 0.45} ${-r * 0.35}`} fill="none" stroke={PAPER} strokeWidth={7} strokeLinecap="round" />
    </>
  );
};

// ------------------------------------------------------------------ thinking: scratching the (bald) head
/** right hand up on top of the head, fingers scratching fast; drawn in front of the head */
export const scratchHeadPose = (id: CharId, frame: number, base: Pose): Pose => {
  const hc = solve(base, DIMS[charCfg(id).body], HEAD_R).headCenter;
  const wig = Math.sin(frame * 1.7) * 9;
  return { ...base, rHand: { x: hc.x + HEAD_R * 0.32 + wig, y: hc.y - HEAD_R * 0.86 + Math.abs(wig) * 0.3 }, lArm: [-14, -70], armsFront: true, head: -4 };
};

/** little "scratch scratch" marks next to a head (screen space) */
export const ScratchMarks: React.FC<{ x: number; y: number; r: number; frame: number }> = ({ x, y, r, frame }) => (
  <g opacity={0.9}>
    {[0, 1, 2].map((i) => {
      const on = Math.floor(frame / 3 + i) % 2;
      return <path key={i} d={`M ${x + r * (0.75 + i * 0.12)} ${y - r * (0.9 - i * 0.22)} l ${r * 0.18} ${-r * 0.1}`} stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={on ? 1 : 0.25} />;
    })}
  </g>
);

// ------------------------------------------------------------------ Ali's dance: hands on his head, hips shaking on the beat
export const hipShakePose = (id: CharId, frame: number): Pose => {
  const clock = beatClock(frame);
  const sway = Math.cos(Math.PI * clock); // ±1, flips side on every beat
  const bounce = Math.abs(Math.sin(Math.PI * clock));
  const body: Pose = { ...POSES.stand, hipX: sway * 20, hipY: 8 + bounce * 6, lean: -sway * 5, lFoot: { x: -42, y: 0 }, rFoot: { x: 42, y: 0 }, head: sway * 4 };
  const hc = solve(body, DIMS[charCfg(id).body], HEAD_R).headCenter;
  return { ...body, lHand: { x: hc.x - HEAD_R * 0.52, y: hc.y - HEAD_R * 0.72 }, rHand: { x: hc.x + HEAD_R * 0.52, y: hc.y - HEAD_R * 0.72 }, armsFront: true };
};
