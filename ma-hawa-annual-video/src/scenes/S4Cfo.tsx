// Scene 4 — The CFO: the three hold up "BUDGET?", Saeed slowly turns away and sips his coffee.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character } from "../characters/Character";
import { charCfg } from "../characters/config";
import { POSES, lerpPose } from "../characters/rig";
import { clamp01, easeInOut, lin, popIn, squash } from "../fx/anim";
import { Doodles, Floor, NameTag, Svg } from "../fx/Fx";
import { idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf, beatIndexAtFraction } from "../sync/timeline";
import { ACCENT, FONT, INK, PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";

const GROUND = 965;
const SCALE = 1.2;
// the sign is held in front of their chests (bobblehead arms can't reach over those heads)
const HOLD = { ...POSES.stand, lArm: [-35, 75] as [number, number], rArm: [35, -75] as [number, number] };
const THREE = [
  { id: "amr" as const, x: 290, pose: HOLD },
  { id: "ali" as const, x: 590, pose: HOLD },
  { id: "hussein" as const, x: 890, pose: HOLD },
];
const SAEED_X = 1500;

export const cfoCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const tag = 0;
  const sign = beatOf(slot, 1);
  const turnStart = beatOf(slot, Math.max(2, beatIndexAtFraction(slot, 0.25)));
  const turnIdx = slot.beats.indexOf(turnStart);
  const turnEnd = beatOf(slot, turnIdx + 2);
  const sip = beatOf(slot, turnIdx + 3);
  const dots = beatOf(slot, turnIdx + 4);
  const droop = beatOf(slot, Math.min(n - 2, turnIdx + 6));
  const cues: Cues = {
    marks: [
      { f: tag, name: "tag: Saeed — CFO" },
      { f: sign, name: "BUDGET? sign up" },
      { f: turnStart, name: "Saeed turns away (slow)" },
      { f: turnEnd, name: "turned" },
      { f: sip, name: "sip" },
      { f: dots, name: "pause …" },
      { f: droop, name: "sign droops" },
    ],
    sfx: [
      { f: sign, name: "pop", volume: 0.5 },
      { f: turnStart, name: "whoosh", volume: 0.35 },
      { f: sip, name: "sip", volume: 1 },
      { f: droop, name: "boing", volume: 0.5 },
    ],
  };
  return { tag, sign, turnStart, turnEnd, sip, dots, droop, cues };
};

export const S4Cfo: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => cfoCues(slot), [slot]);
  const signUp = popIn(frame, c.sign, 320, 11);
  const droop = lin(frame, [c.droop, c.droop + 8], [0, 1], easeInOut);
  const frozen = frame >= c.dots && frame < c.droop;

  // slow turn: squash to 0 width, switch to back view, open up again
  const turnT = lin(frame, [c.turnStart, c.turnEnd], [0, 1], easeInOut);
  const turnScaleX = Math.abs(Math.cos(turnT * Math.PI));
  const isBack = turnT > 0.5;
  const sipT = frame >= c.sip ? Math.sin(clamp01((frame - c.sip + 6) / 22) * Math.PI) : 0;
  const sPose = lerpPose(POSES.sip, { ...POSES.sip, rArm: [150, 40] }, sipT);
  const sIdle = idleMotion(frame, 0.3, 0.6);

  const signY = 716 - (1 - signUp) * 120 + droop * 60;
  const signRot = -3 + droop * 11;

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Svg>
        <Doodles frame={frame} seed={13} />
        <Floor y={GROUND + 6} />
      </Svg>
      {THREE.map(({ id, x, pose }, i) => {
        const m = idleMotion(frame, i * 0.33, frozen ? 0 : 1);
        const hopeful = frame < c.droop;
        const p = frame >= c.sign ? lerpPose(POSES.stand, pose, clamp01(signUp)) : POSES.stand;
        const sad = lerpPose(p, { ...pose, lArm: [pose.lArm[0] + 40, pose.lArm[1]], rArm: [pose.rArm[0] - 40, pose.rArm[1]], hipY: 8, head: 10 }, droop);
        const [sx, sy] = squash(frame, c.sign, 0.12);
        return (
          <Character
            key={id}
            id={id}
            x={x}
            y={GROUND - m.y}
            scale={SCALE}
            pose={sad}
            expression={hopeful ? "happy" : "tired"}
            squashX={sx * m.scaleX}
            squashY={sy * m.scaleY}
            headTilt={m.headTilt}
            goggles={id === "hussein" ? "none" : undefined}
            left="none"
            frame={frame}
          />
        );
      })}
      {/* the sign */}
      <div
        style={{
          position: "absolute",
          left: 150,
          top: signY,
          width: 880,
          height: 200,
          opacity: clamp01(signUp * 3),
          transform: `rotate(${signRot}deg)`,
          background: PAPER,
          border: `${STROKE}px solid ${INK}`,
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 120,
          letterSpacing: 4,
          color: INK,
          boxShadow: `10px 10px 0 ${ACCENT}`,
        }}
      >
        {VIDEO.lines.budgetSign.replace("?", "")}
        <span style={{ color: ACCENT, display: "inline-block", transform: `rotate(${Math.sin(frame / 5) * 10}deg)` }}>?</span>
      </div>
      {/* Saeed */}
      <div style={{ position: "absolute", left: SAEED_X, top: 0, width: 0, height: 1080, transform: `scaleX(${Math.max(0.04, turnScaleX)})` }}>
        <Character
          id="saeed"
          x={0}
          y={GROUND - sIdle.y * (frozen ? 0 : 1)}
          scale={SCALE}
          pose={sPose}
          expression="happy"
          back={isBack}
          squashX={sIdle.scaleX}
          squashY={sIdle.scaleY}
          headTilt={frozen ? 0 : sIdle.headTilt * 0.5}
          frame={frame}
        />
      </div>
      {/* the pause */}
      {frame >= c.dots && (
        <div
          style={{
            position: "absolute",
            left: 1110,
            top: 300,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 120,
            color: INK,
            letterSpacing: 18,
            opacity: frame < c.droop + 10 ? 1 : 1 - clamp01((frame - c.droop - 10) / 8),
          }}
        >
          {".".repeat(1 + Math.min(2, Math.floor((frame - c.dots) / 5)))}
        </div>
      )}
      <NameTag frame={frame} at={c.tag + 2} x={SAEED_X} y={GROUND + 22} text={charCfg("saeed").tag ?? "Saeed"} />
    </AbsoluteFill>
  );
};
