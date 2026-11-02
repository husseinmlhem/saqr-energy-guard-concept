// Scene 0 — Title: the camera glides across the Ma Hawa office, the title slams in on the beats.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character } from "../characters/Character";
import { POSES, withIdle } from "../characters/rig";
import { clamp01, easeInOut, lin, popIn } from "../fx/anim";
import { idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { ACCENT, FONT, INK, PAPER } from "../theme";
import { Stage, camAt } from "./kit";
import { Cues, SceneProps } from "./types";

export const CAST_X = { ali: 470, amr: 960, hussein: 1450 } as const;
export const GROUND = 1000;
export const CAST_S = 1.42;

export const titleCues = (slot: SceneSlot) => {
  const main = beatOf(slot, 0);
  const second = beatOf(slot, 1);
  const sub = beatOf(slot, 2);
  const out = beatOf(slot, 3);
  const cues: Cues = {
    marks: [
      { f: main, name: "title: MA" },
      { f: second, name: "title: HAWA" },
      { f: sub, name: "subtitle" },
      { f: out, name: "title out" },
    ],
    sfx: [
      { f: main, name: "slam", volume: 0.7 },
      { f: second, name: "stamp", volume: 0.8 },
      { f: sub, name: "sparkle", volume: 0.5 },
      { f: out, name: "whoosh", volume: 0.5 },
    ],
  };
  return { main, second, sub, out, cues };
};

export const S00Title: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => titleCues(slot), [slot]);
  const cam = camAt(frame, [
    [0, { x: 1560, y: 480, zoom: 1.45 }],
    [slot.durationInFrames, { x: 960, y: 540, zoom: 1.0 }],
  ]);
  const veil = 1 - lin(frame, [c.out - 4, slot.durationInFrames], [0, 1], easeInOut);
  const outT = lin(frame, [c.out, slot.durationInFrames], [0, 1], easeInOut);
  const k1 = popIn(frame, c.main - 1, 420, 13);
  const k2 = popIn(frame, c.second - 1, 420, 13);
  const k3 = popIn(frame, c.sub, 260, 16);

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Stage cam={cam}>
        {(["ali", "amr", "hussein"] as const).map((id, i) => (
          <Character key={id} id={id} x={CAST_X[id]} y={GROUND} scale={CAST_S} pose={withIdle(POSES.relaxed, idleMotion(frame, i * 0.3, 0.6))} expression="happy" left="none" frame={frame} />
        ))}
      </Stage>
      {/* frosted veil so the title reads, lifting as the camera arrives */}
      <AbsoluteFill style={{ background: `rgba(255,255,255,${0.78 * veil})` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translateY(${-outT * 700}px) scale(${1 - outT * 0.2})`, opacity: 1 - outT }}>
        {/* MARKETING (beat 1) TEAM (beat 2) */}
        <div style={{ display: "flex", gap: 44, fontFamily: FONT, fontWeight: 900, fontSize: 190, letterSpacing: 6, lineHeight: 1 }}>
          <span style={{ display: "inline-block", transform: `scale(${1 + (1 - k1) * 1.2})`, opacity: clamp01(k1 * 3), color: INK, textShadow: `12px 12px 0 ${ACCENT}` }}>MARKETING</span>
          <span style={{ display: "inline-block", transform: `scale(${1 + (1 - k2) * 1.2})`, opacity: clamp01(k2 * 3), color: ACCENT, textShadow: `12px 12px 0 ${INK}` }}>TEAM</span>
        </div>
        <div style={{ marginTop: 28, fontFamily: FONT, fontWeight: 800, fontSize: 46, letterSpacing: 22 + (1 - k3) * 30, color: INK, opacity: clamp01(k3 * 2) }}>{VIDEO.title.sub}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
