// Shared scene kit: kinetic captions, floor pump, sticky notes, stage (set + camera + light).
import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { clamp01, popIn, rand } from "../fx/anim";
import { ACCENT, FONT, INK, PAPER, STROKE } from "../theme";
import { BEAT_FRAMES, beatPhase } from "../sync/beats";
import { Cam, CAM0, Lighting, Office, OfficeVariant, camTransform } from "../world/Office";

// ------------------------------------------------------------------ camera
export type CamKey = [number, Partial<Cam>];
/** keyframed camera, eased; keys are [frame, {x,y,zoom,rot}] */
export const camAt = (frame: number, keys: CamKey[], base: Cam = CAM0): Cam => {
  const full = keys.map(([f, c]) => [f, { ...base, ...c }] as [number, Cam]);
  if (frame <= full[0][0]) return full[0][1];
  for (let i = 0; i < full.length - 1; i++) {
    const [f0, a] = full[i];
    const [f1, b] = full[i + 1];
    if (frame <= f1) {
      const t = interpolate(frame, [f0, f1], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, zoom: a.zoom + (b.zoom - a.zoom) * t, rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * t };
    }
  }
  return full[full.length - 1][1];
};

/** handheld feel: tiny drift locked to the bar + a punch on every downbeat */
export const breathe = (cam: Cam, frame: number, amount = 1): Cam => ({
  ...cam,
  x: cam.x + Math.sin(frame / 37) * 6 * amount,
  y: cam.y + Math.cos(frame / 43) * 4 * amount,
  zoom: cam.zoom * (1 + 0.004 * amount * Math.exp(-beatPhase(frame) * 6)),
});

/** office set + a world layer for characters, both seen through the same camera */
export const Stage: React.FC<{ cam: Cam; night?: number; variant?: OfficeVariant; children: React.ReactNode; overlay?: React.ReactNode; light?: number }> = ({
  cam,
  night = 0,
  variant = "open",
  children,
  overlay,
  light = 1,
}) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Office cam={cam} night={night} variant={variant} />
    <AbsoluteFill style={{ transform: camTransform(cam, 1), transformOrigin: "0 0" }}>{children}</AbsoluteFill>
    {overlay}
    <Lighting strength={light} />
  </AbsoluteFill>
);

export const W: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    {children}
  </svg>
);

// ------------------------------------------------------------------ kinetic caption
export type ShoutWord = { text: string; at: number };
/**
 * Big kinetic words that slam in on their beats. `lines` = rows of words.
 * Last word of the last line is highlighted in the brand blue.
 */
export const Shout: React.FC<{
  frame: number;
  x: number;
  y: number;
  lines: ShoutWord[][];
  size?: number;
  speaker?: string;
  hideAt?: number;
  rotate?: number;
}> = ({ frame, x, y, lines, size = 120, speaker, hideAt = Infinity, rotate = -3 }) => {
  const first = lines[0]?.[0]?.at ?? 0;
  if (frame < first - 1) return null;
  const out = frame > hideAt ? clamp01((frame - hideAt) / 6) : 0;
  if (out >= 1) return null;
  const cw = size * 0.66;
  const lh = size * 1.02;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - out }}>
      <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
        {speaker && (
          <g transform={`translate(0 ${-lh * 0.95}) scale(${popIn(frame, first, 400, 14)})`}>
            <rect x={-speaker.length * 11 - 26} y={-26} width={speaker.length * 22 + 52} height={44} rx={22} fill={INK} />
            <text y={6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} letterSpacing={3} fill={PAPER}>
              {speaker}
            </text>
          </g>
        )}
        {lines.map((line, li) => {
          const widths = line.map((w) => w.text.length * cw);
          const total = widths.reduce((a, b) => a + b, 0) + (line.length - 1) * size * 0.28;
          let cx = -total / 2;
          return line.map((w, wi) => {
            const ww = widths[wi];
            const mid = cx + ww / 2;
            cx += ww + size * 0.28;
            if (frame < w.at - 1) return null;
            const k = popIn(frame, w.at - 1, 520, 13);
            const s = 1 + (1 - k) * 0.9;
            const isLast = li === lines.length - 1 && wi === line.length - 1;
            const jitter = frame - w.at < 6 ? (rand(frame + wi) - 0.5) * 6 : 0;
            return (
              <g key={`${li}-${wi}`} transform={`translate(${mid + jitter} ${li * lh}) scale(${s}) rotate(${(rand(wi + li * 7) - 0.5) * 6})`} opacity={clamp01(k * 3)}>
                <text x={10} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={ACCENT} opacity={0.9}>
                  {w.text}
                </text>
                <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={isLast ? ACCENT : PAPER} stroke={INK} strokeWidth={size * 0.085} paintOrder="stroke" strokeLinejoin="round">
                  {w.text}
                </text>
              </g>
            );
          });
        })}
      </g>
    </svg>
  );
};

/** split a sentence into words timed on consecutive beat frames */
export const timeWords = (text: string, beats: number[]): ShoutWord[] => {
  const words = text.split(" ");
  return words.map((t, i) => ({ text: t, at: beats[Math.min(i, beats.length - 1)] }));
};

// ------------------------------------------------------------------ props
/** handle height 0 (down) … 1 (up) — down exactly on every beat, up on the off-beat */
export const pumpStroke = (frame: number) => Math.pow(Math.sin(Math.PI * beatPhase(frame)), 0.85);

/**
 * Floor balloon pump in body space (ground at 0) scaled by `s`, at (x, ground).
 * Returns the handle grip points (body space) for the character's hands via `grips`.
 */
export const pumpGrips = (h: number) => {
  const hy = -(150 + 64 * h);
  return { l: { x: -36, y: hy + 6 }, r: { x: 36, y: hy + 6 }, hy };
};

export const FloorPump: React.FC<{ x: number; ground: number; s: number; h: number; side: 1 | -1; balloonR: number; balloonFill: string; frame: number; attached?: boolean }> = ({
  x,
  ground,
  s,
  h,
  side,
  balloonR,
  balloonFill,
  frame,
  attached = true,
}) => {
  const { hy } = pumpGrips(h);
  const sw = STROKE / s;
  const nozzle = { x: side * 150, y: -210 };
  const r = balloonR;
  const wob = Math.sin(frame / 6) * 2;
  return (
    <g transform={`translate(${x} ${ground}) scale(${s})`}>
      {/* hose */}
      <path d={`M ${side * 16} -26 C ${side * 70} -10, ${side * 150} -40, ${nozzle.x} ${nozzle.y + 20}`} fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" />
      <path d={`M ${side * 16} -26 C ${side * 70} -10, ${side * 150} -40, ${nozzle.x} ${nozzle.y + 20}`} fill="none" stroke="#3A3F4A" strokeWidth={7} strokeLinecap="round" />
      <rect x={nozzle.x - 6} y={nozzle.y} width={12} height={24} rx={3} fill="#E9E2D3" stroke={INK} strokeWidth={sw * 0.7} />
      {/* foot plate + barrel */}
      <rect x={-52} y={-10} width={104} height={12} rx={5} fill="#2E3340" stroke={INK} strokeWidth={sw} />
      <rect x={-18} y={-150} width={36} height={142} rx={8} fill={ACCENT} stroke={INK} strokeWidth={sw} />
      <rect x={-12} y={-142} width={8} height={126} rx={4} fill="#FFFFFF" opacity={0.35} />
      <rect x={-21} y={-154} width={42} height={12} rx={4} fill="#2E3340" stroke={INK} strokeWidth={sw * 0.8} />
      {/* rod + T handle */}
      <rect x={-4} y={hy} width={8} height={-150 - hy} fill="#C9CED8" stroke={INK} strokeWidth={sw * 0.6} />
      <rect x={-48} y={hy - 9} width={96} height={18} rx={8} fill="#2E3340" stroke={INK} strokeWidth={sw * 0.9} />
      {/* balloon on the nozzle */}
      {attached && r > 2 && (
        <g transform={`translate(${nozzle.x} ${nozzle.y}) rotate(${side * 8 + wob})`}>
          <ellipse cx={0} cy={-(r * 1.12 + 6)} rx={r} ry={r * 1.12} fill={balloonFill} stroke={INK} strokeWidth={sw} />
          <path d={`M ${-r * 0.45} ${-(r * 1.12 + 6) - r * 0.45} q ${r * 0.15} ${-r * 0.3} ${r * 0.45} ${-r * 0.35}`} fill="none" stroke={PAPER} strokeWidth={7 / s} strokeLinecap="round" opacity={0.9} />
          <path d="M -6 -6 L 0 2 L 6 -6 Z" fill={balloonFill} stroke={INK} strokeWidth={sw * 0.6} />
        </g>
      )}
    </g>
  );
};

/** balloon held by a string (screen space) */
export const HeldBalloon: React.FC<{ x: number; y: number; r: number; fill: string; hand: { x: number; y: number }; frame: number; seed?: number }> = ({ x, y, r, fill, hand, frame, seed = 0 }) => {
  const sway = Math.sin(frame / 9 + seed) * 8;
  return (
    <g>
      <path d={`M ${x + sway} ${y + r * 1.15} C ${x + sway} ${y + r * 1.15 + 60}, ${hand.x} ${hand.y - 60}, ${hand.x} ${hand.y}`} fill="none" stroke={INK} strokeWidth={3} />
      <g transform={`translate(${x + sway} ${y}) rotate(${sway * 0.6})`}>
        <ellipse rx={r} ry={r * 1.12} fill={fill} stroke={INK} strokeWidth={STROKE} />
        <path d={`M ${-r * 0.45} ${-r * 0.45} q ${r * 0.15} ${-r * 0.3} ${r * 0.45} ${-r * 0.35}`} fill="none" stroke={PAPER} strokeWidth={7} strokeLinecap="round" />
        <path d={`M -7 ${r * 1.12 - 2} l 7 12 l 7 -12 Z`} fill={fill} stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
};

export const STICKY_COLORS = ["#FFE27A", "#BFE3FF", "#FFC9D6", "#C9F2C7", "#FFD9A8"];

export const Sticky: React.FC<{ x: number; y: number; text: string; color?: string; rot?: number; s?: number; opacity?: number }> = ({ x, y, text, color = "#FFE27A", rot = 0, s = 1, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    <rect x={-72} y={-66} width={150} height={146} fill="rgba(0,0,0,0.12)" />
    <rect x={-78} y={-74} width={150} height={146} fill={color} stroke={INK} strokeWidth={4} />
    <rect x={-30} y={-84} width={56} height={18} fill="rgba(255,255,255,0.65)" />
    <foreignObject x={-70} y={-64} width={134} height={126}>
      <div style={{ width: 134, height: 126, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 24, lineHeight: 1.1, color: INK }}>
        {text}
      </div>
    </foreignObject>
  </g>
);

/** music notes floating up (whistling innocently) */
export const Notes: React.FC<{ frame: number; at: number; x: number; y: number }> = ({ frame, at, x, y }) => {
  if (frame < at) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const t = ((frame - at + i * 9) % 30) / 30;
        return (
          <text key={i} x={x + i * 26 + Math.sin(t * 6 + i) * 10} y={y - t * 80} fontFamily={FONT} fontWeight={900} fontSize={42} fill={ACCENT} stroke={INK} strokeWidth={3} paintOrder="stroke" opacity={1 - t}>
            {i % 2 ? "♫" : "♪"}
          </text>
        );
      })}
    </g>
  );
};

export const beatsToFrames = (n: number) => Math.round(n * BEAT_FRAMES);

// ------------------------------------------------------------------ subtitles + chapter labels
/** cinematic subtitle for a spoken line: speaker chip + text, bottom centre */
export const Subtitle: React.FC<{ frame: number; at: number; frames: number; speaker: string; text: string }> = ({ frame, at, frames, speaker, text }) => {
  if (frame < at - 2 || frame > at + frames + 14) return null;
  const k = popIn(frame, at - 2, 300, 18);
  const out = clamp01((frame - at - frames - 6) / 8);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", opacity: clamp01(k * 2) * (1 - out), transform: `translateY(${(1 - k) * 20}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(12,18,32,0.82)", borderRadius: 18, padding: "14px 30px 14px 16px", fontFamily: FONT }}>
        <span style={{ background: ACCENT, color: PAPER, fontWeight: 800, fontSize: 24, letterSpacing: 3, padding: "6px 14px", borderRadius: 10, textTransform: "uppercase" }}>{speaker}</span>
        <span style={{ color: PAPER, fontWeight: 700, fontSize: 40 }}>{text}</span>
      </div>
    </div>
  );
};

/** small chapter label, top-left (who / where) */
export const Chapter: React.FC<{ frame: number; title: string; sub?: string; dark?: boolean }> = ({ frame, title, sub, dark }) => {
  const k = popIn(frame, 1, 220, 18);
  return (
    <div style={{ position: "absolute", left: 56, top: 48, fontFamily: FONT, opacity: clamp01(k * 2), transform: `translateX(${(1 - k) * -60}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 14, height: 54, background: ACCENT, borderRadius: 4 }} />
        <span style={{ fontWeight: 900, fontSize: 52, letterSpacing: 6, color: dark ? PAPER : INK }}>{title}</span>
      </div>
      {sub && <div style={{ marginLeft: 28, marginTop: 4, fontWeight: 700, fontSize: 24, letterSpacing: 8, color: dark ? "#B9C6DA" : "#5A6578" }}>{sub}</div>}
    </div>
  );
};
