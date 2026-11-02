// Timeline solver: turns config/beats.json + config/video.json into scene slots.
//
// Rules (from the brief):
//  * every scene cut lands on a downbeat
//  * the CEO's entrance lands on a quiet part / hard break
//  * the hero shot lands on the biggest drop (late in the video)
//  * order is fixed; target lengths are only a guide
import videoJson from "../../config/video.json";
import {
  BEATS,
  BEAT_FRAMES,
  BEAT_FRAMES_INT,
  DOWNBEAT_FRAMES,
  DURATION_IN_FRAMES,
  FPS,
  energyAt,
} from "./beats";

export type SceneId = "playtime" | "ceo" | "huddle" | "cfo" | "hardwork" | "events" | "finale";

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
  /** named anchor frames relative to the scene start (e.g. hero, logo, door) */
  anchors: Record<string, number>;
};

export type Plan = {
  scenes: SceneSlot[];
  anchors: { ceoEnter: number; heroDrop: number; logo: number; finaleStart: number };
  reasons: string[];
};

type SceneCfg = { id: SceneId; title: string; target: number; minSeconds: number };
export const VIDEO = videoJson as unknown as {
  scenes: SceneCfg[];
  anchors: {
    ceoTarget: number;
    ceoWindow: [number, number];
    heroWindowFraction: [number, number];
    finaleLeadIn: number;
    logoSeconds: number;
  };
  events: { name: string; years?: string[] }[];
  award: string;
  eventCount: number;
  lines: { ceo: string; budgetSign: string; finale: string };
  brand: { name: string; logo: string | null; accent: string; ink: string; paper: string; gold: string };
  audio: { musicVolume: number; sfx: boolean; sfxVolume: number };
};

const D = DURATION_IN_FRAMES;
const BAR = BEAT_FRAMES * 4;
const sec = (s: number) => Math.round(s * FPS);

/** number of stamp hits the Events scene needs (one per beat) */
export const eventStampCount = () =>
  VIDEO.events.reduce((n, e) => n + (e.years?.length ?? 1), 0);

/** beats the Events scene needs: one stamp per beat, badge on the next beat, counter lands on the next downbeat, short hold */
const eventsBeatsNeeded = () => Math.ceil((eventStampCount() + 3) / 4) * 4 + 2;

const nearest = (arr: number[], target: number, lo = -Infinity, hi = Infinity) => {
  let best: number | null = null;
  for (const f of arr) {
    if (f < lo || f > hi) continue;
    if (best === null || Math.abs(f - target) < Math.abs(best - target)) best = f;
  }
  return best;
};

export const solvePlan = (): Plan => {
  const reasons: string[] = [];
  const downs = DOWNBEAT_FRAMES.filter((f) => f > 0 && f < D);
  const cfg = VIDEO.anchors;

  // ---- 1. hero shot = biggest drop late in the video -------------------------
  const [h0, h1] = cfg.heroWindowFraction;
  const heroLo = D * h0;
  const heroHi = Math.min(D * h1, D - sec(2.5));
  const dropCands = BEATS.drops.filter((d) => d.f >= heroLo && d.f <= heroHi);
  let hero: number;
  if (dropCands.length) {
    const best = dropCands.reduce((a, b) => (b.strength > a.strength ? b : a));
    hero = nearest(downs, best.f) ?? best.f;
    reasons.push(`hero shot on biggest drop @ ${(best.t).toFixed(2)}s (strength ${best.strength})`);
  } else {
    // fallback: downbeat with the largest energy rise in the window
    let bestF = nearest(downs, D * 0.85) ?? Math.round(D * 0.85);
    let bestRise = -Infinity;
    for (const f of downs) {
      if (f < heroLo || f > heroHi) continue;
      const rise = energyAt(f + BAR) - energyAt(f - BAR);
      if (rise > bestRise) {
        bestRise = rise;
        bestF = f;
      }
    }
    hero = bestF;
    reasons.push(`no drop found late in the track — hero on biggest energy rise @ ${(hero / FPS).toFixed(2)}s`);
  }

  // ---- 2. logo near the end ----------------------------------------------------
  const logo =
    nearest(downs, D - sec(cfg.logoSeconds), hero + sec(2.5), D - sec(2.2)) ??
    Math.min(D - sec(2.5), Math.max(hero + sec(2), D - sec(cfg.logoSeconds)));

  // ---- 3. finale starts a few bars before the hero drop ----------------------
  const finaleStart =
    nearest(downs, hero - sec(cfg.finaleLeadIn), hero - sec(9), hero - sec(3)) ??
    Math.max(0, hero - sec(4));

  // ---- 4. CEO entrance on a hard break / quiet part --------------------------
  const [c0, c1] = cfg.ceoWindow;
  const gauss = (x: number, mu: number, s: number) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
  type Cand = { f: number; score: number; why: string };
  const cands: Cand[] = [];
  for (const b of BEATS.breaks)
    if (b.t >= c0 && b.t <= c1) cands.push({ f: b.f, score: Math.min(1, b.strength * 2) * gauss(b.t, cfg.ceoTarget, 4), why: "hard break" });
  for (const q of BEATS.quiet)
    if (q.start >= c0 && q.start <= c1) cands.push({ f: q.f, score: 0.6 * gauss(q.start, cfg.ceoTarget, 4), why: "quiet part" });
  let ceo: number;
  const latestCeo = finaleStart - sec(25);
  const okCands = cands.filter((c) => c.f < latestCeo);
  if (okCands.length) {
    const best = okCands.reduce((a, b) => (b.score > a.score ? b : a));
    ceo = nearest(downs, best.f) ?? best.f;
    reasons.push(`CEO enters on ${best.why} @ ${(ceo / FPS).toFixed(2)}s`);
  } else {
    ceo = nearest(downs, sec(cfg.ceoTarget), sec(3), latestCeo) ?? sec(cfg.ceoTarget);
    reasons.push(`no break/quiet part early in the track — CEO on downbeat @ ${(ceo / FPS).toFixed(2)}s`);
  }

  // ---- 5. middle scenes: brute-force the downbeats that best fit the targets --
  const mid = VIDEO.scenes.filter((s) => ["ceo", "huddle", "cfo", "hardwork", "events"].includes(s.id));
  const mins = mid.map((s) => sec(s.minSeconds));
  const evIdx = mid.findIndex((s) => s.id === "events");
  mins[evIdx] = Math.max(mins[evIdx], Math.round(eventsBeatsNeeded() * BEAT_FRAMES));
  const avail = finaleStart - ceo;
  const tgtSum = mid.reduce((a, s) => a + s.target, 0);
  const tgts = mid.map((s) => (s.target / tgtSum) * avail);
  const M = downs.filter((f) => f > ceo && f < finaleStart);
  let best: { cost: number; cuts: number[] } | null = null;
  const n = M.length;
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      for (let c = b + 1; c < n; c++)
        for (let d = c + 1; d < n; d++) {
          const cuts = [ceo, M[a], M[b], M[c], M[d], finaleStart];
          let cost = 0;
          for (let i = 0; i < 5; i++) {
            const dur = cuts[i + 1] - cuts[i];
            cost += ((dur - tgts[i]) / FPS) ** 2 / mid[i].target;
            // minimums are soft by half a bar: cuts can only move in whole bars
            if (dur < mins[i] - BAR * 0.5) cost += 1000 + (mins[i] - dur);
          }
          if (!best || cost < best.cost) best = { cost, cuts };
        }
  let cuts: number[];
  if (best) {
    cuts = best.cuts;
    if (best.cost >= 1000) reasons.push("warning: track too short for every scene's minimum — some scenes are squeezed");
  } else {
    // not enough downbeats (very slow song): split evenly on beats
    cuts = [ceo];
    for (let i = 1; i < 5; i++) cuts.push(ceo + Math.round((avail * mid.slice(0, i).reduce((x, s) => x + s.target, 0)) / tgtSum));
    cuts.push(finaleStart);
    reasons.push("warning: not enough downbeats — middle cuts placed on nearest beats");
  }

  const bounds = [0, ...cuts, D];
  const order: SceneId[] = ["playtime", "ceo", "huddle", "cfo", "hardwork", "events", "finale"];
  const scenes: SceneSlot[] = order.map((id, i) => {
    const from = bounds[i];
    const to = bounds[i + 1];
    const cfgS = VIDEO.scenes.find((s) => s.id === id)!;
    const rel = (arr: number[]) => arr.filter((f) => f >= from && f < to).map((f) => f - from);
    const anchors: Record<string, number> = {};
    if (id === "finale") {
      anchors.hero = hero - from;
      anchors.logo = logo - from;
    }
    return {
      id,
      title: cfgS.title,
      from,
      durationInFrames: to - from,
      beats: rel(BEAT_FRAMES_INT),
      downbeats: rel(DOWNBEAT_FRAMES),
      anchors,
    };
  });
  return { scenes, anchors: { ceoEnter: ceo, heroDrop: hero, logo, finaleStart }, reasons };
};

export const PLAN = solvePlan();

// ---------------------------------------------------------------- cue helpers
/** n-th beat of a scene (relative frame); negative n counts from the end */
export const beatOf = (slot: SceneSlot, n: number): number => {
  const b = slot.beats;
  if (!b.length) return 0;
  if (n < 0) return b[Math.max(0, b.length + n)];
  if (n < b.length) return b[n];
  // past the end: extrapolate on the grid
  return Math.round(b[b.length - 1] + (n - b.length + 1) * BEAT_FRAMES);
};

/** beat closest to a fraction of the scene (0..1) */
export const beatAtFraction = (slot: SceneSlot, frac: number): number => {
  const target = frac * slot.durationInFrames;
  return slot.beats.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a), slot.beats[0] ?? 0);
};

/** index of the beat closest to a fraction of the scene */
export const beatIndexAtFraction = (slot: SceneSlot, frac: number): number => {
  const f = beatAtFraction(slot, frac);
  return Math.max(0, slot.beats.indexOf(f));
};

/** first beat at or after a relative frame */
export const beatAtOrAfter = (slot: SceneSlot, frame: number): number =>
  slot.beats.find((b) => b >= frame - 0.5) ?? Math.round(frame);

/** first downbeat at or after a relative frame */
export const downbeatAtOrAfter = (slot: SceneSlot, frame: number): number =>
  slot.downbeats.find((b) => b >= frame - 0.5) ?? beatAtOrAfter(slot, frame);

export const BAR_FRAMES = BAR;
