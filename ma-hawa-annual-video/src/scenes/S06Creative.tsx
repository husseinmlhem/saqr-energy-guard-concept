// Scene 6 — Creative huddle (top-down): shoulders together, sketches of wild ideas orbit,
// bulbs light one by one — Hussein's is the big one — and EUREKA on the last beat.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FaceDisc } from "../characters/Character";
import { CharId, outfitOf } from "../characters/config";
import { clamp01, easeInOut, lin, popIn } from "../fx/anim";
import { Bulb, Doodles, LightRays, StarShape, Svg } from "../fx/Fx";
import { beatClock, beatPhase } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { ACCENT, GOLD, INK, PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";

const CX = 960;
const CY = 600;
const R = 200;
const ORDER: CharId[] = ["amr", "ali", "hussein"];
const ANGLE: Record<string, number> = { amr: -90, hussein: 30, ali: 150 };
const HEAD: Record<string, number> = { amr: 128, hussein: 120, ali: 118 };
const ICONS = ["rocket", "vr", "play", "drone", "cube", "spark"] as const;

const Icon: React.FC<{ kind: (typeof ICONS)[number] }> = ({ kind }) => {
  const L = { stroke: INK, strokeWidth: STROKE * 0.8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (kind) {
    case "rocket":
      return (
        <g>
          <path d="M 0 -46 C 20 -30 22 0 14 26 L -14 26 C -22 0 -20 -30 0 -46 Z" fill={PAPER} {...L} />
          <circle cx={0} cy={-10} r={8} fill={ACCENT} {...L} />
          <path d="M -14 14 L -28 32 L -12 28 M 14 14 L 28 32 L 12 28" fill={ACCENT} {...L} />
          <path d="M -8 30 L 0 48 L 8 30" fill={GOLD} {...L} />
        </g>
      );
    case "vr":
      return (
        <g>
          <rect x={-40} y={-20} width={80} height={40} rx={14} fill={ACCENT} {...L} />
          <circle cx={-16} cy={0} r={10} fill={PAPER} {...L} />
          <circle cx={16} cy={0} r={10} fill={PAPER} {...L} />
        </g>
      );
    case "play":
      return (
        <g>
          <rect x={-40} y={-30} width={80} height={60} rx={10} fill={PAPER} {...L} />
          <path d="M -10 -14 L 16 0 L -10 14 Z" fill={ACCENT} {...L} />
        </g>
      );
    case "drone":
      return (
        <g>
          <rect x={-16} y={-8} width={32} height={16} rx={6} fill={ACCENT} {...L} />
          {[-36, 36].map((x) => (
            <g key={x}>
              <line x1={x / 2} y1={0} x2={x} y2={-10} {...L} />
              <ellipse cx={x} cy={-14} rx={18} ry={5} fill={PAPER} {...L} />
            </g>
          ))}
        </g>
      );
    case "cube":
      return (
        <g>
          <path d="M 0 -34 L 30 -18 L 30 18 L 0 34 L -30 18 L -30 -18 Z" fill={PAPER} {...L} />
          <path d="M 0 -34 L 30 -18 L 0 -2 L -30 -18 Z" fill={ACCENT} {...L} />
          <path d="M 0 -2 L 0 34" {...L} />
        </g>
      );
    default:
      return <StarShape r={34} fill={GOLD} />;
  }
};

export const creativeCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const icons = ICONS.map((_, i) => beatOf(slot, Math.min(n - 2, i)));
  const bulbs = [beatOf(slot, 2), beatOf(slot, 4), beatOf(slot, Math.min(n - 2, 6))];
  const eureka = beatOf(slot, n - 1);
  const cues: Cues = {
    marks: [
      ...icons.map((f, i) => ({ f, name: `sketch: ${ICONS[i]}` })),
      ...bulbs.map((f, i) => ({ f, name: `bulb (${ORDER[i]})` })),
      { f: eureka, name: "EUREKA" },
    ],
    sfx: [...bulbs.map((f) => ({ f, name: "ding" as const, volume: 0.8 })), { f: eureka, name: "sparkle" as const, volume: 1 }, { f: eureka, name: "slam" as const, volume: 0.4 }],
  };
  return { icons, bulbs, eureka, cues };
};

export const S06Creative: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => creativeCues(slot), [slot]);
  const rot = lin(frame, [0, slot.durationInFrames], [-14, 14], easeInOut) + Math.sin((beatClock(frame) / 4) * Math.PI * 2) * 2;
  const zoom = lin(frame, [0, slot.durationInFrames], [0.92, 1.1], easeInOut);
  const dip = 0.5 + 0.5 * Math.cos(2 * Math.PI * beatPhase(frame));
  const eureka = frame >= c.eureka ? popIn(frame, c.eureka, 300, 10) : 0;
  const pos = (id: string, rr: number) => {
    const a = ((ANGLE[id] + rot) * Math.PI) / 180;
    return { x: CX + Math.cos(a) * rr, y: CY + Math.sin(a) * rr };
  };

  return (
    <AbsoluteFill style={{ background: "#EEF3F9" }}>
      <Svg>
        <Doodles frame={frame} seed={9} n={22} />
        {eureka > 0 && <LightRays frame={frame} x={CX} y={CY} intensity={eureka * 0.8} speed={1.2} />}
      </Svg>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Svg>
          <circle cx={CX} cy={CY} r={470} fill="#E2EAF4" />
          <circle cx={CX} cy={CY} r={470} fill="none" stroke={ACCENT} strokeWidth={4} strokeDasharray="18 18" transform={`rotate(${frame * 0.4} ${CX} ${CY})`} />
          {ORDER.map((id) => {
            const p = pos(id, R + 78);
            const o = outfitOf(id);
            const w = id === "ali" ? 200 : 178;
            return (
              <g key={id} transform={`translate(${p.x} ${p.y}) rotate(${ANGLE[id] + rot + 90})`}>
                <ellipse rx={w} ry={82} fill={o.top} stroke={INK} strokeWidth={STROKE} />
              </g>
            );
          })}
          {ORDER.map((id, i) => {
            const nb = ORDER[(i + 1) % 3];
            const span = ((ANGLE[nb] - ANGLE[id] + 360) % 360) || 120;
            const a0 = ((ANGLE[id] + rot + 36) * Math.PI) / 180;
            const a1 = ((ANGLE[id] + rot + span - 36) * Math.PI) / 180;
            const am = ((ANGLE[id] + rot + span / 2) * Math.PI) / 180;
            const r0 = R + 125;
            const p0 = { x: CX + Math.cos(a0) * r0, y: CY + Math.sin(a0) * r0 };
            const p1 = { x: CX + Math.cos(a1) * r0, y: CY + Math.sin(a1) * r0 };
            const cp = { x: CX + Math.cos(am) * (r0 + 70), y: CY + Math.sin(am) * (r0 + 70) };
            const o = outfitOf(id);
            return (
              <g key={id}>
                <path d={`M ${p0.x} ${p0.y} Q ${cp.x} ${cp.y} ${p1.x} ${p1.y}`} fill="none" stroke={INK} strokeWidth={34} strokeLinecap="round" />
                <path d={`M ${p0.x} ${p0.y} Q ${cp.x} ${cp.y} ${p1.x} ${p1.y}`} fill="none" stroke={o.sleeves === "short" ? o.skin : o.top} strokeWidth={22} strokeLinecap="round" />
                <ellipse cx={p1.x} cy={p1.y} rx={16} ry={20} fill={o.skin} stroke={INK} strokeWidth={STROKE * 0.8} />
              </g>
            );
          })}
          {/* idea sketches orbiting the huddle */}
          {ICONS.map((k, i) => {
            if (frame < c.icons[i]) return null;
            const s = popIn(frame, c.icons[i], 420, 12);
            const a = (i / ICONS.length) * Math.PI * 2 + frame * 0.012;
            const rr = 560;
            return (
              <g key={k} transform={`translate(${CX + Math.cos(a) * rr} ${CY + Math.sin(a) * rr * 0.62}) scale(${s * 1.3}) rotate(${Math.sin(frame / 8 + i) * 8})`}>
                <circle r={58} fill={PAPER} stroke={INK} strokeWidth={STROKE * 0.7} />
                <Icon kind={k} />
              </g>
            );
          })}
        </Svg>
        {ORDER.map((id, i) => {
          const p = pos(id, R - dip * 6);
          const lit = frame >= c.bulbs[i];
          return <FaceDisc key={id} id={id} x={p.x} y={p.y} r={HEAD[id] * (1 + dip * 0.02)} expression={lit ? "happy" : id === "hussein" ? "tired" : "neutral"} />;
        })}
        <Svg>
          {ORDER.map((id, i) => {
            if (frame < c.bulbs[i]) return null;
            const p = pos(id, R + 255);
            const big = id === "hussein" ? 1.45 : 1.0;
            return <Bulb key={id} x={p.x} y={p.y - 30} on={1} frame={frame} scale={popIn(frame, c.bulbs[i], 420, 12) * big} />;
          })}
          {eureka > 0 && (
            <g transform={`translate(${CX} ${CY}) scale(${eureka * 1.6})`}>
              <Bulb x={0} y={0} on={1} frame={frame} scale={1.4} />
            </g>
          )}
        </Svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: PAPER, opacity: frame >= c.eureka ? Math.exp(-(frame - c.eureka) / 3) * 0.8 : 0 }} />
      <AbsoluteFill style={{ opacity: clamp01((frame - c.eureka) / 3) }}>
        <Svg>
          {frame >= c.eureka && (
            <text x={CX} y={190} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={140} fill={ACCENT} stroke={INK} strokeWidth={12} paintOrder="stroke" transform={`rotate(-4 ${CX} 190)`}>
              EUREKA!
            </text>
          )}
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
