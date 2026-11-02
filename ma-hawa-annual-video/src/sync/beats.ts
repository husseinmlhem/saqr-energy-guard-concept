// Beat helpers: everything that moves "to the music" reads from here.
import beatsJson from "../../config/beats.json";

export type Beat = {
  t: number;
  f: number;
  bar: number;
  beat: number;
  downbeat: boolean;
  energy: number;
  inferred: boolean;
};

type Marker = { t: number; f: number; strength: number };

export type BeatsData = {
  fps: number;
  audio: {
    file: string;
    trackDuration: number;
    segmentStart: number;
    segmentEnd: number;
    duration: number;
    durationInFrames: number;
    fadeIn: number;
    fadeOut: number;
  };
  tempo: { bpm: number; beatPeriod: number; beatsPerBar: number };
  beats: Beat[];
  bars: { index: number; t: number; f: number; energy: number }[];
  drops: Marker[];
  biggestDrop: Marker | null;
  breaks: Marker[];
  quiet: { start: number; end: number; f: number }[];
  peaks: { t: number; f: number; prominence: number }[];
  energy: number[];
};

export const BEATS = beatsJson as unknown as BeatsData;
export const FPS = BEATS.fps;
export const DURATION_IN_FRAMES = BEATS.audio.durationInFrames;
export const BPM = BEATS.tempo.bpm;
/** frames per beat (float) */
export const BEAT_FRAMES = BEATS.tempo.beatPeriod * FPS;

/** exact (fractional) frame of every beat — rounding happens only when a cue is scheduled */
export const BEAT_TIMES_F: number[] = BEATS.beats.map((b) => b.t * FPS);
export const BEAT_FRAMES_INT: number[] = BEATS.beats.map((b) => b.f);
export const DOWNBEAT_FRAMES: number[] = BEATS.beats.filter((b) => b.downbeat).map((b) => b.f);

/** index of the last beat at or before frame (−1 before the first beat) */
export const beatIndexAt = (frame: number): number => {
  let lo = 0;
  let hi = BEAT_TIMES_F.length - 1;
  if (frame < BEAT_TIMES_F[0]) return -1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (BEAT_TIMES_F[mid] <= frame + 1e-6) lo = mid;
    else hi = mid - 1;
  }
  return lo;
};

/** 0..1 progress through the current beat (0 = exactly on the beat) */
export const beatPhase = (frame: number): number => {
  const i = beatIndexAt(frame);
  if (i < 0) {
    const p = (frame - (BEAT_TIMES_F[0] - BEAT_FRAMES)) / BEAT_FRAMES;
    return ((p % 1) + 1) % 1;
  }
  const a = BEAT_TIMES_F[i];
  const b = i + 1 < BEAT_TIMES_F.length ? BEAT_TIMES_F[i + 1] : a + BEAT_FRAMES;
  return Math.min(1, Math.max(0, (frame - a) / (b - a)));
};

/** continuous beat counter (e.g. 12.25 = a quarter into beat 12) — drives looping idle motion */
export const beatClock = (frame: number): number => {
  const i = beatIndexAt(frame);
  return (i < 0 ? -1 : i) + beatPhase(frame);
};

/** 1 on the beat, decaying to 0 — use for squash / flashes */
export const beatPulse = (frame: number, decay = 5): number => Math.exp(-beatPhase(frame) * decay);

/** 0 on the beat, 1 half-way, 0 on the next beat — a hop between beats */
export const beatHop = (frame: number): number => Math.sin(Math.PI * beatPhase(frame));

export const energyAt = (frame: number): number => {
  const e = BEATS.energy;
  if (!e.length) return 0.5;
  const i = Math.max(0, Math.min(e.length - 1, Math.round(frame)));
  return e[i];
};

export const nearestBeatFrame = (frame: number): number => {
  let best = BEAT_FRAMES_INT[0];
  for (const f of BEAT_FRAMES_INT) if (Math.abs(f - frame) < Math.abs(best - frame)) best = f;
  return best;
};

export const nearestDownbeatFrame = (frame: number): number => {
  let best = DOWNBEAT_FRAMES[0] ?? 0;
  for (const f of DOWNBEAT_FRAMES) if (Math.abs(f - frame) < Math.abs(best - frame)) best = f;
  return best;
};

/** standard idle motion for a character, phase-shifted so a group doesn't move like one robot */
export const idleMotion = (frame: number, offset = 0, amount = 1) => {
  const clock = beatClock(frame);
  const pulse = beatPulse(frame, 6);
  return {
    /** vertical bob (px at scale 1) — dips on the beat */
    y: pulse * 7 * amount,
    /** squash on the beat */
    scaleY: 1 - 0.045 * pulse * amount,
    scaleX: 1 + 0.03 * pulse * amount,
    /** head bobble: one sway every two beats */
    headTilt: Math.sin(((clock + offset) / 2) * Math.PI * 2) * 5 * amount,
    /** arm sway */
    sway: Math.sin(((clock + offset) / 2) * Math.PI * 2) * amount,
  };
};
