// Scene 3 — the party is back on… a bat swings in from the edge of the screen: BONK!
// The three tumble down dazed; Michael steps in: "I WANT IDEAS!"
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos, jointScreenPos } from "../characters/Character";
import { POSES, Pose, lerpPose, withIdle } from "../characters/rig";
import { clamp01, easeIn, easeInOut, easeOut, lin, shake } from "../fx/anim";
import { Burst, ImpactLines, OrbitStars, Shreds, SpeedLines } from "../fx/Fx";
import { BEAT_FRAMES, idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { BALLOON, CAST, balloonR, dancePose } from "./S01Pump";
import { CAST_S, CAST_X, GROUND } from "./S00Title";
import { HeldBalloon, Shout, Stage, W, breathe, camAt } from "./kit";
import { Cues, SceneProps } from "./types";

const LAND = [
  { x: 330, rot: -86, pose: POSES.lying },
  { x: 760, rot: 0, pose: POSES.sitDazed },
  { x: 1180, rot: 86, pose: POSES.lying },
];

export const bonkCues = (slot: SceneSlot) => {
  const hit = beatOf(slot, 1);
  const windup = Math.round(hit - BEAT_FRAMES * 0.6);
  const land = beatOf(slot, 2);
  const words = [beatOf(slot, 2), beatOf(slot, 3)];
  const cues: Cues = {
    marks: [
      { f: 0, name: "party (dance)" },
      { f: windup, name: "bat swings in from the edge" },
      { f: hit, name: "BONK" },
      { f: land, name: "they land dazed — I WANT" },
      { f: words[1], name: "IDEAS!" },
    ],
    sfx: [
      { f: windup, name: "whoosh", volume: 0.7 },
      { f: hit, name: "bonk", volume: 1 },
      { f: hit, name: "pop", volume: 0.8 },
      { f: land, name: "stamp", volume: 0.7 },
      { f: words[1], name: "slam", volume: 0.5 },
    ],
  };
  cues.voice = [{ f: words[0], id: "michael_ideas" }];
  return { hit, windup, land, words, cues };
};

export const S03Bonk: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => bonkCues(slot), [slot]);
  const sh = shake(frame, [c.hit, c.land], 20);
  const cam = breathe(
    camAt(frame, [
      [0, { x: 960, y: 560, zoom: 1.06 }],
      [c.hit, { x: 1100, y: 540, zoom: 1.12 }],
      [c.hit + 4, { x: 900, y: 600, zoom: 1.0 }],
      [slot.durationInFrames, { x: 940, y: 580, zoom: 1.04 }],
    ]),
    frame,
  );
  cam.x += sh.x;
  cam.y += sh.y;
  // Michael: only the swing reaches into frame, then he steps in
  const stepIn = easeOut(clamp01((frame - c.land) / 10));
  const mx = 1930 - stepIn * 230;
  let mPose: Pose = POSES.batWindup;
  if (frame >= c.windup) mPose = lerpPose(POSES.batWindup, POSES.batSwing, lin(frame, [c.windup, c.hit], [0, 1], easeIn));
  if (frame >= c.hit + 6) mPose = lerpPose(POSES.batSwing, withIdle(POSES.batReady, idleMotion(frame, 0.2, 0.5)), lin(frame, [c.hit + 6, c.land + 6], [0, 1], easeInOut));
  const hitHead = headScreenPos("hussein", CAST_X.hussein, GROUND, CAST_S, POSES.stand);

  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        {CAST.map((id, i) => {
          const order = 2 - i; // Hussein (right) gets hit first
          const t = clamp01((frame - c.hit - order * 2) / Math.max(6, c.land - c.hit - order * 2));
          const flying = frame >= c.hit + order * 2;
          const landed = frame >= c.land;
          const tgt = LAND[i];
          let pose: Pose = dancePose(frame, i * 0.3);
          let x = CAST_X[id];
          let y = GROUND;
          let rot = 0;
          if (flying) {
            const g = 1 - (2 * t - 1) * (2 * t - 1);
            x = CAST_X[id] + (tgt.x - CAST_X[id]) * t;
            y = GROUND - g * (300 + order * 40);
            rot = landed ? tgt.rot : tgt.rot * t - Math.sin(t * Math.PI) * 300;
            pose = landed ? tgt.pose : POSES.fly;
            if (landed && tgt.rot !== 0) y = GROUND - 22 - jointScreenPos(id, 0, 0, CAST_S * 0.95, tgt.pose, "hip").y;
          }
          const s = flying ? CAST_S * 0.95 : CAST_S;
          const head = headScreenPos(id, x, y, s, pose, false, rot);
          const hand = jointScreenPos(id, x, y, s, pose, "handR");
          return (
            <React.Fragment key={id}>
              {!flying && (
                <W>
                  <HeldBalloon x={hand.x + 10} y={hand.y - 310} r={balloonR(12) * CAST_S} fill={BALLOON[id]} hand={hand} frame={frame} seed={i} />
                </W>
              )}
              {flying && frame - c.hit < 24 && (
                <W>
                  <Shreds frame={frame} at={c.hit + order * 2} x={CAST_X[id] + 20} y={GROUND - 640} />
                </W>
              )}
              <Character id={id} x={x} y={y} scale={s} pose={pose} rotate={rot} expression={flying ? (id === "ali" ? "shocked" : "tired") : "happy"} left="none" shadow={!flying || landed} frame={frame} />
              {flying && (
                <W>
                  <OrbitStars frame={frame} x={head.x} y={head.y - head.r * 1.05} rx={head.r * 0.95} n={landed ? 4 : 3} />
                </W>
              )}
            </React.Fragment>
          );
        })}
        <Character id="michael" x={mx} y={GROUND} scale={1.5} pose={mPose} expression="happy" flip shadow={stepIn > 0.5} frame={frame} />
        <W>
          {frame >= c.windup && frame < c.hit + 3 && <SpeedLines frame={frame} n={14} dir={-1} y0={300} y1={800} />}
          <ImpactLines frame={frame} at={c.hit} x={hitHead.x + 30} y={hitHead.y} r={130} n={12} />
          <Burst frame={frame} at={c.hit} x={hitHead.x - 40} y={hitHead.y - 210} text="BONK!" r={130} hold={14} rotate={-10} />
          <ImpactLines frame={frame} at={c.land} x={760} y={GROUND - 20} r={190} n={10} />
        </W>
      </Stage>
      <Shout
        frame={frame}
        x={900}
        y={230}
        size={150}
        speaker="MICHAEL"
        lines={[[{ text: VIDEO.lines.bonk.split(" ").slice(0, 2).join(" "), at: c.words[0] }, { text: VIDEO.lines.bonk.split(" ").slice(2).join(" "), at: c.words[1] }]]}
      />
    </AbsoluteFill>
  );
};
