// Scene 12 — EVENTS, fast: it should feel like a LOT, not be read.
// The drop hits: 45 event tiles flash onto a full-screen wall at 8 per beat while the camera pulls back and a
// counter races 1 → 45; on the next downbeat "45+ EVENTS" slams in, the Guinness World Record lands, and rows of
// event names race past behind them until the finale.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
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

/** the Guinness World Records title Ma Hawa holds — a framed record certificate that slams in, the figure counting up */
const RecordCard: React.FC<{ frame: number; at: number; x: number; y: number }> = ({ frame, at, x, y }) => {
  if (frame < at - 4) return null;
  const R = VIDEO.record;
  const k = frame < at ? lin(frame, [at - 4, at], [2.6, 1], easeIn) : 1 + (1 - popIn(frame, at, 400, 10)) * 0.25;
  const count = R.value * (1 - Math.pow(1 - clamp01((frame - at) / 22), 3));
  const shine = ((frame - at) * 26) % 1400;
  return (
    <div style={{ position: "absolute", left: x - 330, top: y - 300, width: 660, height: 600, transform: `scale(${k}) rotate(-3deg)`, opacity: clamp01((frame - at + 4) / 4) }}>
      {/* gold frame + certificate */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: `linear-gradient(135deg, #F6D77A, ${GOLD} 45%, #B98A1E)`, border: `${STROKE}px solid ${INK}`, boxShadow: `14px 14px 0 ${INK}` }} />
      <div style={{ position: "absolute", inset: 22, borderRadius: 14, background: "#FFFDF6", border: `4px solid ${INK}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: shine - 300, width: 120, height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)", transform: "skewX(-20deg)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, background: "#1A2A6C", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, paddingRight: 80, boxSizing: "border-box" }}>
          <svg width={46} height={46} viewBox="-50 -50 100 100">
            <StarShape r={44} fill={GOLD} sw={6} />
          </svg>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 27, letterSpacing: 2, color: PAPER, whiteSpace: "nowrap" }}>{R.org}</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 106, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 8, color: "#1A2A6C" }}>OFFICIAL WORLD RECORD</div>
        <div style={{ position: "absolute", left: 34, right: 34, top: 146, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 31, lineHeight: 1.12, color: INK, textTransform: "uppercase" }}>{R.title}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 292, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 132, lineHeight: 1, color: ACCENT, WebkitTextStroke: `4px ${INK}`, textShadow: `8px 8px 0 ${INK}` }}>
          {count.toFixed(2)}
          <span style={{ fontSize: 72, marginLeft: 10 }}>{R.unit}</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 24, color: INK }}>{R.where}</div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: "#6A7386" }}>{R.date.toUpperCase()}</div>
      </div>
      {/* "WORLD RECORD" seal */}
      <div style={{ position: "absolute", right: -58, top: -62, width: 140, height: 140, borderRadius: 70, background: "#C8202F", border: `${STROKE}px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", transform: `rotate(${14 + Math.sin(frame / 8) * 3}deg) scale(${popIn(frame, at + 6, 500, 10)})`, fontFamily: FONT, fontWeight: 900, fontSize: 24, lineHeight: 1.05, color: PAPER, boxShadow: `6px 6px 0 ${INK}` }}>
        WORLD
        <br />
        RECORD
        <br />
        HOLDER
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
        <RecordCard frame={frame} at={c.badge} x={badgeX} y={560} />
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
