// Scene 3 — back at it (curls, balloon, shisha)… a bat swings in from the edge of the screen: BONK!
// Balloons pop, dumbbells clatter, the beach umbrella keels over.
// The three tumble down dazed; Michael steps in: "I WANT IDEAS!"
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos, jointScreenPos } from "../characters/Character";
import { POSES, Pose, lerpPose, withIdle } from "../characters/rig";
import { clamp01, easeIn, easeInOut, easeOut, lin, shake } from "../fx/anim";
import { Burst, ImpactLines, OrbitStars, Shreds, SpeedLines } from "../fx/Fx";
import { BEAT_FRAMES, idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { BALLOON, CAST } from "./S01Play";
import { Dumbbell, OFFICE_SHISHA, Shisha, Smoke, Umbrella, officeActivity } from "./playtime";
import { CAST_S, CAST_X, GROUND } from "./S00Title";
import { Shout, Stage, W, breathe, camAt } from "./kit";
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
  const words = [beatOf(slot, 2), beatOf(slot, 2) + 6];
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
      { f: beatOf(slot, 3), name: "slam", volume: 0.5 },
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
        <W>
          <Umbrella x={1150} ground={GROUND - 4} s={0.8} base="#FFD36B" tilt={-8 + (frame >= c.hit ? Math.min(1, (frame - c.hit) / 10) * -70 : 0)} />
          <Shisha x={OFFICE_SHISHA.x} ground={GROUND} s={OFFICE_SHISHA.s} glow={0.4} frame={frame} />
          <Smoke frame={frame} x={OFFICE_SHISHA.x} y={GROUND - 400 * OFFICE_SHISHA.s} amount={0.5} spread={0.55} seed={3} />
        </W>
        {CAST.map((id, i) => {
          const order = 2 - i; // Hussein (right) gets hit first
          const t = clamp01((frame - c.hit - order * 2) / Math.max(6, c.land - c.hit - order * 2));
          const flying = frame >= c.hit + order * 2;
          const landed = frame >= c.land;
          const tgt = LAND[i];
          const busy = officeActivity(id, Math.min(frame, c.hit), CAST_X[id], GROUND, CAST_S, BALLOON);
          let pose: Pose = busy.pose;
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
          return (
            <React.Fragment key={id}>
              {flying && frame - c.hit < 24 && id !== "ali" && (
                <W>
                  <Shreds frame={frame} at={c.hit + order * 2} x={CAST_X[id] + 120} y={GROUND - 470} />
                </W>
              )}
              <Character id={id} x={x} y={y} scale={s} pose={pose} rotate={rot} expression={flying ? (id === "ali" ? "shocked" : "tired") : "happy"} left="none" right="none" shadow={!flying || landed} frame={frame} />
              {!flying && <W>{busy.front}</W>}
              {flying && id === "ali" && (
                <W>
                  {[-1, 1].map((k) => {
                    const ft = clamp01((frame - c.hit) / 12);
                    const dx = CAST_X.ali + k * (90 + ft * 120);
                    const dy = GROUND - 420 + ft * ft * 400 - Math.sin(ft * Math.PI) * 120;
                    return <Dumbbell key={k} x={dx} y={Math.min(GROUND - 14, dy)} s={CAST_S * 0.9} rot={ft * 200 * k} />;
                  })}
                </W>
              )}
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
        y={288}
        size={150}
        rotate={-1.5}
        speaker="MICHAEL"
        lines={[[{ text: VIDEO.lines.bonk.split(" ").slice(0, 2).join(" "), at: c.words[0] }, { text: VIDEO.lines.bonk.split(" ").slice(2).join(" "), at: c.words[1] }]]}
      />
    </AbsoluteFill>
  );
};
