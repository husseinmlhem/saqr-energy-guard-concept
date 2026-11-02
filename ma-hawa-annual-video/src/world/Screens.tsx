// Realistic monitors with believable (generic, unbranded) app UIs:
// 3D booth design, video edit timeline, code editor, analytics dashboard, render/export progress, pitch slides.
import React from "react";
import { rand } from "../fx/anim";
import { ACCENT, FONT, GOLD, INK, STROKE } from "../theme";

export type ScreenKind = "3d" | "edit" | "code" | "dash" | "render" | "design";

const UI = { bg: "#1B1D22", panel: "#24262D", bar: "#2D3038", line: "#3A3E48", text: "#9AA3B2", hi: "#E6E9EF" };

/** a monitor in SVG space: (x, y) = top-left of the screen area */
export const Monitor: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  kind: ScreenKind;
  frame: number;
  progress?: number;
  glow?: number;
  stand?: boolean;
  label?: string;
}> = ({ x, y, w, h, kind, frame, progress = 0.5, glow = 0, stand = true, label }) => {
  const bez = Math.max(8, w * 0.018);
  return (
    <g>
      {glow > 0 && <rect x={x - 40} y={y - 40} width={w + 80} height={h + 80} rx={40} fill={ACCENT} opacity={0.18 * glow} filter="url(#screenGlow)" />}
      {stand && (
        <g>
          <path d={`M ${x + w / 2 - w * 0.05} ${y + h + bez} L ${x + w / 2 - w * 0.035} ${y + h + bez + h * 0.22} L ${x + w / 2 + w * 0.035} ${y + h + bez + h * 0.22} L ${x + w / 2 + w * 0.05} ${y + h + bez} Z`} fill="#3B3F48" stroke={INK} strokeWidth={STROKE * 0.6} />
          <rect x={x + w / 2 - w * 0.17} y={y + h + bez + h * 0.22} width={w * 0.34} height={Math.max(8, h * 0.045)} rx={4} fill="#4A4F5A" stroke={INK} strokeWidth={STROKE * 0.6} />
        </g>
      )}
      <rect x={x - bez} y={y - bez} width={w + bez * 2} height={h + bez * 2} rx={bez * 0.9} fill="#15161A" stroke={INK} strokeWidth={STROKE * 0.7} />
      <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="hidden">
        <App kind={kind} w={w} h={h} frame={frame} progress={progress} label={label} />
        {/* glass reflection */}
        <path d={`M ${w * 0.55} 0 L ${w * 0.75} 0 L ${w * 0.35} ${h} L ${w * 0.15} ${h} Z`} fill="#FFFFFF" opacity={0.04} />
      </svg>
      <circle cx={x + w / 2} cy={y + h + bez * 0.5} r={Math.max(1.5, bez * 0.18)} fill="#7CF3A0" opacity={0.8} />
    </g>
  );
};

const Chrome: React.FC<{ w: number; h: number; title: string }> = ({ w, h, title }) => {
  const t = Math.max(12, h * 0.055);
  return (
    <g>
      <rect width={w} height={h} fill={UI.bg} />
      <rect width={w} height={t} fill={UI.bar} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={t * 0.6 + i * t * 0.55} cy={t / 2} r={t * 0.18} fill={["#FF5F57", "#FEBC2E", "#28C840"][i]} />
      ))}
      <text x={w / 2} y={t * 0.7} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={t * 0.5} fill={UI.text}>
        {title}
      </text>
    </g>
  );
};

const App: React.FC<{ kind: ScreenKind; w: number; h: number; frame: number; progress: number; label?: string }> = ({ kind, w, h, frame, progress, label }) => {
  const t = Math.max(12, h * 0.055);
  const fs = Math.max(7, h * 0.032);
  switch (kind) {
    case "3d": {
      // booth model rotating in a viewport, outliner + properties panels
      const vx = w * 0.18;
      const vw = w * 0.6;
      const vh = h - t * 2.2;
      const a = frame * 0.02;
      const cx = vx + vw / 2;
      const cy = t * 1.6 + vh * 0.62;
      const S = Math.min(vw, vh) * 0.22;
      const P = (x: number, y: number, z: number) => {
        const X = x * Math.cos(a) - z * Math.sin(a);
        const Z = x * Math.sin(a) + z * Math.cos(a);
        return [cx + X * S, cy - y * S + Z * S * 0.35] as const;
      };
      const box = (x0: number, z0: number, sx: number, sy: number, sz: number, col: string) => {
        const c = [
          P(x0, 0, z0), P(x0 + sx, 0, z0), P(x0 + sx, 0, z0 + sz), P(x0, 0, z0 + sz),
          P(x0, sy, z0), P(x0 + sx, sy, z0), P(x0 + sx, sy, z0 + sz), P(x0, sy, z0 + sz),
        ];
        const f = (idx: number[], o: number) => <polygon points={idx.map((i) => c[i].join(",")).join(" ")} fill={col} opacity={o} stroke="#0B0C0F" strokeWidth={1} />;
        return (
          <g>
            {f([0, 1, 5, 4], 0.95)}
            {f([1, 2, 6, 5], 0.8)}
            {f([4, 5, 6, 7], 1)}
            {f([3, 2, 6, 7], 0.7)}
          </g>
        );
      };
      return (
        <g>
          <Chrome w={w} h={h} title="booth_v12.3d — Viewport" />
          <rect x={0} y={t} width={vx} height={h - t} fill={UI.panel} />
          <rect x={vx + vw} y={t} width={w - vx - vw} height={h - t} fill={UI.panel} />
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <rect x={6} y={t + 10 + i * fs * 2} width={vx - 12} height={fs * 1.4} rx={2} fill={i === 2 ? "#2F4A6B" : "transparent"} />
              <rect x={14 + (i % 3) * 8} y={t + 14 + i * fs * 2} width={vx * (0.4 + rand(i) * 0.4)} height={fs * 0.6} rx={2} fill={UI.text} opacity={0.7} />
            </g>
          ))}
          {/* grid floor */}
          {Array.from({ length: 11 }, (_, i) => {
            const k = i - 5;
            const [x1, y1] = P(k * 0.5, 0, -2.5);
            const [x2, y2] = P(k * 0.5, 0, 2.5);
            const [x3, y3] = P(-2.5, 0, k * 0.5);
            const [x4, y4] = P(2.5, 0, k * 0.5);
            return (
              <g key={i} stroke="#3B404C" strokeWidth={1}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} />
                <line x1={x3} y1={y3} x2={x4} y2={y4} />
              </g>
            );
          })}
          {box(-1.6, -1.2, 3.2, 0.12, 2.4, "#C9CED8")}
          {box(-1.5, -1.1, 3.0, 1.6, 0.12, ACCENT)}
          {box(-1.5, -1.1, 0.12, 1.6, 2.0, "#5D8FC2")}
          {box(-0.5, 0.2, 1.0, 0.7, 0.6, "#E6E9EF")}
          {box(-0.35, 0.3, 0.7, 1.2, 0.06, "#1E2A3B")}
          {box(0.9, 0.4, 0.4, 1.9, 0.4, GOLD)}
          {/* gizmo */}
          <g transform={`translate(${vx + vw - 40} ${t + 40})`}>
            <line x1={0} y1={0} x2={22} y2={6} stroke="#FF5A5A" strokeWidth={3} />
            <line x1={0} y1={0} x2={0} y2={-24} stroke="#5ADB6E" strokeWidth={3} />
            <line x1={0} y1={0} x2={-16} y2={12} stroke="#5AA8FF" strokeWidth={3} />
          </g>
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <rect x={vx + vw + 10} y={t + 14 + i * fs * 2.2} width={(w - vx - vw) * 0.35} height={fs * 0.6} rx={2} fill={UI.text} opacity={0.6} />
              <rect x={vx + vw + (w - vx - vw) * 0.5} y={t + 10 + i * fs * 2.2} width={(w - vx - vw) * 0.42} height={fs * 1.3} rx={3} fill={UI.bar} />
            </g>
          ))}
          <rect x={vx} y={h - t * 1.1} width={vw} height={t * 1.1} fill={UI.bar} />
          <text x={vx + 8} y={h - t * 0.35} fontFamily={FONT} fontSize={fs} fill={UI.text}>
            Verts 48,210 · Faces 46,972 · Render: Cycles
          </text>
        </g>
      );
    }
    case "edit": {
      // preview on top, multi-track timeline below, moving playhead
      const ph = h * 0.5;
      const tl = h - ph - t;
      const play = ((frame * 3) % (w * 0.9)) + w * 0.05;
      return (
        <g>
          <Chrome w={w} h={h} title="Event_Recap_FINAL_v7 — Edit" />
          <rect x={w * 0.22} y={t + 8} width={w * 0.56} height={ph - 16} fill="#000" />
          <defs>
            <linearGradient id="editGrad" x1="0" x2="1">
              <stop offset="0" stopColor="#1F3B66" />
              <stop offset="1" stopColor="#76ADDE" />
            </linearGradient>
          </defs>
          <rect x={w * 0.24} y={t + 14} width={w * 0.52} height={ph - 28} fill="url(#editGrad)" />
          <circle cx={w * 0.5 + Math.sin(frame / 10) * 30} cy={t + ph * 0.45} r={ph * 0.15} fill="#FFFFFF" opacity={0.35} />
          <rect x={w * 0.3} y={t + ph * 0.66} width={w * 0.4} height={fs * 1.6} rx={3} fill="#FFFFFF" opacity={0.85} />
          <rect x={0} y={t + ph} width={w} height={tl} fill={UI.panel} />
          {[0, 1, 2, 3, 4].map((r) => {
            const y = t + ph + 10 + r * (tl - 20) / 5;
            const hh = (tl - 20) / 5 - 4;
            const colors = ["#5D8FC2", "#7B61C4", "#3E9C6E", "#C98B3A", "#3E9C6E"];
            return (
              <g key={r}>
                {Array.from({ length: 6 }, (_, k) => {
                  const x = w * 0.05 + k * w * 0.15 + rand(r * 9 + k) * 20;
                  const cw = w * (0.08 + rand(r * 3 + k) * 0.06);
                  return r < 3 ? (
                    <rect key={k} x={x} y={y} width={cw} height={hh} rx={3} fill={colors[r]} opacity={0.9} />
                  ) : (
                    <g key={k}>
                      <rect x={x} y={y} width={cw} height={hh} rx={3} fill={colors[r]} opacity={0.35} />
                      {Array.from({ length: Math.floor(cw / 4) }, (_, q) => {
                        const a = (Math.abs(Math.sin(q * 0.7 + k + r)) * 0.8 + 0.1) * hh * 0.45;
                        return <line key={q} x1={x + q * 4 + 2} x2={x + q * 4 + 2} y1={y + hh / 2 - a} y2={y + hh / 2 + a} stroke={colors[r]} strokeWidth={2} />;
                      })}
                    </g>
                  );
                })}
              </g>
            );
          })}
          <line x1={play} x2={play} y1={t + ph} y2={h} stroke="#FF4D4D" strokeWidth={2} />
          <polygon points={`${play - 6},${t + ph} ${play + 6},${t + ph} ${play},${t + ph + 8}`} fill="#FF4D4D" />
        </g>
      );
    }
    case "code": {
      const lines = Math.floor((h - t) / (fs * 1.6));
      const off = Math.floor(frame / 4);
      const colors = ["#C792EA", "#82AAFF", "#C3E88D", "#F78C6C", "#89DDFF", "#FFCB6B", UI.text];
      return (
        <g>
          <Chrome w={w} h={h} title="experience/app.tsx — Code" />
          <rect x={0} y={t} width={w * 0.16} height={h - t} fill={UI.panel} />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={10 + (i % 2) * 8} y={t + 12 + i * fs * 1.8} width={w * 0.1} height={fs * 0.6} rx={2} fill={UI.text} opacity={i === 4 ? 1 : 0.5} />
          ))}
          {Array.from({ length: lines }, (_, i) => {
            const n = i + off;
            const y = t + 8 + i * fs * 1.6;
            const indent = (Math.floor(rand(n * 1.3) * 4) * w) / 40;
            let x = w * 0.2 + indent;
            return (
              <g key={i}>
                <text x={w * 0.17} y={y + fs} fontFamily="monospace" fontSize={fs * 0.9} fill="#4B5263">
                  {n + 1}
                </text>
                {Array.from({ length: 2 + Math.floor(rand(n) * 4) }, (_, k) => {
                  const ww = 20 + rand(n * 7 + k) * (w * 0.1);
                  const el = <rect key={k} x={x} y={y + fs * 0.25} width={ww} height={fs * 0.75} rx={2} fill={colors[Math.floor(rand(n * 3 + k) * colors.length)]} opacity={0.9} />;
                  x += ww + 8;
                  return el;
                })}
              </g>
            );
          })}
          {Math.floor(frame / 8) % 2 === 0 && <rect x={w * 0.5} y={t + 8 + (lines - 2) * fs * 1.6} width={2} height={fs * 1.2} fill={UI.hi} />}
        </g>
      );
    }
    case "dash": {
      const n = 24;
      const k = Math.min(1, progress * 1.2);
      const pts = Array.from({ length: n }, (_, i) => {
        const v = 0.25 + 0.6 * (i / n) + Math.sin(i * 0.9) * 0.06;
        return `${w * 0.06 + (i / (n - 1)) * w * 0.55},${h * 0.9 - v * h * 0.45 * k}`;
      }).join(" ");
      return (
        <g>
          <Chrome w={w} h={h} title="Campaign Analytics" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={w * 0.04 + i * w * 0.235} y={t + 10} width={w * 0.215} height={h * 0.22} rx={6} fill={UI.panel} />
              <text x={w * 0.06 + i * w * 0.235} y={t + 10 + h * 0.08} fontFamily={FONT} fontSize={fs} fill={UI.text}>
                {["Reach", "Visitors", "Leads", "Engagement"][i]}
              </text>
              <text x={w * 0.06 + i * w * 0.235} y={t + 10 + h * 0.18} fontFamily={FONT} fontWeight={800} fontSize={fs * 2.2} fill={UI.hi}>
                {[`${(2.4 * (0.5 + progress / 2)).toFixed(1)}M`, `${Math.round(48 * (0.5 + progress / 2))}K`, `${Math.round(3200 * (0.5 + progress / 2))}`, `${Math.round(38 + 20 * progress)}%`][i]}
              </text>
            </g>
          ))}
          <rect x={w * 0.04} y={h * 0.4} width={w * 0.6} height={h * 0.55} rx={6} fill={UI.panel} />
          <polyline points={pts} fill="none" stroke={ACCENT} strokeWidth={3} strokeLinejoin="round" />
          <rect x={w * 0.66} y={h * 0.4} width={w * 0.3} height={h * 0.55} rx={6} fill={UI.panel} />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={w * 0.69 + i * w * 0.042} y={h * 0.9 - (0.2 + rand(i) * 0.6) * h * 0.4 * k} width={w * 0.03} height={(0.2 + rand(i) * 0.6) * h * 0.4 * k} rx={2} fill={i % 2 ? "#5D8FC2" : GOLD} />
          ))}
        </g>
      );
    }
    case "design": {
      return (
        <g>
          <Chrome w={w} h={h} title="Event Key Visual — Artboard 3" />
          <rect x={0} y={t} width={w * 0.07} height={h - t} fill={UI.panel} />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={w * 0.015} y={t + 12 + i * h * 0.08} width={w * 0.04} height={w * 0.04} rx={4} fill={i === 2 ? ACCENT : UI.bar} />
          ))}
          <rect x={w * 0.8} y={t} width={w * 0.2} height={h - t} fill={UI.panel} />
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={w * 0.81} y={t + 10 + i * fs * 2} width={w * 0.17} height={fs * 1.4} rx={3} fill={i === 1 ? "#2F4A6B" : UI.bar} />
          ))}
          <rect x={w * 0.2} y={t + h * 0.06} width={w * 0.48} height={h * 0.82} fill="#0E2238" />
          <circle cx={w * 0.44} cy={t + h * 0.38} r={h * 0.2} fill={ACCENT} opacity={0.8} />
          <circle cx={w * 0.52} cy={t + h * 0.3} r={h * 0.1} fill={GOLD} opacity={0.9} />
          <rect x={w * 0.25} y={t + h * 0.62} width={w * 0.38} height={fs * 2.6} fill="#FFFFFF" />
          <rect x={w * 0.25} y={t + h * 0.72} width={w * 0.26} height={fs * 1.2} fill="#FFFFFF" opacity={0.6} />
          <rect x={w * 0.2 - 2} y={t + h * 0.06 - 2} width={w * 0.48 + 4} height={h * 0.82 + 4} fill="none" stroke={ACCENT} strokeWidth={2} strokeDasharray="6 4" />
        </g>
      );
    }
    case "render": {
      const p = Math.max(0, Math.min(1, progress));
      return (
        <g>
          <Chrome w={w} h={h} title="Export Queue" />
          {(label ?? "Booth_Render_4K.png|Event_Recap_FINAL.mp4|Pitch_Deck.pdf").split("|").map((name, i) => {
            const y = t + 20 + i * h * 0.24;
            const pi = Math.max(0, Math.min(1, p * 1.25 - i * 0.12));
            return (
              <g key={i}>
                <rect x={w * 0.05} y={y} width={w * 0.9} height={h * 0.19} rx={6} fill={UI.panel} />
                <text x={w * 0.08} y={y + h * 0.07} fontFamily={FONT} fontWeight={600} fontSize={fs * 1.2} fill={UI.hi}>
                  {name}
                </text>
                <rect x={w * 0.08} y={y + h * 0.1} width={w * 0.7} height={h * 0.035} rx={4} fill={UI.bar} />
                <rect x={w * 0.08} y={y + h * 0.1} width={w * 0.7 * pi} height={h * 0.035} rx={4} fill={pi >= 1 ? "#3FBF6F" : ACCENT} />
                <text x={w * 0.82} y={y + h * 0.135} fontFamily={FONT} fontWeight={700} fontSize={fs * 1.2} fill={pi >= 1 ? "#3FBF6F" : UI.text}>
                  {pi >= 1 ? "✓" : `${Math.round(pi * 100)}%`}
                </text>
              </g>
            );
          })}
        </g>
      );
    }
  }
};

/** desk with a three-monitor workstation, keyboard, mouse, mug(s); (x, y) = desk top-left */
export const Workstation: React.FC<{ x: number; y: number; w: number; frame: number; kinds?: ScreenKind[]; progress?: number; glow?: number; mugs?: number; night?: number }> = ({
  x,
  y,
  w,
  frame,
  kinds = ["3d", "edit", "code"],
  progress = 0.5,
  glow = 0,
  mugs = 1,
}) => {
  const mw = w * 0.31;
  const mh = mw * 0.58;
  const gap = w * 0.02;
  return (
    <g>
      <defs>
        <filter id="screenGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={30} />
        </filter>
      </defs>
      {kinds.map((k, i) => (
        <Monitor key={i} x={x + gap + i * (mw + gap)} y={y - mh - mh * 0.32} w={mw} h={mh} kind={k} frame={frame + i * 17} progress={progress} glow={glow} />
      ))}
      {/* desk */}
      <rect x={x - 20} y={y} width={w + 40} height={26} rx={6} fill="#D9C7AE" stroke={INK} strokeWidth={STROKE * 0.8} />
      <rect x={x} y={y + 26} width={w} height={220} fill="#E9DCC8" stroke={INK} strokeWidth={STROKE * 0.8} />
      <rect x={x + w * 0.35} y={y - 18} width={w * 0.3} height={16} rx={4} fill="#2A2D34" stroke={INK} strokeWidth={STROKE * 0.5} />
      <ellipse cx={x + w * 0.72} cy={y - 7} rx={14} ry={8} fill="#2A2D34" stroke={INK} strokeWidth={STROKE * 0.5} />
      {Array.from({ length: mugs }, (_, i) => (
        <g key={i} transform={`translate(${x + w * 0.06 + (i % 4) * 34} ${y - 2 - Math.floor(i / 4) * 40})`}>
          <path d="M -13 -36 L 13 -36 L 11 0 L -11 0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={STROKE * 0.5} />
          <rect x={-13} y={-28} width={26} height={8} fill={ACCENT} />
        </g>
      ))}
    </g>
  );
};
