// Scene 2 — CEO enters: door bursts open on the break, "We need creative ideas!",
// one friendly bat swing and the three blast off with dizzy stars.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos } from "../characters/Character";
import { charCfg } from "../characters/config";
import { POSES, lerpPose, walkPose } from "../characters/rig";
import { clamp01, easeIn, easeInOut, easeOut, lin, popIn, shake, squash } from "../fx/anim";
import { Burst, Doodles, Exclaim, Floor, ImpactLines, NameTag, OrbitStars, SpeechBubble, SpeedLines, Svg } from "../fx/Fx";
import { BEAT_FRAMES, idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { ACCENT, INK, PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";

const GROUND = 960;
const SCALE = 1.2;
const THREE = [
  { id: "amr" as const, x: 330 },
  { id: "ali" as const, x: 640 },
  { id: "hussein" as const, x: 950 },
];
// where they land after the swing: a dizzy pile on the left
const PILE = [
  { x: 340, rot: -78 },
  { x: 600, rot: 0 },
  { x: 800, rot: 82 },
];
const DOOR = { x0: 1400, x1: 1700, top: 250 };

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
  const hit = beatOf(slot, Math.max(2 + chunks.length + 3, n - 4));
  const windup = Math.round(hit - 2 * BEAT_FRAMES);
  const land = beatOf(slot, Math.min(n - 1, slot.beats.indexOf(hit) + 2));
  const cues: Cues = {
    marks: [
      { f: door, name: "door bursts (break)" },
      { f: tag, name: "tag: Michael — CEO" },
      ...speech.map((f, i) => ({ f, name: `say "${chunks[i]}"` })),
      { f: windup, name: "wind-up" },
      { f: hit, name: "BAT HIT" },
      { f: land, name: "land in a dizzy pile" },
    ],
    sfx: [
      { f: door, name: "slam", volume: 1 },
      ...speech.map((f) => ({ f, name: "tick" as const, volume: 0.35 })),
      { f: windup, name: "whoosh", volume: 0.5 },
      { f: hit, name: "bonk", volume: 1 },
      { f: land, name: "stamp", volume: 0.7 },
      { f: land, name: "boing", volume: 0.5 },
    ],
  };
  return { door, tag, chunks, speech, windup, hit, land, cues };
};

export const S2Ceo: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => ceoCues(slot), [slot]);
  const cam = shake(frame, [c.door, c.hit], 20);

  // door swings open toward camera (hinge on the right)
  const open = popIn(frame, c.door, 380, 9);
  const doorScale = 1 - open * 1.25;

  // Michael: steps out of the doorway, then walks toward the team while talking
  const walkIn = lin(frame, [0, beatOf(slot, 2)], [0, 1], easeOut);
  const approach = lin(frame, [c.speech[0], c.windup], [0, 1], easeInOut);
  const mx = 1560 - walkIn * 90 - approach * 200;
  const walking = frame < beatOf(slot, 2) || (frame > c.speech[0] && frame < c.windup);
  const phase = frame / (BEAT_FRAMES * 2);
  let mPose = walking ? walkPose(POSES.batReady, phase, 0.6) : POSES.batReady;
  if (frame >= c.windup) mPose = lerpPose(POSES.batReady, POSES.batWindup, lin(frame, [c.windup, c.hit - 4], [0, 1], easeOut));
  if (frame >= c.hit - 3) mPose = lerpPose(POSES.batWindup, POSES.batSwing, lin(frame, [c.hit - 3, c.hit], [0, 1], easeIn));
  if (frame >= c.hit + 8) mPose = lerpPose(POSES.batSwing, POSES.batReady, lin(frame, [c.hit + 8, c.hit + 20], [0, 1], easeInOut));
  const mIdle = idleMotion(frame, 0.2, 0.8);

  // the three: startled by the door, listen, then fly off on the hit and land in a pile
  const flyT = (i: number) => clamp01((frame - c.hit - i) / Math.max(6, c.land - c.hit - i));
  const hitHead = headScreenPos("hussein", THREE[2].x, GROUND, SCALE, POSES.stand);

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Svg>
        <Doodles frame={frame} seed={5} />
      </Svg>
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px)` }}>
        <Svg>
          <Floor y={GROUND + 6} />
          {/* door frame + dark doorway */}
          <rect x={DOOR.x0} y={DOOR.top} width={DOOR.x1 - DOOR.x0} height={GROUND - DOOR.top} fill="#E9F2FA" stroke={INK} strokeWidth={STROKE} />
          {frame < 6 && <SpeedLines frame={frame} n={10} dir={1} y0={DOOR.top} y1={GROUND} />}
        </Svg>
        {/* Michael (drawn before the door so he steps out from behind it) */}
        <Character
          id="michael"
          x={mx}
          y={GROUND - mIdle.y}
          scale={SCALE}
          pose={mPose}
          expression={frame >= c.windup ? "happy" : "neutral"}
          flip
          squashX={mIdle.scaleX}
          squashY={mIdle.scaleY}
          headTilt={mIdle.headTilt}
          frame={frame}
        />
        <Svg>
          {/* door panel, hinged on the right edge of the frame */}
          <g transform={`translate(${DOOR.x1} 0) scale(${doorScale} 1) translate(${-DOOR.x1} 0)`}>
            <rect x={DOOR.x0} y={DOOR.top} width={DOOR.x1 - DOOR.x0} height={GROUND - DOOR.top} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
            <rect x={DOOR.x0 + 40} y={DOOR.top + 50} width={DOOR.x1 - DOOR.x0 - 80} height={180} rx={6} fill="none" stroke={INK} strokeWidth={STROKE * 0.7} />
            <rect x={DOOR.x0 + 40} y={DOOR.top + 280} width={DOOR.x1 - DOOR.x0 - 80} height={240} rx={6} fill="none" stroke={INK} strokeWidth={STROKE * 0.7} />
            <circle cx={DOOR.x0 + 36} cy={DOOR.top + 330} r={12} fill={ACCENT} stroke={INK} strokeWidth={STROKE * 0.7} />
          </g>
          <ImpactLines frame={frame} at={c.door} x={DOOR.x0 - 10} y={600} r={140} n={12} />
          <Burst frame={frame} at={c.door} x={DOOR.x0 - 120} y={360} text="BAM!" r={105} hold={12} rotate={8} />
        </Svg>
        {THREE.map(({ id, x }, i) => {
          const m = idleMotion(frame, i * 0.4, 1);
          const startle = frame < c.speech[0];
          const t = flyT(i);
          const flying = frame >= c.hit;
          const landed = frame >= c.land;
          let pose = startle ? POSES.shocked : POSES.stand;
          if (frame >= c.windup && !flying) pose = POSES.shocked;
          if (flying) pose = landed ? (i === 1 ? POSES.shrug : POSES.stand) : POSES.fly;
          const jump = startle ? Math.sin(clamp01(frame / 10) * Math.PI) * 60 : 0;
          const [sx, sy] = flying ? squash(frame, c.land, 0.25) : squash(frame, c.door, 0.22);
          // flight: big arc up and to the left, spinning, landing in a pile
          const tgt = PILE[i];
          const fx = x + (tgt.x - x) * t;
          const fy = GROUND - Math.sin(t * Math.PI) * (420 + i * 60);
          const rot = landed ? tgt.rot : -t * 720 + tgt.rot * t;
          const sc = SCALE * 0.85;
          const pos = flying ? { x: fx, y: fy } : { x, y: GROUND - m.y - jump };
          const head = headScreenPos(id, pos.x, pos.y, flying ? sc : SCALE, pose, false, flying ? rot : 0);
          return (
            <React.Fragment key={id}>
              <Character
                id={id}
                x={pos.x}
                y={pos.y}
                scale={flying ? sc : SCALE}
                pose={pose}
                expression={flying ? (i === 1 ? "shocked" : "tired") : startle || frame >= c.windup ? "shocked" : "neutral"}
                rotate={flying ? rot : 0}
                squashX={sx * m.scaleX}
                squashY={sy * m.scaleY}
                headTilt={m.headTilt}
                goggles={id === "hussein" ? "none" : undefined}
                left="none"
                frame={frame}
              />
              <Svg>
                {flying && <OrbitStars frame={frame} x={head.x} y={head.y - head.r * 1.05} rx={head.r * 0.95} n={landed ? 4 : 3} />}
                <Exclaim frame={frame} at={c.door + i * 2} x={x + 60} y={GROUND - 600} hold={18} />
              </Svg>
            </React.Fragment>
          );
        })}
        <Svg>
          <ImpactLines frame={frame} at={c.hit} x={hitHead.x + 60} y={hitHead.y + 40} r={130} n={12} />
          <Burst frame={frame} at={c.hit} x={hitHead.x + 40} y={hitHead.y - 190} text="BONK!" r={130} hold={18} rotate={-10} />
          {frame >= c.hit && frame < c.hit + 14 && <SpeedLines frame={frame} n={16} dir={-1} y0={200} y1={900} opacity={1 - (frame - c.hit) / 14} />}
          <ImpactLines frame={frame} at={c.land} x={520} y={GROUND - 20} r={160} n={10} />
        </Svg>
        <SpeechBubble
          frame={frame}
          x={mx - 420}
          y={250}
          chunks={c.chunks}
          chunkFrames={c.speech}
          hideAt={c.windup}
          tail="right"
          width={720}
        />
        <NameTag frame={frame} at={c.tag} x={mx} y={GROUND + 22} text={charCfg("michael").tag ?? "Michael"} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
