// Scene 1 — Playtime.
// 1) Ali, Amr (centre) and Hussein blow up balloons — one breath per beat.
// 2) Amr and Hussein tie theirs off and volley Amr's balloon on the beat; Hussein ties his to his goggles.
// 3) Ali keeps blowing… his balloon pops in his face on the beat.
// 4) Hussein's balloon floats away with his goggles.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, jointScreenPos } from "../characters/Character";
import { Expression, HEAD_R, charCfg } from "../characters/config";
import { DIMS, POSES, Pose, lerpPose, solve, withIdle } from "../characters/rig";
import { Goggles } from "../characters/props";
import { CHARS } from "../characters/config";
import { arc, clamp01, easeInOut, easeOut, lin, shake } from "../fx/anim";
import { Balloon, Burst, Doodles, Exclaim, ImpactLines, Shreds, Svg } from "../fx/Fx";
import { BEAT_FRAMES, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { ACCENT, INK, PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";
import { Ground } from "./common";

const SCALE = 1.75;
const GROUND = 1045;
type Who = "ali" | "amr" | "hussein";
const X: Record<Who, number> = { ali: 420, amr: 960, hussein: 1500 };
// balloon direction while blowing (deg, 0 = up, + = to the right)
const BLOW_DIR: Record<Who, number> = { ali: -70, amr: 64, hussein: 70 };
const BALLOON_COL: Record<Who, string> = { ali: ACCENT, amr: "#9EC8EC", hussein: "rgba(118,173,222,0.6)" };

export const playtimeCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const inflateEnd = Math.max(3, Math.min(8, Math.floor(n / 2)));
  const popBeat = Math.max(inflateEnd + 2, n - 3);
  const gogglesBeat = Math.min(n - 1, popBeat + 1);
  const puffs = Array.from({ length: inflateEnd }, (_, k) => beatOf(slot, k));
  const aliPuffs = Array.from({ length: popBeat }, (_, k) => beatOf(slot, k));
  const tieOff = beatOf(slot, inflateEnd);
  const taps = Array.from({ length: popBeat - inflateEnd }, (_, k) => ({
    f: beatOf(slot, inflateEnd + k),
    who: (k % 2 === 0 ? "amr" : "hussein") as Who,
  }));
  const pop = beatOf(slot, popBeat);
  const goggles = beatOf(slot, gogglesBeat);
  const cues: Cues = {
    marks: [
      ...puffs.map((f, k) => ({ f, name: `all blow — breath ${k + 1}` })),
      ...aliPuffs.slice(inflateEnd).map((f, k) => ({ f, name: `Ali keeps blowing (${inflateEnd + k + 1})` })),
      ...taps.map((t, i) => ({ f: t.f, name: `tap ${i + 1} (${t.who})` })),
      { f: pop, name: "POP in Ali's face" },
      { f: goggles, name: "goggles float away" },
    ],
    sfx: [
      ...aliPuffs.map((f, k) => ({ f, name: "puff" as const, volume: k < inflateEnd ? 0.7 : 0.55 })),
      ...taps.map((t) => ({ f: t.f, name: "boing" as const, volume: 0.35 })),
      { f: pop, name: "pop" as const, volume: 1 },
      { f: goggles, name: "whoosh" as const, volume: 0.6 },
    ],
  };
  return { inflateEnd, puffs, aliPuffs, tieOff, taps, pop, goggles, popBeat, cues };
};

/** balloon radius after k breaths (eased within the breath that is happening now) */
const radiusAt = (frame: number, breaths: number[], perBreath: (k: number) => number) => {
  let k = 0;
  for (const b of breaths) if (frame >= b) k++;
  if (k === 0) return perBreath(0);
  const last = breaths[k - 1];
  const t = easeOut(clamp01((frame - last) / (BEAT_FRAMES * 0.45)));
  const wobble = Math.sin((frame - last) * 0.9) * Math.exp(-(frame - last) / 4) * 2;
  return perBreath(k - 1) + (perBreath(k) - perBreath(k - 1)) * t + wobble;
};
const normalR = (k: number) => 12 + 50 * (1 - Math.exp(-k / 3));
const aliR = (k: number) => 13 + 8.2 * k;

/** a balloon held at the lips, nozzle at `nozzle`, pointing `dir` degrees */
const BalloonAtMouth: React.FC<{ nozzle: { x: number; y: number }; dir: number; r: number; fill: string }> = ({ nozzle, dir, r, fill }) => (
  <g transform={`translate(${nozzle.x} ${nozzle.y}) rotate(${dir})`}>
    <ellipse cx={0} cy={-(r * 1.12 + 10)} rx={r} ry={r * 1.12} fill={fill} stroke={INK} strokeWidth={STROKE} />
    <path d={`M ${-r * 0.45} ${-(r * 1.12 + 10) - r * 0.45} q ${r * 0.15} ${-r * 0.3} ${r * 0.45} ${-r * 0.35}`} fill="none" stroke={PAPER} strokeWidth={7} strokeLinecap="round" />
    <path d="M -7 -10 L 0 0 L 7 -10 Z" fill={fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

export const S1Playtime: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => playtimeCues(slot), [slot]);
  const cam = shake(frame, [c.pop], 16);
  const blowing = (who: Who) => (who === "ali" ? frame < c.pop : frame < c.tieOff);

  // breathing rhythm: lean back to inhale between beats, forward on the breath (the beat)
  const breath = (who: Who) => {
    const list = who === "ali" ? c.aliPuffs : c.puffs;
    const last = [...list].reverse().find((b) => frame >= b);
    if (last === undefined) return 0;
    const t = (frame - last) / BEAT_FRAMES;
    return Math.exp(-t * 4) - 0.35 * Math.sin(Math.PI * clamp01(t)); // + forward on the beat, - back (inhale)
  };

  // a pose that blows into a balloon: right hand pinches the nozzle at the lips, left hand supports it
  const blowPose = (who: Who, r: number): { pose: Pose; nozzle: { x: number; y: number } } => {
    const body = charCfg(who).body;
    const b = breath(who);
    const base: Pose = { ...POSES.stand, lean: b * 3, hipY: 3 - b * 3, head: BLOW_DIR[who] * 0.06 };
    const sk = solve(base, DIMS[body], HEAD_R);
    const m = sk.mouth;
    const d = (BLOW_DIR[who] * Math.PI) / 180;
    const nozzleBody = { x: m.x + Math.sin(d) * 6, y: m.y + 8 };
    const center = { x: nozzleBody.x + Math.sin(d) * (r * 1.12 + 10), y: nozzleBody.y - Math.cos(d) * (r * 1.12 + 10) };
    // one hand pinches the nozzle from the balloon's side; the other arm hangs relaxed
    const side = Math.sign(BLOW_DIR[who]) || 1;
    const grip = { x: nozzleBody.x + side * 14, y: nozzleBody.y + 22 };
    const pose: Pose = { ...base, armsFront: true, ...(side > 0 ? { rHand: grip } : { lHand: grip }) };
    void center;
    return { pose, nozzle: { x: X[who] + nozzleBody.x * SCALE, y: GROUND + nozzleBody.y * SCALE } };
  };

  // ---- volley balloon (Amr's, after he ties it off)
  const contact = (who: Who) => {
    const h = jointScreenPos(who, X[who], GROUND, SCALE, POSES.tapUp, who === "amr" ? "handR" : "handL");
    return { x: h.x + (who === "amr" ? 10 : -10), y: h.y - 46 };
  };
  let volley: { x: number; y: number } | null = null;
  if (frame >= c.tieOff && frame < c.pop + 4 && c.taps.length) {
    const i = c.taps.findIndex((t, k) => frame >= t.f && (k === c.taps.length - 1 || frame < c.taps[k + 1].f));
    if (i >= 0) {
      const a = c.taps[i];
      const nextWho: Who = a.who === "amr" ? "hussein" : "amr";
      const nextF = i + 1 < c.taps.length ? c.taps[i + 1].f : a.f + BEAT_FRAMES;
      const t = clamp01((frame - a.f) / (nextF - a.f));
      volley = arc(contact(a.who), contact(nextWho), t, 210);
    }
  }
  const tapAmount = (who: Who) => {
    let v = 0;
    for (const t of c.taps) {
      if (t.who !== who) continue;
      const d = frame - t.f;
      v = Math.max(v, d < -6 ? 0 : d < 0 ? (d + 6) / 6 : Math.max(0, 1 - d / 9));
    }
    return easeInOut(v);
  };

  // ---- Hussein's balloon: tied to his goggles after the blowing, floats off with them
  const hHead = jointScreenPos("hussein", X.hussein, GROUND, SCALE, POSES.stand, "headCenter");
  const gogglesGone = frame >= c.goggles;
  const g2t = Math.max(0, frame - c.goggles);
  const tieT = easeInOut(clamp01((frame - c.tieOff) / 10));
  const floatPos = gogglesGone
    ? { x: hHead.x + 70 + g2t * 4 + Math.sin(g2t / 5) * 16, y: hHead.y - 320 - g2t * 10 }
    : { x: hHead.x + 160 + Math.sin(frame / 9) * 10, y: hHead.y - 300 + Math.sin(frame / 7) * 8 };
  const goggleHang = { x: floatPos.x, y: floatPos.y + 200 };

  const people: { id: Who; offset: number }[] = [
    { id: "ali", offset: 0.6 },
    { id: "amr", offset: 0 },
    { id: "hussein", offset: 0.3 },
  ];
  const aliHead = jointScreenPos("ali", X.ali, GROUND, SCALE, POSES.stand, "headCenter");

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Svg>
        <Doodles frame={frame} seed={2} />
      </Svg>
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px)` }}>
        <Ground y={GROUND} />
        {people.map(({ id, offset }) => {
          const m = idleMotion(frame, offset, 0.8);
          let pose: Pose;
          let expression: Expression = "happy";
          let balloon: React.ReactNode = null;
          if (blowing(id)) {
            const r = id === "ali" ? radiusAt(frame, c.aliPuffs, aliR) : radiusAt(frame, c.puffs, normalR);
            const bp = blowPose(id, r);
            pose = bp.pose;
            expression = "neutral";
            balloon = <BalloonAtMouth nozzle={bp.nozzle} dir={BLOW_DIR[id]} r={r * SCALE * 0.8} fill={BALLOON_COL[id]} />;
          } else if (id === "ali") {
            // the pop: staggers back, shocked
            const t = clamp01((frame - c.pop) / 6);
            pose = lerpPose({ ...POSES.shocked, hipY: 14, lean: -8 }, withIdle(POSES.shocked, m), clamp01((frame - c.pop - 10) / 12));
            pose = lerpPose(blowPose("ali", aliR(c.popBeat)).pose, pose, t);
            expression = "shocked";
          } else {
            const base = id === "hussein" && gogglesGone ? lerpPose(POSES.shocked, POSES.pointUp, clamp01((frame - c.goggles) / 8)) : withIdle(POSES.relaxed, m);
            pose = lerpPose(base, POSES.tapUp, tapAmount(id));
            if (frame < c.tieOff + 8) pose = lerpPose(blowPose(id, normalR(c.inflateEnd)).pose, pose, tieT);
            if (id === "hussein" && gogglesGone) expression = "tired";
            if (id === "amr" && frame >= c.pop) expression = "happy";
          }
          return (
            <React.Fragment key={id}>
              <Character
                id={id}
                x={X[id]}
                y={GROUND}
                scale={SCALE}
                pose={pose}
                expression={expression}
                headTilt={blowing(id) ? 0 : m.headTilt}
                goggles={id === "hussein" ? (gogglesGone ? "none" : "forehead") : undefined}
                left="none"
                frame={frame}
              />
              {balloon && <Svg>{balloon}</Svg>}
            </React.Fragment>
          );
        })}
        <Svg>
          {/* Amr's balloon released as the volley ball */}
          {volley && <Balloon x={volley.x} y={volley.y} r={58} fill={BALLOON_COL.amr} rotate={Math.sin(frame / 5) * 10} frame={frame} />}
          {/* Hussein's balloon on a string tied to his goggles */}
          {frame >= c.tieOff && (
            <Balloon
              x={floatPos.x}
              y={floatPos.y + (1 - tieT) * 200}
              r={56}
              fill={BALLOON_COL.hussein}
              stringTo={gogglesGone ? { x: goggleHang.x, y: goggleHang.y - 10 } : { x: hHead.x + HEAD_R * SCALE * 0.62, y: hHead.y - HEAD_R * SCALE * 0.42 }}
              frame={frame}
            />
          )}
          {gogglesGone && (
            <g transform={`translate(${goggleHang.x} ${goggleHang.y + 10}) rotate(${Math.sin(frame / 6) * 12}) scale(${SCALE})`}>
              <Goggles r={HEAD_R} sw={STROKE / SCALE} eyes={[CHARS.faceGeometry.leftEye, CHARS.faceGeometry.rightEye]} mode="eyes" />
            </g>
          )}
          <Shreds frame={frame} at={c.pop} x={aliHead.x - 90} y={aliHead.y - 60} />
          <ImpactLines frame={frame} at={c.pop} x={aliHead.x - 70} y={aliHead.y - 40} r={150} />
          <Burst frame={frame} at={c.pop} x={aliHead.x + 170} y={aliHead.y - 200} text="POP!" r={115} hold={16} />
          <Exclaim frame={frame} at={c.goggles} x={hHead.x - 130} y={hHead.y - 110} hold={24} />
          {gogglesGone && frame - c.goggles < 18 && (
            <g opacity={1 - (frame - c.goggles) / 18}>
              {[-30, 0, 30].map((dx) => (
                <line key={dx} x1={goggleHang.x + dx} x2={goggleHang.x + dx} y1={goggleHang.y + 110} y2={goggleHang.y + 160} stroke={INK} strokeWidth={5} strokeLinecap="round" />
              ))}
            </g>
          )}
        </Svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: PAPER, opacity: 1 - lin(frame, [0, 8], [0, 1], easeOut), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

