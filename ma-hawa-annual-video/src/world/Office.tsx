// The Ma Hawa office set: wall, windows with a skyline, brand wall, floor in perspective.
// Rendered with a simple camera (centre + zoom) and parallax per layer, plus day → night lighting.
import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT, INK, PAPER, STROKE } from "../theme";
import { rand } from "../fx/anim";
import { LogoSvg } from "../brand/Logo";

export type Cam = { x: number; y: number; zoom: number; rot?: number };
export const CAM0: Cam = { x: 960, y: 540, zoom: 1 };

/** CSS transform that maps world → screen for a camera, with a parallax depth (1 = moves with the stage) */
export const camTransform = (cam: Cam, depth = 1) => {
  const z = 1 + (cam.zoom - 1) * depth;
  const cx = 960 + (cam.x - 960) * depth;
  const cy = 540 + (cam.y - 540) * depth;
  return `translate(${960 - cx * z}px, ${540 - cy * z}px) scale(${z}) rotate(${(cam.rot ?? 0) * depth}deg)`;
};

export type OfficeVariant = "open" | "board" | "meeting" | "cfo" | "work";

const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
};

const Skyline: React.FC<{ x: number; y: number; w: number; h: number; night: number; shift: number; seed: number }> = ({ x, y, w, h, night, shift, seed }) => {
  const sky = mix("#CFE3F5", "#0F1B33", night);
  const far = mix("#AFC9E2", "#1B2A47", night);
  const near = mix("#8FB1D3", "#22345A", night);
  const towers = Array.from({ length: 14 }, (_, i) => ({
    x: x - 60 + i * (w / 10) + rand(seed + i) * 30,
    w: 34 + rand(seed + i * 3) * 46,
    h: h * (0.25 + rand(seed + i * 7) * 0.55),
    spire: rand(seed + i * 11) > 0.75,
  }));
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={sky} />
      {night > 0.5 && <circle cx={x + w * 0.78} cy={y + h * 0.2} r={22} fill="#F4F1DE" opacity={(night - 0.5) * 2} />}
      <g transform={`translate(${shift} 0)`}>
        {towers.map((t, i) => (
          <g key={i}>
            <rect x={t.x} y={y + h - t.h * 0.7} width={t.w * 1.3} height={t.h * 0.7} fill={far} />
            <rect x={t.x + 20} y={y + h - t.h} width={t.w} height={t.h} fill={near} />
            {t.spire && <path d={`M ${t.x + 20 + t.w / 2 - 4} ${y + h - t.h} L ${t.x + 20 + t.w / 2} ${y + h - t.h - 60} L ${t.x + 20 + t.w / 2 + 4} ${y + h - t.h} Z`} fill={near} />}
            {night > 0.3 &&
              Array.from({ length: Math.floor(t.h / 26) }, (_, k) => (
                <rect key={k} x={t.x + 26 + (k % 2) * (t.w / 2 - 6)} y={y + h - t.h + 10 + k * 24} width={8} height={10} fill="#FFD98A" opacity={rand(seed + i * 31 + k) > 0.45 ? night : 0} />
              ))}
          </g>
        ))}
      </g>
    </g>
  );
};

const Plant: React.FC<{ x: number; y: number; s?: number; night: number }> = ({ x, y, s = 1, night }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-50, -20, 10, 40, -70, 60].map((a, i) => (
      <path key={i} d={`M 0 -60 Q ${a * 0.6} ${-140 - (i % 3) * 30} ${a * 1.3} ${-170 - (i % 2) * 40}`} fill="none" stroke={mix("#5E9E6E", "#2C4B3A", night)} strokeWidth={16} strokeLinecap="round" />
    ))}
    <path d="M -46 -64 L 46 -64 L 36 0 L -36 0 Z" fill={mix("#E7DCCD", "#5B5447", night)} stroke={INK} strokeWidth={STROKE * 0.8} strokeLinejoin="round" />
  </g>
);

/**
 * Office background. `cam` drives parallax; `night` 0..1 dims the room and lights the city.
 * Everything here sits behind the characters (who share the same camera at depth 1).
 */
export const Office: React.FC<{ cam?: Cam; night?: number; variant?: OfficeVariant; children?: React.ReactNode; floorY?: number }> = ({
  cam = CAM0,
  night = 0,
  variant = "open",
  children,
  floorY = 700,
}) => {
  const wall = mix("#F3F6FA", "#232C3F", night);
  const wallLow = mix("#E8EEF5", "#1C2435", night);
  const floor = mix("#ECEFF3", "#1A2030", night);
  const line = mix("#DDE3EA", "#283149", night);
  const frame = mix("#FFFFFF", "#3A4560", night);
  const skyShift = (cam.x - 960) * -0.25;
  const vpX = 960;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: wall }}>
      {/* wall + windows (slight parallax) */}
      <AbsoluteFill style={{ transform: camTransform(cam, 0.82), transformOrigin: "0 0" }}>
        <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
          <rect x={-900} y={-500} width={3720} height={floorY + 500} fill={wall} />
          <rect x={-900} y={floorY - 70} width={3720} height={70} fill={wallLow} />
          {variant !== "cfo" && (
            <>
              {[
                [-560, 520],
                [1360, 560],
                [2000, 520],
              ].map(([wx, ww], i) => (
                <g key={i}>
                  <Skyline x={wx} y={70} w={ww} h={floorY - 170} night={night} shift={skyShift} seed={i * 50} />
                  <rect x={wx} y={70} width={ww} height={floorY - 170} fill="none" stroke={frame} strokeWidth={18} />
                  <line x1={wx + ww / 2} x2={wx + ww / 2} y1={70} y2={floorY - 100} stroke={frame} strokeWidth={10} />
                  <rect x={wx} y={70} width={ww} height={floorY - 170} fill="none" stroke={INK} strokeWidth={STROKE * 0.6} opacity={0.5} />
                </g>
              ))}
              <Skyline x={60} y={70} w={520} h={floorY - 170} night={night} shift={skyShift} seed={7} />
              <rect x={60} y={70} width={520} height={floorY - 170} fill="none" stroke={frame} strokeWidth={18} />
              <line x1={320} x2={320} y1={70} y2={floorY - 100} stroke={frame} strokeWidth={10} />
            </>
          )}
          {variant === "open" && <BrandWall x={700} y={110} night={night} />}
          {variant === "work" && <BrandWall x={700} y={110} night={night} small />}
          {variant === "board" && <Board x={600} y={90} w={720} h={480} night={night} />}
          {variant === "cfo" && <CfoWall night={night} floorY={floorY} />}
          {variant === "meeting" && <rect x={-900} y={-500} width={3720} height={floorY + 430} fill={mix("#EDF2F8", "#232C3F", night)} />}
          <Plant x={640} y={floorY - 4} s={1.1} night={night} />
          <Plant x={1290} y={floorY - 4} s={0.9} night={night} />
        </svg>
      </AbsoluteFill>
      {/* floor (moves with the stage) */}
      <AbsoluteFill style={{ transform: camTransform(cam, 1), transformOrigin: "0 0" }}>
        <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
          <rect x={-900} y={floorY} width={3720} height={1200} fill={floor} />
          {Array.from({ length: 23 }, (_, i) => {
            const x0 = -1300 + i * 200;
            return <line key={i} x1={vpX + (x0 - vpX) * 0.32} y1={floorY} x2={x0} y2={1600} stroke={line} strokeWidth={3} />;
          })}
          {[0.08, 0.22, 0.42, 0.7].map((k, i) => (
            <line key={`h${i}`} x1={-900} x2={2820} y1={floorY + k * 900} y2={floorY + k * 900} stroke={line} strokeWidth={2} />
          ))}
          <line x1={-900} x2={2820} y1={floorY} y2={floorY} stroke={INK} strokeWidth={STROKE * 0.7} opacity={0.6} />
        </svg>
        {children}
      </AbsoluteFill>
      {/* night: room darkens, warm pool of light can be added by scenes */}
      {night > 0 && <AbsoluteFill style={{ background: `rgba(8,14,30,${night * 0.25})`, pointerEvents: "none" }} />}
    </AbsoluteFill>
  );
};

const BrandWall: React.FC<{ x: number; y: number; night: number; small?: boolean }> = ({ x, y, night, small }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={0} width={520} height={small ? 300 : 420} rx={10} fill={mix("#FFFFFF", "#2B3550", night)} stroke={INK} strokeWidth={STROKE * 0.6} opacity={0.95} />
    <LogoSvg x={260} y={small ? 150 : 210} width={small ? 400 : 450} anchor="middle" markColor={night > 0.5 ? "#C9D2E0" : undefined} />
  </g>
);

const Board: React.FC<{ x: number; y: number; w: number; h: number; night: number }> = ({ x, y, w, h, night }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={10} fill={mix("#FFFFFF", "#2B3550", night)} stroke={INK} strokeWidth={STROKE} />
    <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} rx={6} fill="none" stroke={mix("#E3E8EF", "#3A4560", night)} strokeWidth={3} />
    <text x={x + 30} y={y + 56} fontFamily={FONT} fontWeight={800} fontSize={30} fill={mix("#9AA6BC", "#7A8496", night)}>
      IDEAS
    </text>
    <rect x={x + w * 0.3} y={y + h} width={w * 0.4} height={14} fill={mix("#C9D2DE", "#3A4560", night)} stroke={INK} strokeWidth={STROKE * 0.6} />
  </g>
);

const CfoWall: React.FC<{ night: number; floorY: number }> = ({ night, floorY }) => (
  <g>
    <rect x={-900} y={-500} width={3720} height={floorY + 500} fill={mix("#EFE7DC", "#2A2621", night)} />
    {/* wood panels */}
    {Array.from({ length: 18 }, (_, i) => (
      <line key={i} x1={-900 + i * 220} x2={-900 + i * 220} y1={-500} y2={floorY} stroke={mix("#E2D6C6", "#332E27", night)} strokeWidth={6} />
    ))}
    {/* bookshelf */}
    <g transform="translate(1180 120)">
      <rect width={560} height={480} fill={mix("#C9A27A", "#4A3B2C", night)} stroke={INK} strokeWidth={STROKE} />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x={14} y={20 + r * 152} width={532} height={136} fill={mix("#F6EFE5", "#2E2822", night)} />
          {Array.from({ length: 12 }, (_, k) => (
            <rect key={k} x={24 + k * 42 + (k > 6 ? 30 : 0)} y={40 + r * 152 + (k % 3) * 6} width={30} height={110 - (k % 3) * 6} fill={["#2F5D8A", "#B85C38", "#76ADDE", "#3E7D5A", "#D4A62A"][(k + r) % 5]} stroke={INK} strokeWidth={2.5} />
          ))}
        </g>
      ))}
    </g>
    {/* framed chart */}
    <g transform="translate(560 170)">
      <rect width={420} height={300} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
      <polyline points="40,250 120,200 190,215 260,140 330,110 390,60" fill="none" stroke="#3E7D5A" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      <text x={30} y={50} fontFamily={FONT} fontWeight={800} fontSize={28} fill={INK}>
        Q4
      </text>
    </g>
  </g>
);

/** soft radial vignette + top light: makes flat scenes feel lit */
export const Lighting: React.FC<{ strength?: number }> = ({ strength = 1 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse 75% 70% at 50% 42%, rgba(255,255,255,0) 55%, rgba(12,26,52,${0.22 * strength}) 100%)`,
    }}
  />
);
