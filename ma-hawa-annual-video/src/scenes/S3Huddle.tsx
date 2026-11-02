// Scene 3 — The huddle: top-down camera, shoulders together, light bulbs pop on one by one.
// Amr (team lead) at the top of the circle; his idea lights first.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FaceDisc } from "../characters/Character";
import { CharId, outfitOf } from "../characters/config";
import { clamp01, easeInOut, lin, popIn } from "../fx/anim";
import { Bulb, Doodles, StarShape, Svg } from "../fx/Fx";
import { beatClock, beatPhase } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { ACCENT, ACCENT_SOFT, INK, PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";

const CX = 960;
const CY = 600;
const R = 200; // head ring radius
const ORDER: CharId[] = ["amr", "hussein", "ali"]; // bulbs light in this order (Amr first)
const ANGLE: Record<string, number> = { amr: -90, hussein: 30, ali: 150 };
const HEAD: Record<string, number> = { amr: 128, hussein: 116, ali: 118 };

export const huddleCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const first = Math.max(1, Math.floor(n * 0.25));
  const step = Math.max(1, Math.floor((n - first - 1) / 3));
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
  // slow camera rotation + push-in, gentle sway with the music
  const rot = lin(frame, [0, slot.durationInFrames], [-10, 12], easeInOut) + Math.sin((beatClock(frame) / 4) * Math.PI * 2) * 2;
  const zoom = lin(frame, [0, slot.durationInFrames], [0.95, 1.08], easeInOut);
  const dip = 0.5 + 0.5 * Math.cos(2 * Math.PI * beatPhase(frame)); // heads nod together on the beat
  const flash = c.together <= frame ? Math.exp(-(frame - c.together) / 6) : 0;

  const pos = (id: string, rr: number, extra = 0) => {
    const a = ((ANGLE[id] + rot + extra) * Math.PI) / 180;
    return { x: CX + Math.cos(a) * rr, y: CY + Math.sin(a) * rr };
  };

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Svg>
        <Doodles frame={frame} seed={9} n={18} />
      </Svg>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Svg>
          {/* floor seen from above */}
          <circle cx={CX} cy={CY} r={470} fill="#F2F5F9" />
          <circle cx={CX} cy={CY} r={470} fill="none" stroke={ACCENT} strokeWidth={4} strokeDasharray="18 18" transform={`rotate(${frame * 0.4} ${CX} ${CY})`} />
          {/* backs + shoulders in each person's shirt colour */}
          {ORDER.map((id) => {
            const a = ANGLE[id] + rot;
            const p = pos(id, R + 78);
            const o = outfitOf(id);
            const w = id === "ali" ? 200 : 178;
            return (
              <g key={id} transform={`translate(${p.x} ${p.y}) rotate(${a + 90})`}>
                <ellipse rx={w} ry={82} fill={o.top} stroke={INK} strokeWidth={STROKE} />
                <path d={`M ${-w * 0.35} -20 Q 0 -50 ${w * 0.35} -20`} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={STROKE * 0.6} strokeLinecap="round" />
              </g>
            );
          })}
          {/* arms over each other's shoulders */}
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
            const sleeve = o.sleeves === "short" ? o.skin : o.top;
            return (
              <g key={id}>
                <path d={`M ${p0.x} ${p0.y} Q ${cp.x} ${cp.y} ${p1.x} ${p1.y}`} fill="none" stroke={INK} strokeWidth={34} strokeLinecap="round" />
                <path d={`M ${p0.x} ${p0.y} Q ${cp.x} ${cp.y} ${p1.x} ${p1.y}`} fill="none" stroke={sleeve} strokeWidth={22} strokeLinecap="round" />
                <ellipse cx={p1.x} cy={p1.y} rx={16} ry={20} fill={o.skin} stroke={INK} strokeWidth={STROKE * 0.8} />
              </g>
            );
          })}
          {flash > 0 && <circle cx={CX} cy={CY} r={260 + (1 - flash) * 320} fill="none" stroke={ACCENT} strokeWidth={14 * flash} opacity={flash} />}
        </Svg>
        {/* heads looking up at the camera (kept upright for readability) */}
        {ORDER.map((id, i) => {
          const p = pos(id, R - dip * 6);
          const lit = frame >= c.bulbs[i];
          return (
            <FaceDisc key={id} id={id} x={p.x} y={p.y} r={HEAD[id] * (1 + dip * 0.02)} expression={lit ? "happy" : id === "hussein" ? "tired" : "neutral"} />
          );
        })}
        <Svg>
          {ORDER.map((id, i) => {
            const p = pos(id, R + 255);
            const on = frame >= c.bulbs[i] ? 1 : 0;
            const s = popIn(frame, c.bulbs[i], 420, 12);
            return on ? <Bulb key={id} x={p.x} y={p.y - 30} on={1} frame={frame} scale={s * 1.05} /> : null;
          })}
          {frame >= c.together && (
            <g transform={`translate(${CX} ${CY}) rotate(${frame * 3}) scale(${popIn(frame, c.together, 400, 11) * (0.9 + 0.1 * Math.sin(frame / 3))})`}>
              <StarShape r={60} fill={ACCENT} sw={STROKE} />
            </g>
          )}
          {frame < c.bulbs[0] && (
            <text x={CX} y={CY + 22} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={84} fill={ACCENT_SOFT} stroke={INK} strokeWidth={STROKE} paintOrder="stroke" opacity={clamp01(frame / 6)}>
              ?
            </text>
          )}
        </Svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: PAPER, opacity: 0 }} />
    </AbsoluteFill>
  );
};
