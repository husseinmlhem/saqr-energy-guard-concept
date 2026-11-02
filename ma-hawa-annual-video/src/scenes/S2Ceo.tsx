// Scene 2 — CEO enters: the door bursts open, Michael walks in: "We need creative ideas!",
// one friendly bat swing and the three tumble off and land dazed with stars over their heads.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos, jointScreenPos } from "../characters/Character";
import { charCfg } from "../characters/config";
import { POSES, Pose, lerpPose, walkPose, withIdle } from "../characters/rig";
import { clamp01, easeIn, easeInOut, easeOut, lin, popIn, shake } from "../fx/anim";
import { Burst, Doodles, Exclaim, ImpactLines, NameTag, OrbitStars, SpeechBubble, SpeedLines, Svg } from "../fx/Fx";
import { BEAT_FRAMES, idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { ACCENT, INK, PAPER, STROKE } from "../theme";
import { Ground } from "./common";
import { Cues, SceneProps } from "./types";

const GROUND = 1040;
const SCALE = 1.45;
const THREE = [
  { id: "ali" as const, x: 290 },
  { id: "amr" as const, x: 580 }, // Amr in the middle
  { id: "hussein" as const, x: 870 },
];
// where each lands after the swing
const LAND: { x: number; rot: number; pose: Pose }[] = [
  { x: 210, rot: -84, pose: POSES.lying },
  { x: 560, rot: 0, pose: POSES.sitDazed },
  { x: 880, rot: 84, pose: POSES.lying },
];
const DOOR = { x0: 1430, x1: 1740, top: 220 };

const chunk = (line: string, n = 3) => {
  const words = line.split(" ");
  const out: string[] = [];
  const per = Math.ceil(words.length / n);
  for (let i = 0; i < words.length; i += per) out.push(words.slice(i, i + per).join(" "));
  return out;
};

export const ceoCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const door = 0;
  const tag = beatOf(slot, 1);
  const chunks = chunk(VIDEO.lines.ceo);
  const speech = chunks.map((_, i) => beatOf(slot, 2 + i));
  const hitIdx = Math.max(2 + chunks.length + 2, n - 4);
  const hit = beatOf(slot, hitIdx);
  const windup = beatOf(slot, hitIdx - 1);
  const land = beatOf(slot, Math.min(n - 1, hitIdx + 2));
  const cues: Cues = {
    marks: [
      { f: door, name: "door bursts" },
      { f: tag, name: "tag: Michael — CEO" },
      ...speech.map((f, i) => ({ f, name: `say "${chunks[i]}"` })),
      { f: windup, name: "wind-up" },
      { f: hit, name: "BAT HIT" },
      { f: land, name: "they land, dazed" },
    ],
    sfx: [
      { f: door, name: "slam", volume: 1 },
      ...speech.map((f) => ({ f, name: "tick" as const, volume: 0.35 })),
      { f: windup, name: "whoosh", volume: 0.5 },
      { f: hit, name: "bonk", volume: 1 },
      { f: land, name: "stamp", volume: 0.7 },
      { f: land, name: "boing", volume: 0.45 },
    ],
  };
  return { door, tag, chunks, speech, windup, hit, land, cues };
};

export const S2Ceo: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => ceoCues(slot), [slot]);
  const cam = shake(frame, [c.door, c.hit], 18);

  // door swings open toward camera (hinge on the right)
  const open = popIn(frame, c.door, 380, 13);
  const doorScale = 1 - open * 1.2;

  // Michael: steps out of the doorway, walks toward the team while talking (one step per beat)
  const walkEnd1 = beatOf(slot, 2);
  const walkIn = lin(frame, [0, walkEnd1], [0, 1], easeOut);
  const approach = lin(frame, [c.speech[0], c.windup], [0, 1], easeInOut);
  const mx = 1590 - walkIn * 110 - approach * 250;
  const walking = frame < walkEnd1 || (frame > c.speech[0] && frame < c.windup - 4);
  const mIdle = idleMotion(frame, 0.2, 0.6);
  let mPose: Pose = walking ? walkPose(POSES.batReady, frame / (BEAT_FRAMES * 2), 40, 1) : withIdle(POSES.batReady, mIdle);
  if (frame >= c.windup - 4) mPose = lerpPose(POSES.batReady, POSES.batWindup, lin(frame, [c.windup - 4, c.hit - 5], [0, 1], easeInOut));
  if (frame >= c.hit - 5) mPose = lerpPose(POSES.batWindup, POSES.batSwing, lin(frame, [c.hit - 5, c.hit], [0, 1], easeIn));
  if (frame >= c.hit + 10) mPose = lerpPose(POSES.batSwing, withIdle(POSES.batReady, mIdle), lin(frame, [c.hit + 10, c.hit + 26], [0, 1], easeInOut));

  const hitHead = headScreenPos("hussein", THREE[2].x, GROUND, SCALE, POSES.stand);

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Svg>
        <Doodles frame={frame} seed={5} />
      </Svg>
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px)` }}>
        <Ground y={GROUND} />
        <Svg>
          {/* door frame + room behind */}
          <rect x={DOOR.x0} y={DOOR.top} width={DOOR.x1 - DOOR.x0} height={GROUND - 4 - DOOR.top} fill="#DCE9F6" stroke={INK} strokeWidth={STROKE} />
          {frame < 6 && <SpeedLines frame={frame} n={10} dir={1} y0={DOOR.top} y1={GROUND} />}
        </Svg>
        <Character
          id="michael"
          x={mx}
          y={GROUND}
          scale={SCALE}
          pose={mPose}
          expression="happy"
          flip
          headTilt={mIdle.headTilt}
          frame={frame}
        />
        <Svg>
          {/* door panel, hinged on the right edge of the frame */}
          <g transform={`translate(${DOOR.x1} 0) scale(${doorScale} 1) translate(${-DOOR.x1} 0)`}>
            <rect x={DOOR.x0} y={DOOR.top} width={DOOR.x1 - DOOR.x0} height={GROUND - 4 - DOOR.top} fill="#F7F3EC" stroke={INK} strokeWidth={STROKE} />
            <rect x={DOOR.x0 + 40} y={DOOR.top + 50} width={DOOR.x1 - DOOR.x0 - 80} height={200} rx={6} fill="none" stroke={INK} strokeWidth={STROKE * 0.6} />
            <rect x={DOOR.x0 + 40} y={DOOR.top + 300} width={DOOR.x1 - DOOR.x0 - 80} height={300} rx={6} fill="none" stroke={INK} strokeWidth={STROKE * 0.6} />
            <circle cx={DOOR.x0 + 36} cy={DOOR.top + 380} r={13} fill={ACCENT} stroke={INK} strokeWidth={STROKE * 0.7} />
          </g>
          <ImpactLines frame={frame} at={c.door} x={DOOR.x0 - 10} y={620} r={150} n={12} />
          <Burst frame={frame} at={c.door} x={DOOR.x0 - 130} y={330} text="BAM!" r={105} hold={12} rotate={8} />
        </Svg>
        {THREE.map(({ id, x }, i) => {
          const m = idleMotion(frame, i * 0.4, 0.8);
          const startle = frame < c.speech[0];
          const flying = frame >= c.hit;
          const t = clamp01((frame - c.hit - i * 2) / Math.max(6, c.land - c.hit - i * 2));
          const landed = frame >= c.land;
          let pose: Pose = withIdle(POSES.relaxed, m);
          if (startle || (frame >= c.windup - 4 && !flying)) pose = withIdle(POSES.shocked, m);
          // startle hop: a real jump — crouch, push off, land with bent knees
          const hopT = clamp01((frame - c.door - 2 - i * 2) / 14);
          const hop = startle ? Math.sin(Math.PI * hopT) * 70 : 0;
          if (startle && (hopT < 0.12 || hopT > 0.88)) pose = { ...pose, hipY: pose.hipY + 14 };
          let px = x;
          let py = GROUND - hop;
          let rot = 0;
          let sc = SCALE;
          if (flying) {
            const tgt = LAND[i];
            // ballistic arc (gravity) with a tumble, then lands
            const g = 1 - (2 * t - 1) * (2 * t - 1);
            px = x + (tgt.x - x) * t;
            py = GROUND - g * (380 + i * 50);
            rot = landed ? tgt.rot : tgt.rot * t + Math.sin(t * Math.PI) * -360 * (i === 1 ? 1 : -1) * t;
            pose = landed ? tgt.pose : POSES.fly;
            sc = SCALE * 0.92;
            if (landed && tgt.rot !== 0) {
              // lying: put the hips on the floor
              const hip = jointScreenPos(id, 0, 0, sc, tgt.pose, "hip");
              py = GROUND - 22 - hip.y;
            }
          }
          const head = headScreenPos(id, px, py, sc, pose, false, rot);
          return (
            <React.Fragment key={id}>
              <Character
                id={id}
                x={px}
                y={py}
                scale={sc}
                pose={pose}
                expression={flying ? (id === "ali" ? "shocked" : "tired") : startle || frame >= c.windup - 4 ? "shocked" : "neutral"}
                rotate={rot}
                headTilt={flying ? 0 : m.headTilt}
                goggles={id === "hussein" ? "none" : undefined}
                left="none"
                shadow={!flying || landed}
                frame={frame}
              />
              <Svg>
                {landed && <OrbitStars frame={frame} x={head.x} y={head.y - head.r * 1.05} rx={head.r * 0.95} n={4} />}
                {flying && !landed && <OrbitStars frame={frame} x={head.x} y={head.y - head.r * 1.05} rx={head.r * 0.8} n={3} />}
                <Exclaim frame={frame} at={c.door + i * 2} x={x + 60} y={GROUND - 760} hold={18} />
              </Svg>
            </React.Fragment>
          );
        })}
        <Svg>
          <ImpactLines frame={frame} at={c.hit} x={hitHead.x + 60} y={hitHead.y + 40} r={130} n={12} />
          <Burst frame={frame} at={c.hit} x={hitHead.x + 60} y={hitHead.y - 200} text="BONK!" r={125} hold={18} rotate={-10} />
          {frame >= c.hit && frame < c.hit + 14 && <SpeedLines frame={frame} n={16} dir={-1} y0={300} y1={980} opacity={1 - (frame - c.hit) / 14} />}
          <ImpactLines frame={frame} at={c.land} x={540} y={GROUND - 30} r={170} n={10} />
        </Svg>
        <SpeechBubble frame={frame} x={mx - 470} y={200} chunks={c.chunks} chunkFrames={c.speech} hideAt={c.windup} tail="right" />
        <NameTag frame={frame} at={c.tag} x={mx} y={GROUND - 52} text={charCfg("michael").tag ?? "Michael"} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
