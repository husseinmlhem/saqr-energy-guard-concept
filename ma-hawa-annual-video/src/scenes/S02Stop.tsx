// Scene 2 — "STOP PLAYING!" on the song's hard break.
// Michael leans in from the edge of the screen; the three freeze, whip the dumbbells / balloons / shisha hose
// behind their backs and smile innocently (the shisha keeps smoking). He leaves when the groove comes back — and they carry on.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos } from "../characters/Character";
import { charCfg } from "../characters/config";
import { POSES, Pose, lerpPose, withIdle } from "../characters/rig";
import { clamp01, easeInOut, easeOut, lin, shake } from "../fx/anim";
import { Exclaim, NameTag, SpeedLines } from "../fx/Fx";
import { idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { ACCENT, FONT, INK, STROKE } from "../theme";
import { BALLOON, CAST } from "./S01Play";
import { HiddenProps, OFFICE_SHISHA, Shisha, Smoke, Umbrella, officeActivity } from "./playtime";
import { CAST_S, CAST_X, GROUND } from "./S00Title";
import { Notes, Shout, Stage, W, breathe, camAt } from "./kit";
import { Cues, SceneProps } from "./types";

export const stopCues = (slot: SceneSlot) => {
  const enter = beatOf(slot, 0);
  // both words land together (a few frames apart) so the shout never sits half-finished over the logo wall
  const words = [beatOf(slot, 0), beatOf(slot, 0) + 5];
  const hide = beatOf(slot, 1);
  const innocent = beatOf(slot, 2);
  const squint = beatOf(slot, 3);
  const leave = beatOf(slot, 4);
  const peek = beatOf(slot, 5);
  const resume = beatOf(slot, 6);
  const cues: Cues = {
    marks: [
      { f: enter, name: "Michael leans in: STOP" },
      { f: words[1], name: "PLAYING!" },
      { f: hide, name: "props behind backs" },
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
  cues.voice = [{ f: words[0], id: "michael_stop" }];
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

  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        <W>
          {/* "beach mode" and the shisha, right there in the office */}
          <Umbrella x={1150} ground={GROUND - 4} s={0.8} tilt={-10} base="#FFD36B" />
          <Shisha x={OFFICE_SHISHA.x} ground={GROUND} s={OFFICE_SHISHA.s} glow={0.5} frame={frame} />
          <Smoke frame={frame} x={OFFICE_SHISHA.x} y={GROUND - 400 * OFFICE_SHISHA.s} amount={0.6} spread={0.55} seed={3} />
        </W>
        {CAST.map((id, i) => {
          const m = idleMotion(frame, i * 0.3, 0.6);
          // before the freeze: busy (curls / balloon / shisha); frozen on "STOP"; hidden; then back at it
          const busyAt = frame < c.hide ? Math.min(frame, c.enter) : frame;
          const busy = officeActivity(id, busyAt, CAST_X[id], GROUND, CAST_S, BALLOON);
          let pose: Pose;
          if (frame < c.hide) pose = busy.pose;
          else if (hiding) pose = lerpPose(busy.pose, withIdle({ ...POSES.hideBehind, lean: peekT * 8, hipX: peekT * 14 }, m), hideT);
          else pose = lerpPose(withIdle(POSES.hideBehind, m), busy.pose, resumeT);
          const head = headScreenPos(id, CAST_X[id], GROUND, CAST_S, pose);
          const showBusy = !hiding || hideT < 0.5;
          return (
            <React.Fragment key={id}>
              {hiding && hideT >= 0.5 && (
                <W>
                  <HiddenProps id={id} x={CAST_X[id]} g={GROUND} s={CAST_S} pose={pose} fill={BALLOON[id]} frame={frame} side={i === 0 ? -1 : 1} />
                </W>
              )}
              <Character
                id={id}
                x={CAST_X[id]}
                y={GROUND}
                scale={CAST_S}
                pose={pose}
                expression={frame < c.innocent ? "shocked" : "happy"}
                headTilt={frame < c.hide ? 0 : m.headTilt + peekT * 8}
                left="none"
                right="none"
                frame={frame}
              />
              <W>
                {showBusy && (frame >= c.resume || frame < c.hide) && busy.front}
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
      <Shout frame={frame} x={760} y={292} size={150} rotate={-1.5} speaker="MICHAEL" lines={[[{ text: VIDEO.lines.stop.split(" ")[0], at: c.words[0] }, { text: VIDEO.lines.stop.split(" ").slice(1).join(" "), at: c.words[1] }]]} hideAt={c.squint} />
      <NameTag frame={frame} at={c.enter + 2} x={1560} y={140} text={charCfg("michael").tag ?? "Michael"} />
      <AbsoluteFill style={{ background: "rgba(10,20,40,0.12)", opacity: frame < c.leave ? lin(frame, [0, 4], [0, 1]) : 1 - lin(frame, [c.leave, c.leave + 6], [0, 1]), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
