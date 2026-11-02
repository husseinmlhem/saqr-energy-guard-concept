// Small animation helpers shared by all scenes.
import { Easing, interpolate, spring } from "remotion";
import { FPS } from "../sync/beats";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const lin = (frame: number, [a, b]: [number, number], [from, to]: [number, number], ease?: (t: number) => number) =>
  interpolate(frame, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export const easeOut = Easing.out(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);
export const backOut = Easing.out(Easing.back(2.2));

/** cartoon pop-in: 0 → overshoot → 1, starting exactly at `at` */
export const popIn = (frame: number, at: number, stiffness = 260, damping = 12) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { stiffness, damping, mass: 0.6 } });

/** squash & stretch impulse after a hit: returns [scaleX, scaleY] */
export const squash = (frame: number, at: number, amount = 0.25, decay = 0.22): [number, number] => {
  if (frame < at) return [1, 1];
  const t = frame - at;
  const k = Math.exp(-t * decay) * Math.cos(t * 0.9) * amount;
  return [1 + k, 1 - k];
};

/** camera shake after any of the hit frames */
export const shake = (frame: number, hits: number[], amp = 16, decay = 0.35) => {
  let x = 0;
  let y = 0;
  for (const h of hits) {
    if (frame < h) continue;
    const t = frame - h;
    const e = Math.exp(-t * decay) * amp;
    if (e < 0.3) continue;
    x += Math.sin(t * 2.7 + h) * e;
    y += Math.cos(t * 3.3 + h * 0.7) * e;
  }
  return { x, y };
};

/** 1 for `hold` frames after `at`, with quick fade in/out */
export const window01 = (frame: number, at: number, hold: number, fade = 4) =>
  frame < at || frame > at + hold + fade
    ? 0
    : Math.min(clamp01((frame - at) / fade), clamp01((at + hold + fade - frame) / fade));

/** position along a parabolic arc from a to b (t: 0..1) */
export const arc = (a: { x: number; y: number }, b: { x: number; y: number }, t: number, height = 200) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t - Math.sin(Math.PI * t) * height,
});

/** pseudo random, stable per seed */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
