// Scene 5 — Michael flips through the stack… tosses it in the air: "I WANT MORE CREATIVE IDEAS!" — and walks off.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, jointScreenPos } from "../characters/Character";
import { POSES, Pose, lerpPose, walkPose, withIdle } from "../characters/rig";
import { clamp01, easeInOut, rand } from "../fx/anim";
import { BEAT_FRAMES, idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { CAST } from "./S01Play";
import { STICKY_COLORS, Shout, Stage, Sticky, W, breathe, camAt } from "./kit";
import { Cues, SceneProps } from "./types";

const X = { ali: 260, amr: 520, hussein: 780 } as const;
const G = 1000;

export const moreCreativeCues = (slot: SceneSlot) => {
  const look = beatOf(slot, 0);
  const toss = beatOf(slot, 1);
  const half = Math.round(BEAT_FRAMES / 2);
  const words = VIDEO.lines.moreCreative.split(" ");
  // five words on the eighth-notes from the toss on
  const at = words.map((_, i) => toss + i * half);
  const leave = beatOf(slot, 3);
  const cues: Cues = {
    marks: [{ f: look, name: "Michael reads the stack" }, { f: toss, name: "toss! — I WANT…" }, ...at.slice(1).map((f, i) => ({ f, name: `…${words[i + 1]}` })), { f: leave, name: "Michael walks off" }],
    sfx: [{ f: toss, name: "whoosh", volume: 0.8 }, ...at.map((f) => ({ f, name: "tick" as const, volume: 0.35 })), { f: leave, name: "slam" as const, volume: 0.4 }],
  };
  cues.voice = [{ f: at[0], id: "michael_more" }];
  return { look, toss, at, words, leave, cues };
};

export const S05MoreCreative: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => moreCreativeCues(slot), [slot]);
  const cam = breathe(
    camAt(frame, [
      [0, { x: 960, y: 540, zoom: 1.0 }],
      [c.toss, { x: 1000, y: 520, zoom: 1.06 }],
      [slot.durationInFrames, { x: 960, y: 540, zoom: 1.0 }],
    ]),
    frame,
  );
  const walkT = clamp01((frame - c.leave) / (slot.durationInFrames - c.leave));
  const mx = 1320 + walkT * 700;
  const mm = idleMotion(frame, 0.2, 0.5);
  let mPose: Pose = withIdle({ ...POSES.stand, lHand: { x: -30, y: -250 }, rHand: { x: 30, y: -250 }, head: 12 }, mm);
  if (frame >= c.toss - 3) mPose = lerpPose(mPose, POSES.cheer, easeInOut(clamp01((frame - c.toss + 3) / 5)));
  if (frame >= c.toss + 10) mPose = withIdle(POSES.hipsHands, mm);
  if (frame >= c.leave) mPose = walkPose(POSES.relaxed, frame / (BEAT_FRAMES * 2), 60, -1);
  const hand = jointScreenPos("michael", 1320, G, 1.6, { ...POSES.stand, lHand: { x: -30, y: -250 }, rHand: { x: 30, y: -250 } }, "handR", true);

  return (
    <AbsoluteFill>
      <Stage cam={cam} variant="board">
        {CAST.map((id, i) => (
          <Character key={id} id={id} x={X[id]} y={G} scale={1.3} pose={withIdle(frame >= c.toss ? POSES.shocked : POSES.relaxed, idleMotion(frame, i * 0.3, 0.6))} expression={frame >= c.toss ? "shocked" : "happy"} left="none" frame={frame} />
        ))}
        <Character id="michael" x={mx} y={G} scale={1.6} pose={mPose} expression="happy" flip={frame < c.leave} right="none" frame={frame} />
        <W>
          {frame < c.toss &&
            [0, 1, 2, 3].map((i) => (
              <Sticky key={i} x={hand.x - 30 + i * 3} y={hand.y - 30 - i * 5} text={i === 3 ? VIDEO.ideas[Math.floor(frame / 6) % VIDEO.ideas.length] : ""} color={STICKY_COLORS[i]} rot={-6 + i * 3} s={0.75} />
            ))}
          {frame >= c.toss &&
            VIDEO.ideas.map((txt, i) => {
              const t = (frame - c.toss) / 30;
              const vx = (rand(i * 3) - 0.5) * 900;
              const vy = -700 - rand(i * 5) * 500;
              const x = hand.x + vx * t;
              const y = hand.y + vy * t + 1300 * t * t;
              return <Sticky key={i} x={x} y={y} text={txt} color={STICKY_COLORS[i % STICKY_COLORS.length]} rot={(rand(i) - 0.5) * 720 * t} s={0.75} opacity={y > 1200 ? 0 : 1} />;
            })}
        </W>
      </Stage>
      <Shout
        frame={frame}
        x={1000}
        y={200}
        size={118}
        speaker="MICHAEL"
        lines={[
          c.words.slice(0, 3).map((w, i) => ({ text: w, at: c.at[i] })),
          c.words.slice(3).map((w, i) => ({ text: w, at: c.at[i + 3] })),
        ]}
      />
    </AbsoluteFill>
  );
};
