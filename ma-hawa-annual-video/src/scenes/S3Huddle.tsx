// Scene 3 — The huddle: top-down camera, shoulders together, light bulbs pop on one by one.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FaceDisc } from "../characters/Character";
import { CharId } from "../characters/config";
import { clamp01, easeInOut, lin, popIn } from "../fx/anim";
import { Bulb, Doodles, StarShape, Svg } from "../fx/Fx";
import { beatPulse } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { ACCENT, ACCENT_SOFT, INK, PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";

const CX = 960;
const CY = 585;
const R = 185; // head ring radius
const HEAD = 118;
const ORDER: CharId[] = ["amr", "hussein", "ali"]; // bulbs light in this order

export const huddleCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const first = Math.max(1, Math.floor(n * 0.28));
  const step = Math.max(1, Math.floor(n * 0.17));
  const bulbs = ORDER.map((_, i) => beatOf(slot, Math.min(n - 2, first + i * step)));
  const together = beatOf(slot, Math.min(n - 1, first + 3 * step));
  const cues: Cues = {
    marks: [...bulbs.map((f, i) => ({ f, name: `bulb ${i + 1} (${ORDER[i]})` })), { f: together, name: "big idea flash" }],
    sfx: [...bulbs.map((f) => ({ f, name: "ding" as const, volume: 0.8 })), { f: together, name: "sparkle" as const, volume: 0.8 }],
  };
  return { bulbs, together, cues };
};

export const S3Huddle: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => huddleCues(slot), [slot]);
  // slow camera rotation + push-in (top-down)
  const rot = lin(frame, [0, slot.durationInFrames], [-14, 16], easeInOut);
  const zoom = lin(frame, [0, slot.durationInFrames], [0.92, 1.08], easeInOut);
  const pulse = beatPulse(frame, 6);
  const bob = 1 + pulse * 0.035;
  const flash = c.together <= frame ? Math.exp(-(frame - c.together) / 6) : 0;
  const angles = [-90, 30, 150];

  const pos = (i: number, rr: number) => {
    const a = ((angles[i] + rot) * Math.PI) / 180;
    return { x: CX + Math.cos(a) * rr, y: CY + Math.sin(a) * rr };
  };

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Svg>
        <Doodles frame={frame} seed={9} n={18} />
      </Svg>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Svg>
          {/* floor spotlight seen from above */}
          <circle cx={CX} cy={CY} r={430} fill={ACCENT_SOFT} opacity={0.45} />
          <circle cx={CX} cy={CY} r={430} fill="none" stroke={ACCENT} strokeWidth={4} strokeDasharray="18 18" transform={`rotate(${frame * 0.4} ${CX} ${CY})`} />
          {/* bodies seen from above: shoulders (ellipse) behind each head, arms over the neighbours' shoulders */}
          {ORDER.map((id, i) => {
            const a = angles[i] + rot;
            const p = pos(i, R + 70);
            return (
              <g key={id} transform={`translate(${p.x} ${p.y}) rotate(${a + 90})`}>
                <ellipse rx={175} ry={78} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
                <path d="M -60 -20 Q 0 -50 60 -20" fill="none" stroke={INK} strokeWidth={STROKE * 0.6} opacity={0.4} strokeLinecap="round" />
              </g>
            );
          })}
          {ORDER.map((_, i) => {
            // an arm from my shoulder across to my neighbour's far shoulder
            const a0 = ((angles[i] + rot + 38) * Math.PI) / 180;
            const a1 = ((angles[(i + 1) % 3] + rot - 38) * Math.PI) / 180;
            const am = ((angles[i] + rot + 60) * Math.PI) / 180;
            const r0 = R + 120;
            const p0 = { x: CX + Math.cos(a0) * r0, y: CY + Math.sin(a0) * r0 };
            const p1 = { x: CX + Math.cos(a1) * (r0 + 6), y: CY + Math.sin(a1) * (r0 + 6) };
            const cp = { x: CX + Math.cos(am) * (r0 + 80), y: CY + Math.sin(am) * (r0 + 80) };
            return (
              <g key={i}>
                <path d={`M ${p0.x} ${p0.y} Q ${cp.x} ${cp.y} ${p1.x} ${p1.y}`} fill="none" stroke={INK} strokeWidth={STROKE * 2.6} strokeLinecap="round" />
                <path d={`M ${p0.x} ${p0.y} Q ${cp.x} ${cp.y} ${p1.x} ${p1.y}`} fill="none" stroke={PAPER} strokeWidth={STROKE * 1.2} strokeLinecap="round" />
                <circle cx={p1.x} cy={p1.y} r={17} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
              </g>
            );
          })}
          {flash > 0 && <circle cx={CX} cy={CY} r={260 + (1 - flash) * 300} fill="none" stroke={ACCENT} strokeWidth={14 * flash} opacity={flash} />}
        </Svg>
        {/* heads looking up at the camera (kept upright for readability) */}
        {ORDER.map((id, i) => {
          const p = pos(i, R);
          const lit = frame >= c.bulbs[i];
          const k = popIn(frame, c.bulbs[i], 420, 10);
          return (
            <FaceDisc
              key={id}
              id={id}
              x={p.x}
              y={p.y}
              r={HEAD * bob * (1 + (lit ? (1 - Math.min(1, k)) * -0.2 + 0.0 : 0))}
              expression={lit ? "happy" : id === "hussein" ? "tired" : "neutral"}
              ring={lit ? ACCENT : INK}
            />
          );
        })}
        <Svg>
          {ORDER.map((id, i) => {
            const p = pos(i, R + 250);
            const on = frame >= c.bulbs[i] ? 1 : 0;
            const s = popIn(frame, c.bulbs[i], 420, 10);
            return (
              <g key={id} opacity={on ? 1 : 0.0}>
                <Bulb x={p.x} y={p.y - 40} on={on} frame={frame} scale={s * 1.05} />
              </g>
            );
          })}
          {/* the "big idea" star in the middle */}
          {frame >= c.together && (
            <g transform={`translate(${CX} ${CY}) rotate(${frame * 3}) scale(${popIn(frame, c.together, 400, 9) * (0.9 + 0.1 * Math.sin(frame / 3))})`}>
              <StarShape r={70} fill={ACCENT} sw={STROKE} />
            </g>
          )}
          {frame < c.bulbs[0] && (
            <text x={CX} y={CY + 18} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={80} fill={ACCENT} stroke={INK} strokeWidth={STROKE} paintOrder="stroke" opacity={clamp01(frame / 6)}>
              ?
            </text>
          )}
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
