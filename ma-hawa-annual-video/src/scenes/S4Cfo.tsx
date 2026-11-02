// Scene 4 — The CFO: Ali, Amr (centre) and Hussein hold up "BUDGET?", Saeed slowly turns away and sips his coffee.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, jointScreenPos } from "../characters/Character";
import { charCfg, outfitOf } from "../characters/config";
import { POSES, Pose, lerpPose, withIdle } from "../characters/rig";
import { clamp01, easeInOut, lin, popIn } from "../fx/anim";
import { Doodles, NameTag, Svg } from "../fx/Fx";
import { BEAT_FRAMES, idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { ACCENT, FONT, INK, PAPER, STROKE } from "../theme";
import { Ground } from "./common";
import { Cues, SceneProps } from "./types";

const GROUND = 1040;
const SCALE = 1.4;
const THREE = [
  { id: "ali" as const, x: 300 },
  { id: "amr" as const, x: 600 },
  { id: "hussein" as const, x: 900 },
];
const SAEED_X = 1500;

export const cfoCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const tag = 0;
  const sign = beatOf(slot, 1);
  const turnIdx = Math.min(n - 5, 2);
  const turnStart = beatOf(slot, turnIdx);
  const turnEnd = beatOf(slot, turnIdx + 2);
  const sip = beatOf(slot, turnIdx + 3);
  const dots = beatOf(slot, turnIdx + 4);
  const droop = beatOf(slot, Math.min(n - 1, turnIdx + 5));
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
      { f: sign, name: "pop", volume: 0.45 },
      { f: turnStart, name: "whoosh", volume: 0.3 },
      { f: sip, name: "sip", volume: 1 },
      { f: droop, name: "boing", volume: 0.4 },
    ],
  };
  return { tag, sign, turnStart, turnEnd, sip, dots, droop, cues };
};

export const S4Cfo: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => cfoCues(slot), [slot]);
  const signUp = popIn(frame, c.sign, 240, 16);
  const droop = lin(frame, [c.droop, c.droop + 10], [0, 1], easeInOut);
  const frozen = frame >= c.dots && frame < c.droop;

  // slow turn: narrow to edge-on, switch to the back view, open up again
  const turnT = lin(frame, [c.turnStart, c.turnEnd], [0, 1], easeInOut);
  const turnScaleX = Math.abs(Math.cos(turnT * Math.PI));
  const isBack = turnT > 0.5;
  const sipT = frame >= c.sip - 8 ? Math.sin(clamp01((frame - c.sip + 8) / (BEAT_FRAMES * 1.6)) * Math.PI) : 0;
  const sIdle = idleMotion(frame, 0.3, frozen ? 0 : 0.5);
  const sPose = lerpPose(withIdle(POSES.sip, sIdle), { ...POSES.sip, rArm: [150, 40], head: -6 }, sipT);

  const neck = jointScreenPos("amr", 600, GROUND, SCALE, POSES.holdSign, "neck");
  const signTop = neck.y + 26 - (1 - signUp) * 140 + droop * 50;
  const signRot = -2 + droop * 9;
  const signL = 130;
  const signW = 940;

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Svg>
        <Doodles frame={frame} seed={13} />
      </Svg>
      <Ground y={GROUND} />
      {THREE.map(({ id, x }, i) => {
        const m = idleMotion(frame, i * 0.33, frozen ? 0 : 0.8);
        const hopeful = frame < c.droop;
        const up: Pose = withIdle(POSES.holdSign, m);
        const sad: Pose = { ...up, hipY: up.hipY + 10, lean: i === 0 ? -4 : i === 2 ? 4 : 0, head: 10 };
        const pose = frame >= c.sign ? lerpPose(withIdle(POSES.relaxed, m), lerpPose(up, sad, droop), clamp01(signUp)) : withIdle(POSES.relaxed, m);
        return (
          <Character
            key={id}
            id={id}
            x={x}
            y={GROUND}
            scale={SCALE}
            pose={pose}
            expression={hopeful ? "happy" : "tired"}
            headTilt={frozen ? 0 : m.headTilt}
            goggles={id === "hussein" ? "none" : undefined}
            left="none"
            frame={frame}
          />
        );
      })}
      {/* the sign, held in front of their chests */}
      {frame >= c.sign - 2 && (
        <div
          style={{
            position: "absolute",
            left: signL,
            top: signTop,
            width: signW,
            height: 200,
            transform: `rotate(${signRot}deg)`,
            transformOrigin: "50% 0%",
            background: "#FFFDF7",
            border: `${STROKE}px solid ${INK}`,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 124,
            letterSpacing: 4,
            color: INK,
            boxShadow: `10px 10px 0 ${ACCENT}`,
            opacity: clamp01(signUp * 3),
          }}
        >
          {VIDEO.lines.budgetSign.replace("?", "")}
          <span style={{ color: ACCENT, display: "inline-block", transform: `rotate(${Math.sin(frame / 5) * 10}deg)` }}>?</span>
          {/* hands gripping the edges */}
          {(["ali", "amr", "hussein"] as const).map((id, k) => {
            const o = outfitOf(id);
            const xs = [36, signW / 2 - 70, signW / 2 + 40, signW - 60];
            const hx = k === 0 ? [xs[0]] : k === 1 ? [xs[1], xs[2]] : [xs[3]];
            return hx.map((hxv) => (
              <div key={`${id}${hxv}`} style={{ position: "absolute", left: hxv - 6, top: -16, width: 36, height: 44, borderRadius: 18, background: o.skin, border: `${STROKE * 0.8}px solid ${INK}` }} />
            ));
          })}
        </div>
      )}
      {/* Saeed */}
      <div style={{ position: "absolute", left: SAEED_X, top: 0, width: 0, height: 1080, transform: `scaleX(${Math.max(0.05, turnScaleX)})` }}>
        <Character id="saeed" x={0} y={GROUND} scale={SCALE} pose={sPose} expression="neutral" back={isBack} headTilt={frozen ? 0 : sIdle.headTilt * 0.5} frame={frame} />
      </div>
      {/* the pause */}
      {frame >= c.dots && (
        <div
          style={{
            position: "absolute",
            left: 1150,
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
      <NameTag frame={frame} at={c.tag + 2} x={SAEED_X} y={250} text={charCfg("saeed").tag ?? "Saeed"} />
    </AbsoluteFill>
  );
};
