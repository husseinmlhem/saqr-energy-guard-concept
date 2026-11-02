// Hand-held props, drawn in line art. Each is drawn with the hand at (0,0).
import React from "react";
import { ACCENT, ACCENT_SOFT, GOLD, INK, PAPER } from "../theme";

export type PropName = "clipboard" | "bat" | "coffee" | "box" | "marker" | "gadget" | "stamp" | "none";

type PropProps = { sw: number; angle: number; frame?: number; glow?: number };

const line = (sw: number) => ({ stroke: INK, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

/** Props that follow the forearm direction get rotated; upright props don't. */
export const PROP_FOLLOWS_ARM: Record<PropName, boolean> = {
  clipboard: false, bat: true, coffee: false, box: false, marker: true, gadget: false, stamp: false, none: false,
};

export const Prop: React.FC<{ name: PropName } & PropProps> = ({ name, sw, angle, frame = 0 }) => {
  const rot = PROP_FOLLOWS_ARM[name] ? -angle : 0;
  return <g transform={`rotate(${rot})`}>{renderProp(name, sw, frame)}</g>;
};

const renderProp = (name: PropName, sw: number, frame: number) => {
  switch (name) {
    case "clipboard":
      return (
        <g transform="translate(-30,-56) rotate(-6)">
          <rect x={0} y={0} width={56} height={72} rx={6} fill={PAPER} {...line(sw)} />
          <rect x={16} y={-7} width={24} height={13} rx={4} fill={ACCENT} {...line(sw * 0.8)} />
          {[20, 34, 48].map((y) => (
            <line key={y} x1={10} x2={y === 48 ? 32 : 46} y1={y} y2={y} {...line(sw * 0.6)} />
          ))}
          <path d="M 10 60 l 5 5 l 10 -10" fill="none" stroke={ACCENT} strokeWidth={sw * 0.7} strokeLinecap="round" />
        </g>
      );
    case "bat":
      return (
        <g>
          <path d="M -5 -14 L -7 40 Q -16 120 -12 150 Q 0 162 12 150 Q 16 120 7 40 L 5 -14 Z" fill={PAPER} {...line(sw)} />
          <line x1={-8} x2={8} y1={-4} y2={-4} stroke={ACCENT} strokeWidth={sw} strokeLinecap="round" />
          <line x1={-8} x2={8} y1={8} y2={8} stroke={ACCENT} strokeWidth={sw} strokeLinecap="round" />
        </g>
      );
    case "coffee": {
      const s1 = Math.sin(frame / 6) * 4;
      return (
        <g transform="translate(0,-6)">
          {/* small Arabic coffee cup (finjan) */}
          <path d="M -17 -22 L 17 -22 L 12 4 Q 0 9 -12 4 Z" fill={PAPER} {...line(sw)} />
          <path d="M -15 -12 L 15 -12" stroke={ACCENT} strokeWidth={sw * 0.8} strokeLinecap="round" />
          <path d={`M -6 -32 q ${4 + s1} -8 0 -16 q ${-4 - s1} -8 0 -16`} fill="none" {...line(sw * 0.55)} opacity={0.75} />
          <path d={`M 6 -30 q ${3 - s1} -7 0 -13 q ${-3 + s1} -7 0 -13`} fill="none" {...line(sw * 0.55)} opacity={0.75} />
        </g>
      );
    }
    case "box":
      return (
        <g transform="translate(-55,-96)">
          <rect x={0} y={0} width={110} height={88} rx={4} fill={PAPER} {...line(sw)} />
          <path d="M 0 22 L 110 22 M 44 0 L 44 22 M 66 0 L 66 22" fill="none" {...line(sw * 0.7)} />
          <rect x={40} y={0} width={30} height={88} fill={ACCENT_SOFT} stroke="none" />
          <text x={55} y={64} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={22} fill={INK}>
            HEAVY
          </text>
        </g>
      );
    case "marker":
      return (
        <g>
          <rect x={-6} y={-6} width={12} height={46} rx={4} fill={ACCENT} {...line(sw * 0.7)} />
          <path d="M -6 40 L 0 54 L 6 40" fill={INK} {...line(sw * 0.5)} />
        </g>
      );
    case "gadget": {
      const blink = Math.floor(frame / 6) % 2 === 0;
      return (
        <g transform="translate(-24,-50)">
          <rect x={0} y={0} width={48} height={40} rx={8} fill={PAPER} {...line(sw)} />
          <circle cx={14} cy={20} r={6} fill={blink ? ACCENT : PAPER} {...line(sw * 0.6)} />
          <line x1={26} x2={38} y1={14} y2={14} {...line(sw * 0.6)} />
          <line x1={26} x2={38} y1={26} y2={26} {...line(sw * 0.6)} />
          <line x1={40} x2={52} y1={0} y2={-24} {...line(sw * 0.7)} />
          <circle cx={53} cy={-27} r={5} fill={blink ? ACCENT : PAPER} {...line(sw * 0.6)} />
        </g>
      );
    }
    case "stamp":
      return (
        <g transform="translate(0,-40)">
          <rect x={-12} y={-40} width={24} height={40} rx={10} fill={ACCENT} {...line(sw)} />
          <rect x={-34} y={0} width={68} height={22} rx={4} fill={PAPER} {...line(sw)} />
        </g>
      );
    default:
      return null;
  }
};

/** Hussein's inventor goggles; drawn in head space (head centre = 0,0, radius r). */
export const Goggles: React.FC<{
  r: number;
  sw: number;
  eyes: [[number, number], [number, number]];
  mode: "eyes" | "forehead";
  glow?: number;
}> = ({ r, sw, eyes, mode, glow = 0 }) => {
  const d = 2 * r;
  const yOff = mode === "forehead" ? -0.36 * r : 0;
  const [l, rr] = eyes.map(([x, y]) => ({ x: (x - 0.5) * d, y: (y - 0.5) * d + yOff }));
  const lr = 0.25 * r;
  const glowA = Math.max(0, Math.min(1, glow));
  return (
    <g>
      {glowA > 0 && (
        <g opacity={glowA}>
          <circle cx={l.x} cy={l.y} r={lr * 2.1} fill={ACCENT} opacity={0.35} filter="url(#glowBlur)" />
          <circle cx={rr.x} cy={rr.y} r={lr * 2.1} fill={ACCENT} opacity={0.35} filter="url(#glowBlur)" />
        </g>
      )}
      {/* strap to the edge of the head */}
      <path d={`M ${-r * 0.8} ${l.y + 2} L ${l.x - lr} ${l.y}`} {...line(sw * 1.3)} fill="none" />
      <path d={`M ${r * 0.8} ${rr.y + 2} L ${rr.x + lr} ${rr.y}`} {...line(sw * 1.3)} fill="none" />
      <path d={`M ${l.x + lr * 0.8} ${l.y - 2} Q 0 ${l.y - lr * 0.6} ${rr.x - lr * 0.8} ${rr.y - 2}`} {...line(sw)} fill="none" />
      {[l, rr].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={lr + sw * 0.9} fill={PAPER} {...line(sw)} />
          <circle
            cx={p.x}
            cy={p.y}
            r={lr * 0.78}
            fill={ACCENT}
            fillOpacity={mode === "eyes" ? 0.35 + 0.55 * glowA : 0.55}
            stroke={INK}
            strokeWidth={sw * 0.6}
          />
          <path d={`M ${p.x - lr * 0.4} ${p.y - lr * 0.25} q ${lr * 0.2} ${-lr * 0.3} ${lr * 0.5} ${-lr * 0.3}`} stroke={PAPER} strokeWidth={sw * 0.6} strokeLinecap="round" fill="none" />
        </g>
      ))}
    </g>
  );
};

export const GoldStar: React.FC<{ r: number; sw: number }> = ({ r, sw }) => {
  const p = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
  return <polygon points={p} fill={GOLD} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
};
