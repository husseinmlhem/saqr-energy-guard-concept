// Ma Hawa water: the blue carton (logo in white, flaps open, bottle caps showing) and a bottle.
import React from "react";
import { LogoSvg } from "../brand/Logo";
import { ACCENT, INK, PAPER, STROKE } from "../theme";

const BLUE = ACCENT; // Ma Hawa #76ADDE
const BLUE_DARK = "#5C93C6";
const CAP = "#2D6FB0";

/** a carton of Ma Hawa bottles; (x, y) = bottom centre, w = width (screen px) */
export const MaHawaCarton: React.FC<{ x: number; y: number; w?: number; rot?: number; open?: boolean }> = ({ x, y, w = 170, rot = 0, open = true }) => {
  const h = w * 0.7;
  const side = w * 0.16;
  const sw = STROKE * 0.8;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {/* bottle tops peeking out */}
      {open &&
        [0, 1, 2, 3].map((k) => {
          const bx = -w / 2 + w * (0.17 + k * 0.22);
          return (
            <g key={k}>
              <rect x={bx - w * 0.045} y={-h - w * 0.12} width={w * 0.09} height={w * 0.14} rx={w * 0.02} fill="#D6ECFA" stroke={INK} strokeWidth={sw * 0.6} />
              <rect x={bx - w * 0.055} y={-h - w * 0.16} width={w * 0.11} height={w * 0.06} rx={w * 0.015} fill={CAP} stroke={INK} strokeWidth={sw * 0.6} />
            </g>
          );
        })}
      {/* side face */}
      <path d={`M ${w / 2} ${-h} L ${w / 2 + side} ${-h - side * 0.55} L ${w / 2 + side} ${-side * 0.55} L ${w / 2} 0 Z`} fill={BLUE_DARK} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      {/* front */}
      <rect x={-w / 2} y={-h} width={w} height={h} fill={BLUE} stroke={INK} strokeWidth={sw} />
      {/* open flaps */}
      {open && (
        <>
          <path d={`M ${-w / 2} ${-h} L ${-w / 2 - w * 0.12} ${-h - w * 0.14} L ${-w * 0.05} ${-h - w * 0.14} L 0 ${-h} Z`} fill={BLUE_DARK} stroke={INK} strokeWidth={sw * 0.8} strokeLinejoin="round" />
          <path d={`M ${w / 2} ${-h} L ${w / 2 + w * 0.12} ${-h - w * 0.14} L ${w * 0.05} ${-h - w * 0.14} L 0 ${-h} Z`} fill={BLUE_DARK} stroke={INK} strokeWidth={sw * 0.8} strokeLinejoin="round" />
        </>
      )}
      {/* tape + logo */}
      <rect x={-w * 0.06} y={-h} width={w * 0.12} height={h * 0.22} fill="#A8CCEB" opacity={0.9} />
      <LogoSvg x={0} y={-h * 0.45} width={w * 0.72} anchor="middle" color={PAPER} />
    </g>
  );
};

/** a stack of cartons held in the arms; (x, y) = bottom centre of the stack */
export const CartonStack: React.FC<{ x: number; y: number; w?: number; n?: number; wobble?: number }> = ({ x, y, w = 170, n = 3, wobble = 0 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <MaHawaCarton key={i} x={x + Math.sin(i * 1.7 + wobble) * 6 * i} y={y - i * w * 0.72} w={w} rot={Math.sin(wobble + i) * 2.5 * i} open={i === n - 1} />
    ))}
  </g>
);

/** a Ma Hawa bottle; (x, y) = centre, h = height (screen px) */
export const MaHawaBottle: React.FC<{ x: number; y: number; h?: number; rot?: number }> = ({ x, y, h = 90, rot = 0 }) => {
  const w = h * 0.34;
  const sw = Math.max(2, STROKE * 0.5);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M ${-w * 0.22} ${-h / 2 + h * 0.06} L ${-w * 0.22} ${-h / 2 + h * 0.16} Q ${-w / 2} ${-h / 2 + h * 0.24} ${-w / 2} ${-h / 2 + h * 0.36} L ${-w / 2} ${h / 2 - h * 0.04} Q ${-w / 2} ${h / 2} ${-w * 0.4} ${h / 2} L ${w * 0.4} ${h / 2} Q ${w / 2} ${h / 2} ${w / 2} ${h / 2 - h * 0.04} L ${w / 2} ${-h / 2 + h * 0.36} Q ${w / 2} ${-h / 2 + h * 0.24} ${w * 0.22} ${-h / 2 + h * 0.16} L ${w * 0.22} ${-h / 2 + h * 0.06} Z`} fill="#D6ECFA" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <rect x={-w * 0.48} y={-h * 0.02} width={w * 0.96} height={h * 0.3} fill={BLUE} />
      <LogoSvg x={0} y={h * 0.13} width={w * 0.62} variant="mark" color={PAPER} anchor="middle" />
      <path d={`M ${-w * 0.3} ${-h * 0.18} L ${-w * 0.3} ${h * 0.4}`} stroke={PAPER} strokeWidth={sw * 1.2} opacity={0.7} strokeLinecap="round" />
      <rect x={-w * 0.26} y={-h / 2} width={w * 0.52} height={h * 0.08} rx={2} fill={CAP} stroke={INK} strokeWidth={sw} />
    </g>
  );
};

/** body-space hand targets for carrying one carton at belly height (keeps the face clear) */
export const CARRY_HANDS = { l: { x: -74, y: -178 }, r: { x: 74, y: -178 } };
