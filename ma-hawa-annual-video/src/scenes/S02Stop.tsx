// Scene 2 — "STOP PLAYING!" on the song's hard break.
// Michael leans in from the edge of the screen; the three freeze, whip the balloons behind their backs,
// smile innocently. He leaves when the groove comes back — and the party resumes.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos, jointScreenPos } from "../characters/Character";
import { charCfg } from "../characters/config";
import { POSES, Pose, lerpPose, withIdle } from "../characters/rig";
import { clamp01, easeInOut, easeOut, lin, shake } from "../fx/anim";
import { Exclaim, NameTag, SpeedLines } from "../fx/Fx";
import { idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { ACCENT, FONT, INK, STROKE } from "../theme";
import { BALLOON, CAST, balloonR, dancePose } from "./S01Pump";
import { CAST_S, CAST_X, GROUND } from "./S00Title";
import { HeldBalloon, Notes, Shout, Stage, W, breathe, camAt } from "./kit";
import { Cues, SceneProps } from "./types";

export const stopCues = (slot: SceneSlot) => {
  const enter = beatOf(slot, 0);
  const words = [beatOf(slot, 0), beatOf(slot, 1)];
  const hide = beatOf(slot, 1);
  const innocent = beatOf(slot, 2);
  const squint = beatOf(slot, 3);
  const leave = beatOf(slot, 4);
  const peek = beatOf(slot, 5);
  const resume = beatOf(slot, 6);
  const cues: Cues = {
    marks: [
      { f: enter, name: "Michael leans in: STOP" },
      { f: words[1], name: "PLAYING! — balloons behind backs" },
      { f: innocent, name: "innocent smiles ♪" },
      { f: squint, name: "Michael suspicious" },
      { f: leave, name: "Michael leaves (groove back)" },
      { f: peek, name: "they peek" },
      { f: resume, name: "party resumes" },
    ],
    sfx: [
      { f: enter, name: "slam", volume: 0.8 },
      { f: hide, name: "whoosh", volume: 0.7 },
      { f: innocent, name: "tick", volume: 0.4 },
      { f: leave, name: "whoosh", volume: 0.5 },
      { f: resume, name: "sparkle", volume: 0.6 },
    ],
  };
  return { enter, words, hide, innocent, squint, leave, peek, resume, cues };
};

export const S02Stop: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => stopCues(slot), [slot]);
  const hiding = frame >= c.hide && frame < c.resume;
  const hideT = easeOut(clamp01((frame - c.hide) / 5));
  const resumeT = easeInOut(clamp01((frame - c.resume) / 6));
  const peekT = easeInOut(clamp01((frame - c.peek) / 8)) * (1 - resumeT);
  // Michael leans in from the right edge, leaves on the groove
  const inT = easeOut(clamp01((frame - c.enter + 2) / 6));
  const outT = easeInOut(clamp01((frame - c.leave) / 8));
  const mx = 2160 - inT * 360 + outT * 420;
  const mPose: Pose = frame < c.squint ? POSES.point : { ...POSES.armsCrossed, head: -6 };
  const sh = shake(frame, [c.enter], 14);
  const cam = breathe(
    camAt(frame, [
      [0, { x: 1010, y: 560, zoom: 1.06 }],
      [6, { x: 1110, y: 520, zoom: 1.16 }],
      [c.leave, { x: 1090, y: 530, zoom: 1.14 }],
      [c.leave + 10, { x: 960, y: 560, zoom: 1.05 }],
    ]),
    frame,
  );
  cam.x += sh.x;
  cam.y += sh.y;
  const r = balloonR(12) * CAST_S;

  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        {CAST.map((id, i) => {
          const m = idleMotion(frame, i * 0.3, 0.6);
          let pose: Pose;
          if (frame < c.hide) pose = { ...dancePose(c.enter, i * 0.3) }; // frozen mid-dance
          else if (hiding) pose = lerpPose(dancePose(c.enter, i * 0.3), withIdle({ ...POSES.hideBehind, lean: peekT * 8, hipX: peekT * 14 }, m), hideT);
          else pose = lerpPose(withIdle(POSES.hideBehind, m), dancePose(frame, i * 0.3), resumeT);
          const hand = jointScreenPos(id, CAST_X[id], GROUND, CAST_S, pose, "handR");
          const head = headScreenPos(id, CAST_X[id], GROUND, CAST_S, pose);
          // behind the back: the balloon peeks over the shoulder
          const bx = hiding ? head.x + (i === 0 ? -90 : 90) : hand.x + 10;
          const by = hiding ? head.y + 40 : hand.y - 310;
          return (
            <React.Fragment key={id}>
              <W>
                <HeldBalloon x={bx} y={by} r={r * (hiding ? 0.92 : 1)} fill={BALLOON[id]} hand={hiding ? { x: head.x + 30, y: head.y + 260 } : hand} frame={frame} seed={i} />
              </W>
              <Character
                id={id}
                x={CAST_X[id]}
                y={GROUND}
                scale={CAST_S}
                pose={pose}
                expression={frame < c.innocent ? "shocked" : "happy"}
                headTilt={frame < c.hide ? 0 : m.headTilt + peekT * 8}
                left="none"
                frame={frame}
              />
              <W>
                <Exclaim frame={frame} at={c.enter + i} x={head.x} y={head.y - head.r - 30} hold={12} />
                {hiding && frame < c.leave && <Notes frame={frame} at={c.innocent + i * 3} x={head.x + head.r * 0.6} y={head.y - head.r * 0.2} />}
              </W>
            </React.Fragment>
          );
        })}
        {/* Michael leaning in from the frame edge */}
        <Character id="michael" x={mx} y={GROUND} scale={1.55} rotate={-16 + outT * 6} pose={mPose} expression="happy" flip right="none" shadow={false} frame={frame} />
        {frame >= c.squint && frame < c.leave + 4 && (
          <W>
            <text x={mx - 220} y={300} fontFamily={FONT} fontWeight={900} fontSize={110} fill={ACCENT} stroke={INK} strokeWidth={STROKE} paintOrder="stroke">
              ?
            </text>
          </W>
        )}
        {frame >= c.enter && frame < c.enter + 8 && (
          <W>
            <SpeedLines frame={frame} n={12} dir={-1} y0={160} y1={900} opacity={1 - (frame - c.enter) / 8} />
          </W>
        )}
      </Stage>
      <Shout frame={frame} x={760} y={250} size={150} speaker="MICHAEL" lines={[[{ text: VIDEO.lines.stop.split(" ")[0], at: c.words[0] }, { text: VIDEO.lines.stop.split(" ").slice(1).join(" "), at: c.words[1] }]]} hideAt={c.squint} />
      <NameTag frame={frame} at={c.enter + 2} x={1560} y={140} text={charCfg("michael").tag ?? "Michael"} />
      <AbsoluteFill style={{ background: "rgba(10,20,40,0.12)", opacity: frame < c.leave ? lin(frame, [0, 4], [0, 1]) : 1 - lin(frame, [c.leave, c.leave + 6], [0, 1]), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
