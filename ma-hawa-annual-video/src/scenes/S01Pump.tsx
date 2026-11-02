// Scene 1 — Pump party: Ali, Amr (centre) and Hussein inflate balloons with floor pumps.
// The handle goes DOWN exactly on every beat and up on the off-beat; each stroke grows the balloon.
// Then they lift the balloons and groove with them.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, jointScreenPos } from "../characters/Character";
import { outfitOf } from "../characters/config";
import { POSES, Pose, lerpPose, withIdle } from "../characters/rig";
import { clamp01, easeInOut, easeOut } from "../fx/anim";
import { SpeedLines } from "../fx/Fx";
import { BEAT_FRAMES, beatClock, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { ACCENT, INK, STROKE } from "../theme";
import { CAST_S, CAST_X, GROUND } from "./S00Title";
import { FloorPump, HeldBalloon, Stage, W, breathe, camAt, pumpGrips, pumpStroke } from "./kit";
import { Cues, SceneProps } from "./types";

type Who = "ali" | "amr" | "hussein";
export const CAST: Who[] = ["ali", "amr", "hussein"];
export const BALLOON: Record<Who, string> = { ali: ACCENT, amr: "#9EC8EC", hussein: "#5D8FC2" };
const SIDE: Record<Who, 1 | -1> = { ali: -1, amr: 1, hussein: 1 };
export const balloonR = (strokes: number) => 10 + 54 * (1 - Math.exp(-strokes / 3.6));

/** a dance step on the beat, holding a balloon up */
export const dancePose = (frame: number, offset: number): Pose => {
  const clock = beatClock(frame);
  const side = Math.floor(clock) % 2 === 0 ? 1 : -1;
  const m = idleMotion(frame, offset, 1);
  return withIdle({ ...POSES.relaxed, lean: side * 4, hipX: side * 10, rArm: [150 + side * 10, 20], lArm: [-30, -60] }, m);
};

export const pumpCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const strokesN = Math.max(4, Math.min(12, n - 4));
  const strokes = Array.from({ length: strokesN }, (_, k) => beatOf(slot, k));
  const lift = beatOf(slot, strokesN);
  const cues: Cues = {
    marks: [...strokes.map((f, k) => ({ f, name: `pump stroke ${k + 1} (handle down)` })), { f: lift, name: "balloons up — dance" }],
    sfx: [...strokes.map((f) => ({ f, name: "puff" as const, volume: 0.45 })), { f: lift, name: "sparkle" as const, volume: 0.6 }],
  };
  return { strokes, lift, cues };
};

export const S01Pump: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => pumpCues(slot), [slot]);
  const pumping = frame < c.lift;
  const strokesDone = c.strokes.filter((f) => frame >= f).length;
  // radius grows during each downstroke (the half-beat before the beat)
  const nextStroke = c.strokes.find((f) => f > frame);
  const growT = nextStroke !== undefined ? clamp01(1 - (nextStroke - frame) / (BEAT_FRAMES * 0.5)) : 0;
  const r = balloonR(strokesDone + (pumping ? easeOut(growT) : 0));
  const h = pumping ? pumpStroke(frame) : 1;
  const liftT = easeInOut(clamp01((frame - c.lift) / 8));

  const cam = breathe(
    camAt(frame, [
      [0, { x: 960, y: 560, zoom: 1.0 }],
      [c.lift, { x: 960, y: 580, zoom: 1.08 }],
      [c.lift + 6, { x: 960, y: 560, zoom: 1.12 }],
      [slot.durationInFrames, { x: 960, y: 550, zoom: 1.06 }],
    ]),
    frame,
  );

  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        {/* balloons behind the people once lifted */}
        {CAST.map((id, i) => {
          const pose = dancePose(frame, i * 0.3);
          const hand = jointScreenPos(id, CAST_X[id], GROUND, CAST_S, pose, "handR");
          return !pumping ? (
            <W key={`b${id}`}>
              <HeldBalloon x={hand.x + 10} y={hand.y - 250 * liftT - 60} r={balloonR(c.strokes.length) * CAST_S} fill={BALLOON[id]} hand={hand} frame={frame} seed={i} />
            </W>
          ) : null;
        })}
        {CAST.map((id, i) => {
          let pose: Pose;
          if (pumping) {
            const g = pumpGrips(h);
            pose = { ...POSES.stand, lean: 5 * (1 - h), hipY: 6 + 16 * (1 - h), lHand: g.l, rHand: g.r, head: (1 - h) * 6 };
          } else {
            pose = lerpPose({ ...POSES.stand, hipY: 6 }, dancePose(frame, i * 0.3), liftT);
          }
          return (
            <React.Fragment key={id}>
              <Character id={id} x={CAST_X[id]} y={GROUND} scale={CAST_S} pose={pose} expression={strokesDone > 5 || !pumping ? "happy" : "neutral"} headTilt={pumping ? 0 : idleMotion(frame, i * 0.3).headTilt} left="none" frame={frame} />
              {pumping && (
                <W>
                  <FloorPump x={CAST_X[id]} ground={GROUND} s={CAST_S} h={h} side={SIDE[id]} balloonR={r} balloonFill={BALLOON[id]} frame={frame} />
                  {/* hands on the T-handle, in front of it */}
                  {[pumpGrips(h).l, pumpGrips(h).r].map((g, k) => (
                    <ellipse key={k} cx={CAST_X[id] + g.x * CAST_S} cy={GROUND + (g.y - 4) * CAST_S} rx={13 * CAST_S * 0.9} ry={16 * CAST_S * 0.9} fill={outfitOf(id).skin} stroke={INK} strokeWidth={STROKE * 0.8} />
                  ))}
                </W>
              )}
              {!pumping && frame - c.lift < 10 && (
                <W>
                  <FloorPump x={CAST_X[id]} ground={GROUND + liftT * 400} s={CAST_S} h={1} side={SIDE[id]} balloonR={0} balloonFill={BALLOON[id]} frame={frame} attached={false} />
                </W>
              )}
            </React.Fragment>
          );
        })}
        {frame >= c.lift && frame < c.lift + 10 && (
          <W>
            <SpeedLines frame={frame} n={10} dir={1} y0={200} y1={600} opacity={1 - (frame - c.lift) / 10} />
          </W>
        )}
      </Stage>
    </AbsoluteFill>
  );
};
