// Scene 1 — Playtime: a balloon volley on the beat, one pops in Ali's face,
// another floats away with Hussein's goggles.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos } from "../characters/Character";
import { CharId, Expression } from "../characters/config";
import { POSES, Pose, lerpPose } from "../characters/rig";
import { Goggles } from "../characters/props";
import { CHARS, HEAD_R } from "../characters/config";
import { arc, clamp01, easeOut, lin, shake, squash } from "../fx/anim";
import { Balloon, Burst, Doodles, Exclaim, Floor, ImpactLines, Shreds, Svg } from "../fx/Fx";
import { idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";

const SCALE = 1.4;
const GROUND = 965;
const X: Record<"amr" | "ali" | "hussein", number> = { amr: 470, ali: 960, hussein: 1450 };
const ORDER: ("amr" | "ali" | "hussein")[] = ["amr", "ali", "hussein", "ali"];

export const playtimeCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const popBeat = Math.max(3, n - 5);
  const gogglesBeat = Math.min(n - 2, popBeat + 2);
  // the volley must reach Ali exactly on the pop beat
  const shift = ORDER[popBeat % 4] === "ali" ? 0 : 1;
  const who = (k: number) => ORDER[(k + shift) % 4];
  const taps = Array.from({ length: popBeat + 1 }, (_, k) => ({ f: beatOf(slot, k), who: who(k) }));
  const pop = beatOf(slot, popBeat);
  const goggles = beatOf(slot, gogglesBeat);
  const cues: Cues = {
    marks: [
      ...taps.slice(0, -1).map((t, i) => ({ f: t.f, name: `tap ${i + 1} (${t.who})` })),
      { f: pop, name: "POP in Ali's face" },
      { f: goggles, name: "goggles float away" },
    ],
    sfx: [
      ...taps.slice(0, -1).map((t) => ({ f: t.f, name: "boing" as const, volume: 0.45 })),
      { f: pop, name: "pop" as const, volume: 1 },
      { f: goggles, name: "whoosh" as const, volume: 0.7 },
    ],
  };
  return { taps, pop, goggles, cues };
};

const handTop = (id: CharId, pose: Pose) => {
  const h = headScreenPos(id, X[id as keyof typeof X], GROUND, SCALE, pose);
  return { x: h.x, y: h.y - h.r - 70 };
};

export const S1Playtime: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => playtimeCues(slot), [slot]);
  const cam = shake(frame, [c.pop], 18);

  // ---- volley balloon position
  let bx = 0;
  let by = 0;
  let volleyVisible = frame < c.pop;
  const idx = c.taps.findIndex((t, i) => frame >= t.f && (i === c.taps.length - 1 || frame < c.taps[i + 1].f));
  if (frame < c.taps[0].f) {
    const p = handTop(c.taps[0].who, POSES.tapUp);
    bx = p.x;
    by = p.y - 120 * (1 - frame / Math.max(1, c.taps[0].f));
  } else if (idx >= 0 && idx < c.taps.length - 1) {
    const a = c.taps[idx];
    const b = c.taps[idx + 1];
    const t = (frame - a.f) / (b.f - a.f);
    const pa = handTop(a.who, POSES.tapUp);
    const pb = b.f === c.pop ? (() => { const h = headScreenPos("ali", X.ali, GROUND, SCALE, POSES.stand); return { x: h.x, y: h.y }; })() : handTop(b.who, POSES.tapUp);
    const p = arc(pa, pb, t, 150 + Math.abs(pb.x - pa.x) * 0.15);
    bx = p.x;
    by = p.y;
  } else volleyVisible = false;

  // ---- who is tapping right now (arm up for ~6 frames around each tap)
  const tapAmount = (id: string) => {
    let a = 0;
    for (const t of c.taps.slice(0, -1)) {
      if (t.who !== id) continue;
      const d = frame - t.f;
      a = Math.max(a, d < -5 ? 0 : d < 0 ? (d + 5) / 5 : Math.max(0, 1 - d / 8));
    }
    return a;
  };

  // ---- goggles balloon
  const gogglesGone = frame >= c.goggles;
  const hHead = headScreenPos("hussein", X.hussein, GROUND, SCALE, POSES.stand);
  const g2t = Math.max(0, frame - c.goggles);
  const g2 = gogglesGone
    ? { x: hHead.x + 40 + g2t * 4 + Math.sin(g2t / 5) * 18, y: hHead.y - 300 - g2t * 9 }
    : { x: hHead.x + 150 + Math.sin(frame / 9) * 10, y: hHead.y - 300 + Math.sin(frame / 7) * 8 };
  const gogglesHang = { x: g2.x, y: g2.y + 190 };

  const chars: { id: "amr" | "ali" | "hussein"; offset: number }[] = [
    { id: "amr", offset: 0 },
    { id: "ali", offset: 0.5 },
    { id: "hussein", offset: 1 },
  ];

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Svg>
        <Doodles frame={frame} seed={2} />
      </Svg>
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px)` }}>
        <Svg>
          <Floor y={GROUND + 6} />
        </Svg>
        {chars.map(({ id, offset }) => {
          const m = idleMotion(frame, offset, 1.2);
          const tap = tapAmount(id);
          let pose = lerpPose(POSES.cheer, POSES.tapUp, tap);
          let expression: Expression = "happy";
          let sq: [number, number] = [m.scaleX, m.scaleY];
          let tilt = m.headTilt;
          if (id === "ali" && frame >= c.pop) {
            pose = POSES.shocked;
            expression = "shocked";
            const [a, b] = squash(frame, c.pop, 0.3);
            sq = [a, b];
            tilt = -8 + Math.sin(frame) * 2 * Math.exp(-(frame - c.pop) / 6);
          }
          if (id === "hussein" && frame >= c.goggles) {
            pose = lerpPose(POSES.shocked, POSES.pointUp, clamp01((frame - c.goggles) / 6));
            expression = "tired";
          }
          if (id === "amr" && frame >= c.pop) {
            pose = lerpPose(pose, POSES.shocked, 0.6);
            expression = frame < c.pop + 25 ? "shocked" : "happy";
          }
          return (
            <Character
              key={id}
              id={id}
              x={X[id]}
              y={GROUND - m.y * (id === "ali" && frame >= c.pop ? 0 : 1)}
              scale={SCALE}
              pose={pose}
              expression={expression}
              squashX={sq[0]}
              squashY={sq[1]}
              headTilt={tilt}
              goggles={id === "hussein" ? (gogglesGone ? "none" : "forehead") : undefined}
              left="none"
              frame={frame}
            />
          );
        })}
        <Svg>
          {/* Hussein's balloon, string tied to his goggles strap */}
          <Balloon
            x={g2.x}
            y={g2.y}
            r={55}
            fill="rgba(118,173,222,0.55)"
            stringTo={gogglesGone ? { x: gogglesHang.x, y: gogglesHang.y - 12 } : { x: hHead.x + HEAD_R * SCALE * 0.9, y: hHead.y - HEAD_R * SCALE * 0.38 }}
            frame={frame}
          />
          {gogglesGone && (
            <g transform={`translate(${gogglesHang.x} ${gogglesHang.y + 10}) rotate(${Math.sin(frame / 6) * 12}) scale(${SCALE * 1.15})`}>
              <Goggles r={HEAD_R} sw={STROKE / (SCALE * 1.15)} eyes={[CHARS.faceGeometry.leftEye, CHARS.faceGeometry.rightEye]} mode="eyes" />
            </g>
          )}
          {volleyVisible && <Balloon x={bx} y={by} r={58} rotate={Math.sin(frame / 5) * 10} frame={frame} />}
          <Shreds frame={frame} at={c.pop} x={X.ali} y={headScreenPos("ali", X.ali, GROUND, SCALE, POSES.stand).y} />
          <ImpactLines frame={frame} at={c.pop} x={X.ali} y={headScreenPos("ali", X.ali, GROUND, SCALE, POSES.stand).y} r={120} />
          <Burst frame={frame} at={c.pop} x={X.ali + 150} y={headScreenPos("ali", X.ali, GROUND, SCALE, POSES.stand).y - 140} text="POP!" r={115} hold={16} />
          <Exclaim frame={frame} at={c.goggles} x={hHead.x - 120} y={hHead.y - 100} hold={30} />
          {/* little lift lines under the escaping goggles */}
          {gogglesGone && frame - c.goggles < 18 && (
            <g opacity={1 - (frame - c.goggles) / 18}>
              {[-30, 0, 30].map((dx) => (
                <line key={dx} x1={gogglesHang.x + dx} x2={gogglesHang.x + dx} y1={gogglesHang.y + 120} y2={gogglesHang.y + 170} stroke="#111" strokeWidth={5} strokeLinecap="round" />
              ))}
            </g>
          )}
        </Svg>
      </AbsoluteFill>
      {/* intro: quick fade from white on the very first beat */}
      <AbsoluteFill style={{ background: PAPER, opacity: 1 - lin(frame, [0, 8], [0, 1], easeOut), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
