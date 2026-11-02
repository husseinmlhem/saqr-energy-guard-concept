// Scene 12 — EVENTS, fast: it should feel like a LOT, not be read.
// The drop hits: 45 event tiles flash onto a full-screen wall at 8 per beat while the camera pulls back and a
// counter races 1 → 45; on the next downbeat "45+ EVENTS" slams in, the Guinness World Record lands, and rows of
// event names race past behind them until the finale.
import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { LogoSvg } from "../brand/Logo";
import { clamp01, easeIn, easeOut, lin, popIn, rand, shake } from "../fx/anim";
import { LightRays, StarShape, Svg } from "../fx/Fx";
import { BEAT_FRAMES, beatPulse } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { ACCENT, FONT, GOLD, INK, PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";

const COLS = 9;
const ROWS = 5;
const TW = 200;
const TH = 200;
const GAP = 12;
const X0 = (1920 - (COLS * TW + (COLS - 1) * GAP)) / 2;
const Y0 = (1080 - (ROWS * TH + (ROWS - 1) * GAP)) / 2;
const PER_BEAT = 8; // tiles per beat (32nd notes)

/** every event name we know (Gulfood once per year), cycled over the 45 tiles */
const LABELS: string[] = (VIDEO.events as { name: string; years?: string[] }[]).flatMap((e) => (e.years?.length ? e.years.map((y) => `${e.name} ${y}`) : [e.name]));
const STYLES = [
  { bg: PAPER, fg: INK, line: ACCENT },
  { bg: INK, fg: PAPER, line: ACCENT },
  { bg: ACCENT, fg: PAPER, line: PAPER },
  { bg: "#EAF3FB", fg: INK, line: ACCENT },
  { bg: "#1F3B66", fg: PAPER, line: ACCENT },
];

type Tile = { i: number; col: number; row: number; label: string; style: number; logo: boolean };
const TILES: Tile[] = (() => {
  // scattered fill order (seeded), so the wall lights up all over instead of row by row
  const order = Array.from({ length: COLS * ROWS }, (_, i) => i).sort((p, q) => rand(p * 13 + 7) - rand(q * 13 + 7));
  return order.map((cell, k) => ({ i: k, col: cell % COLS, row: Math.floor(cell / COLS), label: LABELS[k % LABELS.length], style: Math.floor(rand(k * 5 + 1) * STYLES.length), logo: k % 9 === 4 }));
})();

export const eventsCues = (slot: SceneSlot) => {
  const n = TILES.length;
  // tile k lands on the k-th 32nd note after the drop (8 per beat, locked to the beat grid)
  const hits = TILES.map((_, k) => beatOf(slot, Math.floor(k / PER_BEAT)) + Math.round(((k % PER_BEAT) * BEAT_FRAMES) / PER_BEAT));
  const wallBeats = Math.ceil(n / PER_BEAT);
  const slam = slot.downbeats.find((d) => d >= beatOf(slot, wallBeats) - 0.5) ?? beatOf(slot, wallBeats + 1); // "45+ EVENTS"
  const badge = slot.beats.find((b) => b > slam) ?? slam + Math.round(BEAT_FRAMES);
  const cues: Cues = {
    marks: [
      { f: hits[0], name: "wall blitz: 45 tiles, 8 per beat" },
      { f: hits[n - 1], name: "wall complete" },
      { f: slam, name: `${VIDEO.eventCount}+ EVENTS` },
      { f: badge, name: "GUINNESS WORLD RECORD" },
    ],
    sfx: [
      ...Array.from({ length: wallBeats }, (_, b) => ({ f: beatOf(slot, b), name: "tick" as const, volume: 0.35 + (b / wallBeats) * 0.4 })),
      { f: hits[0], name: "whoosh" as const, volume: 0.6 },
      { f: slam, name: "slam" as const, volume: 0.9 },
      { f: slam, name: "stamp" as const, volume: 0.9 },
      { f: badge, name: "sparkle" as const, volume: 0.9 },
    ],
  };
  const bAfter = (n: number) => slot.beats.filter((b) => b >= slam)[n] ?? slam + Math.round(n * BEAT_FRAMES);
  cues.voice = [
    { f: slam, id: "amr_events", sub: true },
    { f: bAfter(3), id: "hussein_guinness", sub: true },
  ];
  return { hits, slam, badge, cues };
};

const fit = (label: string) => (label.length <= 10 ? 34 : label.length <= 18 ? 28 : label.length <= 30 ? 23 : 18);

const TileBox: React.FC<{ t: Tile; frame: number; hit: number }> = ({ t, frame, hit }) => {
  if (frame < hit - 1) return null;
  const k = popIn(frame, hit - 1, 700, 16);
  const st = STYLES[t.style];
  const x = X0 + t.col * (TW + GAP);
  const y = Y0 + t.row * (TH + GAP);
  const flash = Math.exp(-(frame - hit) / 2);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: TW,
        height: TH,
        transform: `scale(${0.2 + 0.8 * k}) rotate(${(1 - clamp01(k)) * (rand(t.i) - 0.5) * 40}deg)`,
        background: st.bg,
        border: `${STROKE}px solid ${INK}`,
        borderRadius: 14,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: fit(t.label),
        lineHeight: 1.05,
        color: st.fg,
        textTransform: "uppercase",
        boxShadow: `inset 0 0 0 ${4 + flash * 40}px ${flash > 0.05 ? PAPER : "transparent"}`,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 14, right: 14, bottom: 14, height: 5, borderRadius: 3, background: st.line }} />
      {t.logo ? (
        <svg width={150} height={150 / 3.4} style={{ overflow: "visible" }}>
          <LogoSvg width={150} color={st.fg} />
        </svg>
      ) : (
        t.label
      )}
    </div>
  );
};

/** rows of event names racing past (after the slam) */
const Ticker: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  const t = frame - from;
  if (t < 0) return null;
  const rowsY = [70, 230, 390, 550, 710, 870, 1030];
  const text = LABELS.map((l) => l.toUpperCase()).join("   •   ");
  return (
    <AbsoluteFill style={{ opacity: clamp01(t / 4) * 0.9 }}>
      {rowsY.map((y, r) => {
        const dir = r % 2 ? 1 : -1;
        const speed = 34 + (r % 3) * 12;
        const off = ((t * speed + r * 900) % 4200) * dir;
        return (
          <div
            key={r}
            style={{
              position: "absolute",
              top: y - 50,
              left: dir > 0 ? -4200 + off : off,
              whiteSpace: "nowrap",
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 84,
              letterSpacing: 4,
              color: "transparent",
              WebkitTextStroke: `3px ${r % 2 ? ACCENT : "#C9D8EA"}`,
            }}
          >
            {text}   •   {text}   •   {text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** "we hold a Guinness World Record" — no reading needed: a big seal (or the official logo, if set) + RECORD HOLDER */
const RecordCard: React.FC<{ frame: number; at: number; x: number; y: number }> = ({ frame, at, x, y }) => {
  if (frame < at - 4) return null;
  const R = VIDEO.record;
  const k = frame < at ? lin(frame, [at - 4, at], [2.6, 1], easeIn) : 1 + (1 - popIn(frame, at, 400, 10)) * 0.25;
  const ribbon = popIn(frame, at + 5, 420, 12);
  const spin = (frame - at) * 0.6;
  return (
    <div style={{ position: "absolute", left: x - 300, top: y - 300, width: 600, height: 600, transform: `scale(${k}) rotate(-4deg)`, opacity: clamp01((frame - at + 4) / 4) }}>
      <svg width={600} height={600} viewBox="-300 -300 600 600" style={{ position: "absolute", overflow: "visible" }}>
        <path
          d={Array.from({ length: 56 }, (_, i) => {
            const a = (i / 56) * Math.PI * 2 + (spin * Math.PI) / 180;
            const r = i % 2 ? 252 : 272;
            return `${i ? "L" : "M"} ${Math.cos(a) * r} ${Math.sin(a) * r}`;
          }).join(" ") + " Z"}
          fill={GOLD}
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin="round"
        />
        <circle r={232} fill={R.logo ? PAPER : "#1A2A6C"} stroke={INK} strokeWidth={STROKE} />
        <circle r={214} fill="none" stroke={GOLD} strokeWidth={5} strokeDasharray="12 10" />
        {!R.logo && (
          <g>
            <g transform="translate(0 -88)">
              <StarShape r={70} fill={GOLD} sw={STROKE} />
            </g>
            <text y={44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} letterSpacing={2} fill={PAPER}>
              GUINNESS
            </text>
            <text y={100} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} letterSpacing={5} fill={GOLD}>
              WORLD RECORDS
            </text>
          </g>
        )}
      </svg>
      {R.logo && <Img src={staticFile(R.logo)} style={{ position: "absolute", left: 120, top: 110, width: 360, height: 320, objectFit: "contain" }} />}
      {/* RECORD HOLDER ribbon */}
      <div style={{ position: "absolute", left: 30, right: 30, top: 430, height: 96, transform: `scale(${ribbon}) rotate(2deg)`, background: "#C8202F", border: `${STROKE}px solid ${INK}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 52, letterSpacing: 6, color: PAPER, boxShadow: `8px 8px 0 ${INK}` }}>
        RECORD HOLDER
      </div>
    </div>
  );
};

export const S12Events: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => eventsCues(slot), [slot]);
  const n = TILES.length;
  const done = c.hits.filter((h) => frame >= h).length;
  const wallEnd = c.hits[n - 1];
  // camera: start tight on the first tiles, pull all the way back as the wall fills
  const z = lin(frame, [0, wallEnd + 4], [2.3, 1.0], easeOut);
  const first = TILES[0];
  const fx = X0 + first.col * (TW + GAP) + TW / 2;
  const fy = Y0 + first.row * (TH + GAP) + TH / 2;
  const pull = lin(frame, [0, wallEnd + 4], [0, 1], easeOut);
  const cx = fx + (960 - fx) * pull;
  const cy = fy + (540 - fy) * pull;
  const rot = lin(frame, [0, wallEnd], [-4, 0], easeOut);
  const kick = shake(frame, [c.slam, c.badge], 18);
  const dim = lin(frame, [c.slam - 2, c.slam + 6], [0, 1], easeOut);
  const plus = popIn(frame, c.slam, 500, 9);
  const pulse = beatPulse(frame, 6);
  const landed = frame >= c.slam;
  const badgeX = 560;

  return (
    <AbsoluteFill style={{ background: "#EAF3FB", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${kick.x}px, ${kick.y}px)` }}>
        {/* the wall */}
        <AbsoluteFill
          style={{
            transformOrigin: "0 0",
            transform: `translate(960px, 540px) rotate(${rot}deg) scale(${z * (1 - dim * 0.1)}) translate(${-cx}px, ${-cy}px)`,
            opacity: 1 - dim * 0.82,
            filter: dim > 0.02 ? `blur(${dim * 5}px)` : undefined,
          }}
        >
          {TILES.map((t, k) => (
            <TileBox key={k} t={t} frame={frame} hit={c.hits[k]} />
          ))}
        </AbsoluteFill>
        <Ticker frame={frame} from={c.slam} />
        {/* running counter while the wall fills */}
        {frame >= c.hits[0] && !landed && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "rgba(17,17,17,0.82)", borderRadius: 40, padding: "6px 48px", fontFamily: FONT, fontWeight: 900, fontSize: 190, lineHeight: 1.1, color: PAPER, transform: `scale(${1 + Math.exp(-((frame - c.hits[Math.max(0, done - 1)]) / 2)) * 0.06})` }}>
              {done}
            </div>
          </AbsoluteFill>
        )}
        {landed && (
          <Svg>
            <LightRays frame={frame} x={badgeX} y={520} intensity={0.5 * clamp01((frame - c.badge + 4) / 6)} speed={0.5} />
          </Svg>
        )}
        <RecordCard frame={frame} at={c.badge} x={badgeX} y={520} />
        {landed && (
          <div
            style={{
              position: "absolute",
              left: 1000,
              top: 250,
              width: 760,
              textAlign: "center",
              fontFamily: FONT,
              color: INK,
              transform: `scale(${1 + (1 - plus) * 0.6 + pulse * 0.03})`,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 320, lineHeight: 1, letterSpacing: -6, WebkitTextStroke: `${STROKE}px ${INK}`, color: PAPER, textShadow: `14px 14px 0 ${ACCENT}` }}>
              {VIDEO.eventCount}
              <span style={{ color: ACCENT }}>+</span>
            </div>
            <div style={{ fontWeight: 900, fontSize: 104, letterSpacing: 12, marginTop: 6 }}>EVENTS</div>
          </div>
        )}
        {landed && (
          <Svg>
            {Array.from({ length: 40 }, (_, i) => {
              const t = frame - c.slam;
              const x = 960 + (rand(i) - 0.5) * 1900 + Math.sin(t / 6 + i) * 30;
              const y = -40 + t * (11 + rand(i * 3) * 10) - rand(i * 5) * 200;
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
            {["#FF5F57", "#FEBC2E", "#28C840"].map((col) => (
              <span key={col} style={{ width: 18, height: 18, borderRadius: 9, background: col, display: "inline-block" }} />
            ))}
            <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 24, color: "#9AA3B2", marginLeft: 20 }}>events_wall_final.mp4</span>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
