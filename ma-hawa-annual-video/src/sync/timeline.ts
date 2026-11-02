// Timeline solver: turns config/beats.json + config/video.json into scene slots.
//
// Rules:
//  * every scene cut lands on a downbeat
//  * Michael's "STOP PLAYING!" scene starts on a hard break / quiet part
//  * the hero shot (in the finale) lands on the biggest drop
//  * order is fixed; target lengths are a guide — the rest is fitted by dynamic programming
import videoJson from "../../config/video.json";
import { BEATS, BEAT_FRAMES, BEAT_FRAMES_INT, DOWNBEAT_FRAMES, DURATION_IN_FRAMES, FPS, energyAt } from "./beats";

export type SceneId =
  | "title"
  | "play"
  | "stop"
  | "bonk"
  | "brainstorm"
  | "moreCreative"
  | "creative"
  | "pitch"
  | "cfo"
  | "amr"
  | "ali"
  | "hussein"
  | "events"
  | "finale";

export type SceneSlot = {
  id: SceneId;
  title: string;
  /** absolute start frame (always a downbeat, or 0) */
  from: number;
  durationInFrames: number;
  /** beat frames relative to the scene start, inside the scene */
  beats: number[];
  /** downbeat frames relative to the scene start */
  downbeats: number[];
  /** named anchor frames relative to the scene start (e.g. hero, logo) */
  anchors: Record<string, number>;
};

export type Plan = {
  scenes: SceneSlot[];
  anchors: { stop: number; drop: number; hero: number; logo: number; finaleStart: number };
  reasons: string[];
};

type SceneCfg = { id: SceneId; title: string; target: number; minSeconds: number; anchor?: "break" | "drop" };
export const VIDEO = videoJson as unknown as {
  scenes: SceneCfg[];
  anchors: {
    breakTarget: number;
    breakWindow: [number, number];
    dropWindowFraction: [number, number];
    heroWindowFraction: [number, number];
    finaleLeadIn: number;
    logoSeconds: number;
  };
  events: { name: string; years?: string[] }[];
  record: { org: string; title: string; value: number; unit: string; where: string; date: string; logo?: string | null };
  eventCount: number;
  lines: Record<string, string>;
  ideas: string[];
  pitchSlides: { title: string; kind: string }[];
  title: { main: string; sub: string };
  brand: { name: string; logo: string | null; accent: string; ink: string; paper: string; gold: string };
  audio: { musicVolume: number; sfx: boolean; sfxVolume: number; voiceVolume?: number; duckTo?: number };
};

const D = DURATION_IN_FRAMES;
const BAR = BEAT_FRAMES * 4;
const sec = (s: number) => Math.round(s * FPS);

/** number of stamp hits the Events scene needs (one per beat) */
export const eventStampCount = () => VIDEO.events.reduce((n, e) => n + (e.years?.length ?? 1), 0);
/** stamps, badge on the next beat, counter over the next two beats, a beat of hold */
const eventsBeatsNeeded = () => eventStampCount() + 3;

const nearest = (arr: number[], target: number, lo = -Infinity, hi = Infinity) => {
  let best: number | null = null;
  for (const f of arr) {
    if (f < lo || f > hi) continue;
    if (best === null || Math.abs(f - target) < Math.abs(best - target)) best = f;
  }
  return best;
};

/**
 * Place `scenes` back to back between `start` and `end`, every cut on a downbeat,
 * as close as possible to their (proportionally scaled) targets. Classic DP over downbeats.
 */
const fitSegment = (scenes: SceneCfg[], start: number, end: number, downs: number[], reasons: string[]): number[] => {
  const k = scenes.length;
  if (k === 1) return [start, end];
  const avail = end - start;
  const tgtSum = scenes.reduce((a, s) => a + s.target, 0);
  const tgt = scenes.map((s) => (s.target / tgtSum) * avail);
  const mins = scenes.map((s) => (s.id === "events" ? Math.max(sec(s.minSeconds), Math.round(eventsBeatsNeeded() * BEAT_FRAMES)) : sec(s.minSeconds)));
  const pts = [start, ...downs.filter((f) => f > start + 2 && f < end - 2), end];
  const n = pts.length;
  const cost = (i: number, a: number, b: number) => {
    const dur = pts[b] - pts[a];
    let c = ((dur - tgt[i]) / FPS) ** 2 / scenes[i].target;
    if (dur < mins[i] - BAR * 0.5) c += 1000 + (mins[i] - dur);
    return c;
  };
  // dp[i][j]: best cost with the first i scenes ending at pts[j]
  const dp = Array.from({ length: k + 1 }, () => new Array(n).fill(Infinity));
  const prev = Array.from({ length: k + 1 }, () => new Array(n).fill(-1));
  dp[0][0] = 0;
  for (let i = 1; i <= k; i++)
    for (let j = 1; j < n; j++) {
      if (i === k && j !== n - 1) continue;
      for (let a = 0; a < j; a++) {
        if (dp[i - 1][a] === Infinity) continue;
        const c = dp[i - 1][a] + cost(i - 1, a, j);
        if (c < dp[i][j]) {
          dp[i][j] = c;
          prev[i][j] = a;
        }
      }
    }
  if (dp[k][n - 1] === Infinity) {
    reasons.push("warning: not enough downbeats — scenes split evenly");
    return Array.from({ length: k + 1 }, (_, i) => Math.round(start + (avail * i) / k));
  }
  if (dp[k][n - 1] >= 1000) reasons.push(`warning: ${scenes.map((s) => s.id).join("/")} squeezed below their minimums`);
  const cuts: number[] = [];
  let j = n - 1;
  for (let i = k; i > 0; i--) {
    cuts.unshift(pts[j]);
    j = prev[i][j];
  }
  return [start, ...cuts];
};

export const solvePlan = (): Plan => {
  const reasons: string[] = [];
  const downs = DOWNBEAT_FRAMES.filter((f) => f > 0 && f < D);
  const cfg = VIDEO.anchors;
  const gauss = (x: number, mu: number, sd: number) => Math.exp(-((x - mu) ** 2) / (2 * sd * sd));

  // ---- 1. the events wall bursts out on the biggest drop
  const [d0, d1] = cfg.dropWindowFraction;
  const dropCands = BEATS.drops.filter((d) => d.f >= D * d0 && d.f <= D * d1);
  let drop: number;
  if (dropCands.length) {
    const best = dropCands.reduce((a, b) => (b.strength > a.strength ? b : a));
    drop = nearest(downs, best.f) ?? best.f;
    reasons.push(`events wall on the biggest drop @ ${best.t.toFixed(2)}s`);
  } else {
    let bestF = nearest(downs, D * 0.7) ?? Math.round(D * 0.7);
    let bestRise = -Infinity;
    for (const f of downs) {
      if (f < D * d0 || f > D * d1) continue;
      const rise = energyAt(f + BAR) - energyAt(f - BAR);
      if (rise > bestRise) {
        bestRise = rise;
        bestF = f;
      }
    }
    drop = bestF;
    reasons.push(`no clear drop — events on the biggest energy rise @ ${(drop / FPS).toFixed(2)}s`);
  }

  // ---- 2. hero shot: the beat coming back after the last break ("GREAT WORK, GUYS!" lives in the break)
  const [h0, h1] = cfg.heroWindowFraction;
  const lateBreaks = BEATS.breaks.filter((b) => b.f > drop + BAR * 4 && b.f >= D * h0 - BAR && b.f <= D * h1);
  let hero: number;
  if (lateBreaks.length) {
    const br = lateBreaks.reduce((a, b) => (b.strength > a.strength ? b : a));
    hero = downs.find((f) => f > br.f + 2) ?? Math.round(br.f + BAR);
    reasons.push(`hero shot where the beat returns after the break @ ${br.t.toFixed(2)}s`);
  } else {
    hero = nearest(downs, D - sec(10), drop + BAR * 4, D - sec(5)) ?? Math.round(D - sec(10));
    reasons.push(`no late break — hero on a downbeat @ ${(hero / FPS).toFixed(2)}s`);
  }
  const logo = nearest(downs, D - sec(cfg.logoSeconds), hero + sec(2.5), D - sec(2.2)) ?? Math.min(D - sec(2.5), hero + sec(4));
  const finaleStart = nearest(downs, hero - sec(cfg.finaleLeadIn), drop + BAR * 3, hero - sec(1.5)) ?? Math.max(drop + 1, hero - sec(5));

  // ---- 3. "STOP PLAYING!" on a hard break / quiet part
  const [b0, b1] = cfg.breakWindow;
  const cands: { f: number; score: number; why: string }[] = [];
  for (const b of BEATS.breaks) if (b.t >= b0 && b.t <= b1) cands.push({ f: b.f, score: Math.min(1, b.strength * 2) * gauss(b.t, cfg.breakTarget, 5), why: "hard break" });
  for (const q of BEATS.quiet) if (q.start >= b0 && q.start <= b1) cands.push({ f: q.f, score: 0.6 * gauss(q.start, cfg.breakTarget, 5), why: "quiet part" });
  let stop: number;
  if (cands.length) {
    const best = cands.reduce((a, b) => (b.score > a.score ? b : a));
    stop = nearest(downs, best.f) ?? best.f;
    reasons.push(`"STOP PLAYING!" on a ${best.why} @ ${(stop / FPS).toFixed(2)}s`);
  } else {
    stop = nearest(downs, sec(cfg.breakTarget)) ?? sec(cfg.breakTarget);
    reasons.push(`no break near ${cfg.breakTarget}s — "STOP PLAYING!" on a downbeat @ ${(stop / FPS).toFixed(2)}s`);
  }

  // ---- 4. fit everything else onto downbeats between the anchors
  const sc = VIDEO.scenes;
  const iStop = sc.findIndex((s) => s.anchor === "break");
  const iDrop = sc.findIndex((s) => s.anchor === "drop");
  const iFinale = sc.findIndex((s) => s.id === "finale");
  const a = fitSegment(sc.slice(0, iStop), 0, stop, downs, reasons);
  const b = fitSegment(sc.slice(iStop, iDrop), stop, drop, downs, reasons);
  const c = fitSegment(sc.slice(iDrop, iFinale), drop, finaleStart, downs, reasons);
  const bounds = [...a.slice(0, -1), ...b.slice(0, -1), ...c, D];

  const scenes: SceneSlot[] = sc.map((s, i) => {
    const from = bounds[i];
    const to = bounds[i + 1];
    const rel = (arr: number[]) => arr.filter((f) => f >= from && f < to).map((f) => f - from);
    const anchors: Record<string, number> = {};
    if (s.id === "finale") {
      anchors.hero = hero - from;
      anchors.logo = logo - from;
    }
    return { id: s.id, title: s.title, from, durationInFrames: to - from, beats: rel(BEAT_FRAMES_INT), downbeats: rel(DOWNBEAT_FRAMES), anchors };
  });
  return { scenes, anchors: { stop, drop, hero, logo, finaleStart }, reasons };
};

export const PLAN = solvePlan();

// ---------------------------------------------------------------- cue helpers
/** n-th beat of a scene (relative frame); negative n counts from the end */
export const beatOf = (slot: SceneSlot, n: number): number => {
  const b = slot.beats;
  if (!b.length) return 0;
  if (n < 0) return b[Math.max(0, b.length + n)];
  if (n < b.length) return b[n];
  return Math.round(b[b.length - 1] + (n - b.length + 1) * BEAT_FRAMES);
};

/** beat closest to a fraction of the scene (0..1) */
export const beatAtFraction = (slot: SceneSlot, frac: number): number => {
  const target = frac * slot.durationInFrames;
  return slot.beats.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a), slot.beats[0] ?? 0);
};

export const beatIndexAtFraction = (slot: SceneSlot, frac: number): number => Math.max(0, slot.beats.indexOf(beatAtFraction(slot, frac)));

/** first beat at or after a relative frame */
export const beatAtOrAfter = (slot: SceneSlot, frame: number): number => slot.beats.find((b) => b >= frame - 0.5) ?? Math.round(frame);

/** first downbeat at or after a relative frame */
export const downbeatAtOrAfter = (slot: SceneSlot, frame: number): number => slot.downbeats.find((b) => b >= frame - 0.5) ?? beatAtOrAfter(slot, frame);

export const BAR_FRAMES = BAR;
