// Studio helper: every character in a few poses. Use it to check a face swap or outfit colours.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character } from "./characters/Character";
import { CharId } from "./characters/config";
import { POSES, Pose, walkPose } from "./characters/rig";
import { idleMotion } from "./sync/beats";
import { FONT, INK, PAPER } from "./theme";
import { useBrandLogo } from "./brand/Logo";

const IDS: CharId[] = ["ali", "amr", "hussein", "michael", "saeed", "abdulwahid"];
const POSE_FOR: Record<CharId, Pose> = {
  amr: POSES.clipboard,
  ali: POSES.flex,
  hussein: POSES.relaxed,
  michael: POSES.batReady,
  saeed: POSES.sip,
  abdulwahid: POSES.carry,
};

export const CharacterSheet: React.FC = () => {
  useBrandLogo();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: FONT }}>
      {IDS.map((id, i) => {
        const m = idleMotion(frame, i * 0.37);
        const x = 200 + i * 380;
        return (
          <React.Fragment key={id}>
            <Character id={id} x={x} y={560} scale={0.95} pose={{ ...POSE_FOR[id], hipY: m.hipY, hipX: m.hipX }} expression="happy" headTilt={m.headTilt} frame={frame} />
            <div style={{ position: "absolute", left: x - 150, width: 300, top: 572, textAlign: "center", fontWeight: 800, fontSize: 26, color: INK }}>{id}</div>
            <Character id={id} x={x - 90} y={1050} scale={0.62} pose={POSES.blow} expression="neutral" left="none" right="none" frame={frame} />
            <Character id={id} x={x + 90} y={1050} scale={0.62} pose={walkPose(POSES.relaxed, frame / 30 + i * 0.2)} expression="neutral" left="none" right="none" frame={frame} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
