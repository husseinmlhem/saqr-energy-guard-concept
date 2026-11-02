// Scene 6 — Events: one stamp per beat, then the gold award badge, then "45+ EVENTS".
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { clamp01, easeIn, easeInOut, easeOut, lin, popIn, rand, shake } from "../fx/anim";
import { LightRays, StarShape, Svg } from "../fx/Fx";
import { beatPulse } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { ACCENT, FONT, GOLD, INK, PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";

type Stamp = { label: string; x: number; y: number; w: number; h: number; big?: boolean; chip?: boolean };

const buildStamps = (): Stamp[] => {
  const out: Stamp[] = [];
  const rows: { name: string; years?: string[] }[] = VIDEO.events;
  const head = rows[0];
  const rest = rows.slice(1);
  // first event (with years) across the top: name + one chip per year
  if (head.years?.length) {
    out.push({ label: `${head.name} ${head.years[0]}`, x: 640, y: 120, w: 620, h: 120, big: true });
    head.years.slice(1).forEach((y, i) => out.push({ label: y, x: 1080 + i * 250, y: 120, w: 220, h: 120, chip: true, big: true }));
  } else rest.unshift(head);
  const cols = 2;
  const perCol = Math.ceil(rest.length / cols);
  rest.forEach((e, i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    out.push({ label: e.name, x: 500 + col * 920, y: 300 + row * 150, w: 840, h: 122 });
  });
  return out;
};

export const eventsCues = (slot: SceneSlot) => {
  const stamps = buildStamps();
  const hits = stamps.map((_, i) => beatOf(slot, i));
  // gold badge on the beat after the last stamp, counter starts a beat later
  // and lands "45+" on the next downbeat
  const S = stamps.length;
  const badge = beatOf(slot, S);
  const countStart = beatOf(slot, S + 1);
  const countEnd = slot.downbeats.find((d) => d >= beatOf(slot, S + 2) - 0.5) ?? beatOf(slot, Math.min(S + 2, slot.beats.length - 1));
  const countBeats = slot.beats.filter((b) => b > countStart && b < countEnd);
  const cues: Cues = {
    marks: [
      ...hits.map((f, i) => ({ f, name: `stamp: ${stamps[i].label}` })),
      { f: badge, name: "gold badge" },
      { f: countStart, name: "counter starts" },
      { f: countEnd, name: `${VIDEO.eventCount}+ EVENTS lands` },
    ],
    sfx: [
      ...hits.map((f) => ({ f, name: "stamp" as const, volume: 0.9 })),
      { f: badge, name: "slam", volume: 0.8 },
      { f: badge, name: "sparkle", volume: 0.9 },
      ...[countStart, ...countBeats].map((f) => ({ f, name: "tick" as const, volume: 0.6 })),
      { f: countEnd, name: "stamp", volume: 1 },
      { f: countEnd, name: "sparkle", volume: 0.7 },
    ],
  };
  return { stamps, hits, badge, countStart, countEnd, cues };
};

const fontFor = (s: Stamp) => {
  if (s.chip) return 54;
  if (s.big) return 50;
  const n = s.label.length;
  return n <= 16 ? 46 : n <= 28 ? 38 : n <= 40 ? 30 : 26;
};

const StampBox: React.FC<{ s: Stamp; i: number; frame: number; hit: number; dim: number }> = ({ s, i, frame, hit, dim }) => {
  const pre = 4;
  if (frame < hit - pre) return null;
  const t = clamp01((frame - (hit - pre)) / pre);
  const inScale = frame < hit ? 1.9 - 0.9 * easeIn(t) : 1;
  const settle = frame >= hit ? 1 + Math.exp(-(frame - hit) / 2.5) * 0.07 * Math.cos((frame - hit) * 1.4) : 1;
  const rot = (rand(i + 3) - 0.5) * 6;
  const fs = fontFor(s);
  return (
    <div
      style={{
        position: "absolute",
        left: s.x - s.w / 2,
        top: s.y - s.h / 2,
        width: s.w,
        height: s.h,
        transform: `rotate(${rot}deg) scale(${inScale * settle})`,
        opacity: (frame < hit ? t : 1) * (1 - dim * 0.85),
        border: `${STROKE}px solid ${INK}`,
        borderRadius: 16,
        background: s.chip ? ACCENT : PAPER,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        padding: "0 28px",
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: fs,
        lineHeight: 1.08,
        letterSpacing: 0.5,
        color: s.chip ? PAPER : INK,
        textTransform: "uppercase",
        boxShadow: frame >= hit ? `8px 8px 0 ${s.chip ? INK : ACCENT}` : "none",
      }}
    >
      <div style={{ position: "absolute", inset: 7, border: `3px dashed ${s.chip ? PAPER : ACCENT}`, borderRadius: 10 }} />
      {s.label}
    </div>
  );
};

/** ink splats around a stamp at the moment it lands */
const Splat: React.FC<{ s: Stamp; frame: number; hit: number; i: number }> = ({ s, frame, hit, i }) => {
  const t = frame - hit;
  if (t < 0 || t > 9) return null;
  const k = t / 9;
  return (
    <g opacity={1 - k}>
      {Array.from({ length: 8 }, (_, j) => {
        const side = j % 4;
        const x = side === 0 ? s.x - s.w / 2 - 10 - k * 40 : side === 1 ? s.x + s.w / 2 + 10 + k * 40 : s.x - s.w / 2 + rand(i * 9 + j) * s.w;
        const y = side < 2 ? s.y - s.h / 2 + rand(i * 7 + j) * s.h : side === 2 ? s.y - s.h / 2 - 10 - k * 30 : s.y + s.h / 2 + 10 + k * 30;
        return <circle key={j} cx={x} cy={y} r={5 + rand(j + i) * 6} fill={j % 2 ? ACCENT : INK} />;
      })}
    </g>
  );
};

/** the big rubber stamp that hops from slot to slot */
const StampTool: React.FC<{ frame: number; hits: number[]; stamps: Stamp[] }> = ({ frame, hits, stamps }) => {
  const last = hits[hits.length - 1];
  if (frame < hits[0] - 8 || frame > last + 14) return null;
  let x: number;
  let y: number;
  let lift: number;
  if (frame <= hits[0]) {
    const t = clamp01((frame - (hits[0] - 8)) / 8);
    x = stamps[0].x;
    y = stamps[0].y;
    lift = (1 - easeIn(t)) * 300;
  } else if (frame >= last) {
    const t = clamp01((frame - last) / 14);
    x = stamps[stamps.length - 1].x + t * 400;
    y = stamps[stamps.length - 1].y;
    lift = easeOut(t) * 900;
  } else {
    const i = hits.findIndex((h, k) => frame >= h && frame < hits[k + 1]);
    const t = (frame - hits[i]) / (hits[i + 1] - hits[i]);
    x = stamps[i].x + (stamps[i + 1].x - stamps[i].x) * easeInOut(t);
    y = stamps[i].y + (stamps[i + 1].y - stamps[i].y) * easeInOut(t);
    lift = Math.sin(Math.PI * Math.min(1, t * 1.08)) * 150 + 10;
  }
  return (
    <g transform={`translate(${x} ${y - lift})`}>
      <rect x={-26} y={-190} width={52} height={110} rx={22} fill={ACCENT} stroke={INK} strokeWidth={STROKE} />
      <rect x={-60} y={-90} width={120} height={36} rx={10} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
      <rect x={-110} y={-56} width={220} height={40} rx={8} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
    </g>
  );
};

const Badge: React.FC<{ frame: number; at: number; x: number; y: number }> = ({ frame, at, x, y }) => {
  if (frame < at - 4) return null;
  const k = frame < at ? lin(frame, [at - 4, at], [3, 1], easeIn) : 1 + (1 - popIn(frame, at, 400, 10)) * 0.25;
  const [top, bottom] = VIDEO.award.split(/\s+[—–-]\s+/);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `scale(${k})`, opacity: clamp01((frame - at + 4) / 4) }}>
      <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
        {/* ribbons */}
        <path d="M -110 120 L -150 330 L -100 300 L -60 345 L -30 140 Z" fill={ACCENT} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        <path d="M 110 120 L 150 330 L 100 300 L 60 345 L 30 140 Z" fill={ACCENT} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        {/* scalloped medal */}
        <path
          d={Array.from({ length: 48 }, (_, i) => {
            const a = (i / 48) * Math.PI * 2;
            const r = i % 2 ? 230 : 250;
            return `${i ? "L" : "M"} ${Math.cos(a) * r} ${Math.sin(a) * r}`;
          }).join(" ") + " Z"}
          fill={GOLD}
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin="round"
        />
        <circle r={200} fill="#F2CB55" stroke={INK} strokeWidth={STROKE} />
        <circle r={182} fill="none" stroke={PAPER} strokeWidth={4} strokeDasharray="10 10" />
        <g transform="translate(0 -110)">
          <StarShape r={44} fill={PAPER} sw={STROKE} />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: -170,
          top: -55,
          width: 340,
          textAlign: "center",
          fontFamily: FONT,
          color: INK,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 40, lineHeight: 1.05 }}>{top}</div>
        <div style={{ fontWeight: 800, fontSize: 32, lineHeight: 1.1, marginTop: 10 }}>{bottom ?? ""}</div>
      </div>
    </div>
  );
};

export const S12Events: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => eventsCues(slot), [slot]);
  const cam = shake(frame, c.hits, 7, 0.5);
  const cam2 = shake(frame, [c.badge, c.countEnd], 18);
  const wallDim = lin(frame, [c.badge - 3, c.badge + 6], [0, 1], easeOut);
  const wallScale = 1 - wallDim * 0.12;
  const toLeft = lin(frame, [c.countStart - 2, c.countStart + 8], [0, 1], easeInOut);
  const badgeX = 960 - toLeft * 420;
  const countT = lin(frame, [c.countStart, c.countEnd], [0, 1], (t) => 1 - Math.pow(1 - t, 2.2));
  const value = Math.round(VIDEO.eventCount * countT);
  const landed = frame >= c.countEnd;
  const plus = popIn(frame, c.countEnd, 500, 9);
  const pulse = beatPulse(frame, 6);

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <AbsoluteFill style={{ transform: `translate(${cam.x + cam2.x}px, ${cam.y + cam2.y}px)` }}>
        <AbsoluteFill style={{ transform: `scale(${wallScale})` }}>
          {c.stamps.map((s, i) => (
            <StampBox key={i} s={s} i={i} frame={frame} hit={c.hits[i]} dim={wallDim} />
          ))}
          <Svg>
            {c.stamps.map((s, i) => (
              <Splat key={i} s={s} frame={frame} hit={c.hits[i]} i={i} />
            ))}
            <StampTool frame={frame} hits={c.hits} stamps={c.stamps} />
          </Svg>
        </AbsoluteFill>
        {frame >= c.badge - 4 && (
          <Svg>
            <LightRays frame={frame} x={badgeX} y={500} intensity={0.55 * clamp01((frame - c.badge + 4) / 6)} speed={0.4} />
          </Svg>
        )}
        <Badge frame={frame} at={c.badge} x={badgeX} y={480} />
        {frame >= c.countStart && (
          <div
            style={{
              position: "absolute",
              left: 1060,
              top: 250,
              width: 700,
              textAlign: "center",
              fontFamily: FONT,
              color: INK,
              opacity: clamp01((frame - c.countStart) / 4),
              transform: `scale(${landed ? 1 + (1 - plus) * 0.25 + pulse * 0.03 : 1})`,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 300, lineHeight: 1, letterSpacing: -6, WebkitTextStroke: `${STROKE}px ${INK}`, color: PAPER, textShadow: `14px 14px 0 ${ACCENT}` }}>
              {value}
              <span style={{ display: "inline-block", transform: `scale(${plus})`, color: ACCENT }}>+</span>
            </div>
            <div style={{ fontWeight: 900, fontSize: 96, letterSpacing: 10, marginTop: 6 }}>EVENTS</div>
          </div>
        )}
        {landed && (
          <Svg>
            {Array.from({ length: 36 }, (_, i) => {
              const t = frame - c.countEnd;
              const x = 960 + (rand(i) - 0.5) * 1900 + Math.sin(t / 6 + i) * 30;
              const y = -40 + t * (9 + rand(i * 3) * 9) - rand(i * 5) * 200;
              return <rect key={i} x={x} y={y} width={18} height={30} rx={4} fill={i % 3 === 0 ? GOLD : ACCENT} stroke={INK} strokeWidth={3} transform={`rotate(${t * 9 + i * 40} ${x + 9} ${y + 15})`} />;
            })}
          </Svg>
        )}
      </AbsoluteFill>
      {/* we come out of Hussein's monitor: the screen bezel opens up and the app chrome slides away */}
      {frame < 14 && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <AbsoluteFill style={{ boxShadow: `inset 0 0 0 ${Math.max(0, 70 * (1 - frame / 12))}px #15161A`, borderRadius: 30 * (1 - frame / 12) }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: -frame * 8, height: 60, background: "#2D3038", display: "flex", alignItems: "center", gap: 12, paddingLeft: 24, opacity: 1 - frame / 14 }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <span key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c, display: "inline-block" }} />
            ))}
            <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 24, color: "#9AA3B2", marginLeft: 20 }}>events_wall_final.mp4</span>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
