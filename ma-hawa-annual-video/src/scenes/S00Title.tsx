// Scene 0 — Title: the camera glides across the Ma Hawa office, the title slams in on the beats.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character } from "../characters/Character";
import { POSES, withIdle } from "../characters/rig";
import { clamp01, easeInOut, easeOut, lin, popIn } from "../fx/anim";
import { idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { FONT, INK, PAPER } from "../theme";
import { Stage, camAt } from "./kit";
import { LogoSvg } from "../brand/Logo";
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
        {/* the real logo: the mark pops on beat 1, the wordmark wipes in on beat 2 */}
        <svg width={1200} height={360} viewBox="0 0 1000 300" style={{ overflow: "visible" }}>
          <defs>
            <clipPath id="titleWordWipe">
              <rect x={300} y={-40} width={720 * easeOut(clamp01(k2))} height={380} />
            </clipPath>
          </defs>
          <g transform={`translate(140 150) scale(${0.2 + 0.8 * k1}) rotate(${(1 - clamp01(k1)) * -90}) translate(-140 -150)`} opacity={clamp01(k1 * 3)}>
            <LogoSvg x={0} y={0} width={280} variant="mark" />
          </g>
          <g clipPath="url(#titleWordWipe)" transform={`translate(${(1 - clamp01(k2)) * 40} 0)`}>
            <LogoSvg x={325} y={35} width={675} variant="word" />
          </g>
        </svg>
        <div style={{ marginTop: 28, fontFamily: FONT, fontWeight: 800, fontSize: 46, letterSpacing: 22 + (1 - k3) * 30, color: INK, opacity: clamp01(k3 * 2) }}>{VIDEO.title.sub}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
