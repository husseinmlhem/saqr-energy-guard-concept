// Cartoon FX in line art: impact bursts, speed lines, orbiting stars, rays, bubbles, tags…
import React from "react";
import { ACCENT, ACCENT_SOFT, FONT, GOLD, INK, PAPER, STROKE } from "../theme";
import { clamp01, lin, popIn, rand, window01 } from "./anim";

const L = { stroke: INK, strokeWidth: STROKE, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...style }}>
    {children}
  </svg>
);

/** spiky comic burst with a word in it (POP!, BONK!) — appears exactly on `at` */
export const Burst: React.FC<{
  frame: number;
  at: number;
  x: number;
  y: number;
  r?: number;
  text?: string;
  hold?: number;
  fill?: string;
  rotate?: number;
  spikes?: number;
}> = ({ frame, at, x, y, r = 120, text, hold = 14, fill = ACCENT, rotate = -8, spikes = 12 }) => {
  if (frame < at || frame > at + hold + 8) return null;
  const s = popIn(frame, at, 420, 11);
  const out = clamp01((frame - at - hold) / 8);
  const pts = Array.from({ length: spikes * 2 }, (_, i) => {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.58 : r * (0.92 + rand(i + at) * 0.2);
    return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s * (1 + out * 0.3)})`} opacity={1 - out}>
      <polygon points={pts} fill={fill} {...L} />
      {text && (
        <text y={r * 0.15} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.42} fill={PAPER} stroke={INK} strokeWidth={STROKE} paintOrder="stroke">
          {text}
        </text>
      )}
    </g>
  );
};

/** radial impact lines around a point */
export const ImpactLines: React.FC<{ frame: number; at: number; x: number; y: number; r?: number; n?: number }> = ({ frame, at, x, y, r = 90, n = 10 }) => {
  const t = frame - at;
  if (t < 0 || t > 10) return null;
  const k = t / 10;
  return (
    <g transform={`translate(${x} ${y})`} opacity={1 - k}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.3;
        const r0 = r * (0.6 + k * 0.8);
        const r1 = r0 + 40 * (1 - k * 0.5);
        return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} {...L} />;
      })}
    </g>
  );
};

/** five-point star outline */
export const StarShape: React.FC<{ r: number; fill?: string; sw?: number }> = ({ r, fill = PAPER, sw = STROKE * 0.7 }) => {
  const p = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
  return <polygon points={p} fill={fill} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
};

/** dizzy stars orbiting above a head */
export const OrbitStars: React.FC<{ frame: number; x: number; y: number; rx?: number; n?: number; speed?: number }> = ({ frame, x, y, rx = 90, n = 4, speed = 0.18 }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse rx={rx} ry={rx * 0.28} fill="none" stroke={ACCENT} strokeWidth={3} strokeDasharray="10 12" opacity={0.6} />
    {Array.from({ length: n }, (_, i) => {
      const a = frame * speed + (i / n) * Math.PI * 2;
      const sc = 0.75 + 0.25 * Math.sin(a);
      return (
        <g key={i} transform={`translate(${Math.cos(a) * rx} ${Math.sin(a) * rx * 0.28}) rotate(${frame * 6}) scale(${sc})`}>
          <StarShape r={18} fill={i % 2 ? ACCENT : PAPER} />
        </g>
      );
    })}
  </g>
);

/** horizontal speed lines (wind / motion) */
export const SpeedLines: React.FC<{ frame: number; n?: number; dir?: 1 | -1; speed?: number; y0?: number; y1?: number; opacity?: number; color?: string; seed?: number }> = ({
  frame, n = 18, dir = -1, speed = 70, y0 = 80, y1 = 1000, opacity = 1, color = INK, seed = 1,
}) => (
  <g opacity={opacity}>
    {Array.from({ length: n }, (_, i) => {
      const y = y0 + rand(i * 3 + seed) * (y1 - y0);
      const len = 120 + rand(i + 9 * seed) * 260;
      const off = (rand(i * 7 + seed) * 2400 + frame * speed * (0.6 + rand(i) * 0.8)) % 2400;
      const x = dir < 0 ? 2100 - off : off - 300;
      return <line key={i} x1={x} y1={y} x2={x + len * -dir} y2={y} stroke={i % 4 === 0 ? ACCENT : color} strokeWidth={i % 3 === 0 ? 6 : 4} strokeLinecap="round" />;
    })}
  </g>
);

/** rotating blue light rays */
export const LightRays: React.FC<{ frame: number; x: number; y: number; n?: number; r?: number; intensity?: number; speed?: number }> = ({
  frame, x, y, n = 16, r = 1600, intensity = 1, speed = 0.25,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${frame * speed})`} opacity={intensity}>
    {Array.from({ length: n }, (_, i) => {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = a0 + (Math.PI * 2) / n / 2;
      return (
        <path
          key={i}
          d={`M 0 0 L ${Math.cos(a0) * r} ${Math.sin(a0) * r} L ${Math.cos(a1) * r} ${Math.sin(a1) * r} Z`}
          fill={i % 2 ? ACCENT : "rgba(118,173,222,0.45)"}
          opacity={0.55}
        />
      );
    })}
  </g>
);

/** comic speech bubble; words appear one chunk per beat */
export const SpeechBubble: React.FC<{
  frame: number;
  x: number;
  y: number;
  chunks: string[];
  chunkFrames: number[];
  hideAt?: number;
  tail?: "left" | "right" | "down";
  fontSize?: number;
  width?: number;
}> = ({ frame, x, y, chunks, chunkFrames, hideAt = Infinity, tail = "left", fontSize = 58, width: minWidth = 520 }) => {
  if (frame < chunkFrames[0]) return null;
  const chars = chunks.join(" ").length;
  const width = Math.max(minWidth, Math.round(chars * fontSize * 0.64 + fontSize * 2.4));
  const s = popIn(frame, chunkFrames[0], 300, 13) * (frame > hideAt ? Math.max(0, 1 - (frame - hideAt) / 6) : 1);
  if (s <= 0.01) return null;
  const h = fontSize * 2.6;
  const tx = tail === "left" ? -width / 2 + 70 : tail === "right" ? width / 2 - 70 : 0;
  const tip = tail === "left" ? tx - 50 : tail === "right" ? tx + 50 : tx;
  const yb = h / 2;
  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - h / 2,
        width,
        height: h,
        transform: `scale(${s})`,
        transformOrigin: tail === "left" ? "10% 120%" : tail === "right" ? "90% 120%" : "50% 120%",
      }}
    >
      <svg width={width} height={h} viewBox={`${-width / 2} ${-h / 2} ${width} ${h}`} style={{ position: "absolute", overflow: "visible" }}>
        <rect x={-width / 2} y={-h / 2} width={width} height={h} rx={h / 2} fill={PAPER} {...L} />
        <polygon points={`${tx - 34},${yb - 9} ${tip},${yb + 58} ${tx + 34},${yb - 9}`} fill={PAPER} />
        <polyline points={`${tx - 30},${yb} ${tip},${yb + 58} ${tx + 30},${yb}`} fill="none" {...L} />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: fontSize * 0.28,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize,
          color: INK,
          whiteSpace: "nowrap",
        }}
      >
        {chunks.map((c, i) => {
          const k = popIn(frame, chunkFrames[i] ?? Infinity, 500, 14);
          return (
            <span key={i} style={{ display: "inline-block", transform: `scale(${k}) translateY(${(1 - k) * 20}px)`, opacity: k > 0 ? 1 : 0, color: i === chunks.length - 1 ? ACCENT : INK }}>
              {c}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** small "Name — Role" tag, shown for 1.5 s on first appearance */
export const NameTag: React.FC<{ frame: number; at: number; x: number; y: number; text: string; duration?: number }> = ({ frame, at, x, y, text, duration = 45 }) => {
  const o = window01(frame, at, duration - 10, 5);
  if (o <= 0) return null;
  const slide = (1 - popIn(frame, at, 300, 16)) * 30;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + slide,
        transform: "translate(-50%, 0)",
        opacity: o,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 34,
        color: INK,
        background: PAPER,
        border: `${STROKE}px solid ${INK}`,
        borderRadius: 999,
        padding: "8px 26px 8px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 18, height: 18, borderRadius: 9, background: ACCENT, border: `4px solid ${INK}` }} />
      {text}
    </div>
  );
};

/** balloon on a string; (x,y) = balloon centre */
export const Balloon: React.FC<{ x: number; y: number; r?: number; fill?: string; stringTo?: { x: number; y: number } | null; squashX?: number; squashY?: number; rotate?: number; frame?: number }> = ({
  x, y, r = 60, fill = ACCENT, stringTo, squashX = 1, squashY = 1, rotate = 0, frame = 0,
}) => {
  const bottom = { x, y: y + r * 1.15 * squashY };
  const wig = Math.sin(frame / 4) * 12;
  return (
    <g>
      {stringTo && (
        <path
          d={`M ${bottom.x} ${bottom.y + 10} C ${bottom.x + wig} ${bottom.y + 80}, ${stringTo.x - wig} ${stringTo.y - 80}, ${stringTo.x} ${stringTo.y}`}
          fill="none"
          stroke={INK}
          strokeWidth={3}
        />
      )}
      <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${squashX} ${squashY})`}>
        <ellipse rx={r} ry={r * 1.15} fill={fill} {...L} />
        <path d={`M ${-r * 0.45} ${-r * 0.55} q ${r * 0.15} ${-r * 0.3} ${r * 0.45} ${-r * 0.35}`} fill="none" stroke={PAPER} strokeWidth={8} strokeLinecap="round" />
        <path d={`M -9 ${r * 1.15} l 9 14 l 9 -14 Z`} fill={fill} {...L} strokeWidth={4} />
      </g>
    </g>
  );
};

/** balloon shreds flying outward after a pop */
export const Shreds: React.FC<{ frame: number; at: number; x: number; y: number }> = ({ frame, at, x, y }) => {
  const t = frame - at;
  if (t < 0 || t > 22) return null;
  return (
    <g opacity={1 - t / 22}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + 0.4;
        const d = 30 + t * (10 + rand(i) * 6);
        return (
          <path
            key={i}
            d="M -12 0 q 6 -10 12 0 t 12 0"
            transform={`translate(${x + Math.cos(a) * d} ${y + Math.sin(a) * d + t * t * 0.25}) rotate(${t * 25 + i * 40})`}
            fill="none"
            stroke={ACCENT}
            strokeWidth={6}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

/** light bulb; `on` 0..1 lights it up with rays */
export const Bulb: React.FC<{ x: number; y: number; on: number; frame: number; scale?: number }> = ({ x, y, on, frame, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {on > 0 && (
      <g opacity={on}>
        <circle r={95} fill={ACCENT} opacity={0.18} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2 + frame * 0.02;
          const r0 = 70 + Math.sin(frame / 3 + i) * 4;
          return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0 - 10} x2={Math.cos(a) * (r0 + 28)} y2={Math.sin(a) * (r0 + 28) - 10} stroke={ACCENT} strokeWidth={7} strokeLinecap="round" />;
        })}
      </g>
    )}
    <path d="M -38 -10 a 44 44 0 1 1 76 0 c -6 12 -16 18 -16 34 l -44 0 c 0 -16 -10 -22 -16 -34 Z" fill={on > 0.5 ? ACCENT : PAPER} {...L} />
    <path d="M -12 2 q 12 -16 24 0" fill="none" stroke={on > 0.5 ? PAPER : INK} strokeWidth={4} strokeLinecap="round" />
    <rect x={-20} y={26} width={40} height={10} rx={3} fill={PAPER} {...L} />
    <rect x={-16} y={38} width={32} height={10} rx={3} fill={PAPER} {...L} />
  </g>
);

/** sweat drops near a head */
export const Sweat: React.FC<{ frame: number; x: number; y: number; n?: number }> = ({ frame, x, y, n = 2 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const t = ((frame + i * 11) % 24) / 24;
      return (
        <path
          key={i}
          d="M 0 -16 Q 12 2 0 10 Q -12 2 0 -16 Z"
          transform={`translate(${x + i * 34} ${y + t * 40}) scale(${1 - t * 0.3})`}
          fill={ACCENT}
          stroke={INK}
          strokeWidth={4}
          opacity={1 - t}
        />
      );
    })}
  </g>
);

/** exclamation mark over a head */
export const Exclaim: React.FC<{ frame: number; at: number; x: number; y: number; hold?: number; text?: string }> = ({ frame, at, x, y, hold = 20, text = "!" }) => {
  const o = window01(frame, at, hold, 3);
  if (o <= 0) return null;
  const s = popIn(frame, at, 500, 10);
  return (
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110 * s} fill={ACCENT} stroke={INK} strokeWidth={STROKE} paintOrder="stroke" opacity={o}>
      {text}
    </text>
  );
};

/** floor line */
export const Floor: React.FC<{ y?: number; dash?: boolean }> = ({ y = 905, dash }) => (
  <line x1={-50} x2={1970} y1={y} y2={y} stroke={INK} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={dash ? "40 26" : undefined} />
);

/** floating background doodles for depth (very light) */
export const Doodles: React.FC<{ frame: number; seed?: number; n?: number }> = ({ frame, seed = 3, n = 14 }) => (
  <g opacity={0.5}>
    {Array.from({ length: n }, (_, i) => {
      const x = rand(i * 5 + seed) * 1920;
      const y = 60 + rand(i * 11 + seed) * 760;
      const s = 0.5 + rand(i + seed) * 0.6;
      const f = Math.sin(frame / 20 + i) * 8;
      const kind = i % 3;
      return (
        <g key={i} transform={`translate(${x} ${y + f}) scale(${s}) rotate(${i * 30 + frame * 0.3})`}>
          {kind === 0 && <circle r={10} fill="none" stroke={ACCENT} strokeWidth={5} />}
          {kind === 1 && <path d="M -12 0 L 12 0 M 0 -12 L 0 12" stroke={ACCENT} strokeWidth={5} strokeLinecap="round" />}
          {kind === 2 && <path d="M -14 4 q 7 -12 14 0 t 14 0" fill="none" stroke={ACCENT_SOFT} strokeWidth={6} strokeLinecap="round" />}
        </g>
      );
    })}
  </g>
);

export const GoldColor = GOLD;
export const fadeInOut = (frame: number, dur: number, edge = 6) => Math.min(clamp01(frame / edge), clamp01((dur - frame) / edge));
export { lin };
