// Tiny 2D stick-figure rig. Angles in degrees, screen space:
//   0 = pointing straight down, +90 = screen right, -90 = screen left, 180 = up.
// "l" limbs are on the screen-left, "r" limbs on the screen-right.
import { Easing, interpolate } from "remotion";

export type Limb = [number, number]; // [upper angle (absolute), lower angle (relative to upper)]

export type Pose = {
  lean: number; // torso tilt, + = right
  hipX: number;
  hipY: number; // + = down (crouch)
  lArm: Limb;
  rArm: Limb;
  lLeg: Limb;
  rLeg: Limb;
  head: number; // extra head tilt
};

export type Pt = { x: number; y: number };

export type BodyDims = {
  thigh: number;
  shin: number;
  torso: number;
  upperArm: number;
  forearm: number;
  shoulderHalf: number; // arms attach this far from the spine
  hipHalf: number; // legs attach this far from the spine
};

export const DIMS: Record<string, BodyDims> = {
  leader: { thigh: 54, shin: 52, torso: 104, upperArm: 48, forearm: 46, shoulderHalf: 4, hipHalf: 4 },
  genius: { thigh: 52, shin: 50, torso: 100, upperArm: 46, forearm: 44, shoulderHalf: 4, hipHalf: 4 },
  muscle: { thigh: 46, shin: 44, torso: 112, upperArm: 54, forearm: 50, shoulderHalf: 60, hipHalf: 20 },
  boss: { thigh: 54, shin: 52, torso: 106, upperArm: 48, forearm: 46, shoulderHalf: 20, hipHalf: 12 },
  money: { thigh: 54, shin: 52, torso: 106, upperArm: 48, forearm: 46, shoulderHalf: 16, hipHalf: 10 },
};

export const P = (lean = 0, overrides: Partial<Pose> = {}): Pose => ({
  lean,
  hipX: 0,
  hipY: 0,
  lArm: [-14, -8],
  rArm: [14, 8],
  lLeg: [-7, 3],
  rLeg: [7, -3],
  head: 0,
  ...overrides,
});

// ----------------------------------------------------------------- pose library
export const POSES = {
  stand: P(),
  wave: P(0, { rArm: [150, 30] }),
  cheer: P(0, { lArm: [-155, -15], rArm: [155, 15], hipY: -4 }),
  point: P(-4, { rArm: [100, -6], lArm: [-20, -40] }),
  pointUp: P(0, { rArm: [165, 0], lArm: [-25, -50] }),
  clipboard: P(0, { lArm: [-30, -95], rArm: [20, 40] }),
  shrug: P(0, { lArm: [-60, 90], rArm: [60, -90] }),
  shocked: P(0, { lArm: [-130, -40], rArm: [130, 40], hipY: 2 }),
  flex: P(0, { lArm: [-95, -100], rArm: [95, 100] }),
  carry: P(0, { lArm: [-160, 20], rArm: [160, -20], hipY: 6, lLeg: [-12, 8], rLeg: [12, -8] }),
  tapUp: P(0, { lArm: [-150, -20], rArm: [150, 20] }),
  tapLeft: P(-6, { lArm: [-130, -10], rArm: [40, 30] }),
  tapRight: P(6, { rArm: [130, 10], lArm: [-40, -30] }),
  // bat poses face screen-right; flip the character to swing to the left
  batReady: P(-4, { rArm: [-35, -115], lArm: [20, 70], lLeg: [-12, 4], rLeg: [10, -4] }),
  batWindup: P(-14, { rArm: [-120, -50], lArm: [-40, 60], lLeg: [-14, 6], rLeg: [12, -4] }),
  batSwing: P(12, { rArm: [82, 4], lArm: [70, 14], lLeg: [-16, 8], rLeg: [6, 0] }),
  huddleArms: P(0, { lArm: [-100, -10], rArm: [100, 10] }),
  holdSign: P(0, { lArm: [-140, -60], rArm: [140, 60] }),
  sip: P(0, { rArm: [30, 130], lArm: [-15, -8] }),
  type: P(4, { lArm: [30, 70], rArm: [40, 60] }),
  whiteboard: P(0, { rArm: [130, -20], lArm: [-30, -100] }),
  tiredWalk: P(10, { lArm: [5, 0], rArm: [12, 0], hipY: 8, head: 14 }),
  hero: P(0, { lArm: [-30, -110], rArm: [160, 10], lLeg: [-16, 4], rLeg: [14, -4] }),
  heroFlex: P(0, { lArm: [-100, -110], rArm: [100, 110], lLeg: [-16, 4], rLeg: [16, -4] }),
  heroPoint: P(-4, { rArm: [115, -5], lArm: [-30, -100], lLeg: [-16, 4], rLeg: [12, -4] }),
  fly: P(-20, { lArm: [-120, 30], rArm: [140, -30], lLeg: [-40, 40], rLeg: [30, 50] }),
  thumbsUp: P(0, { rArm: [70, 100], lArm: [-14, -8] }),
} satisfies Record<string, Pose>;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpLimb = (a: Limb, b: Limb, t: number): Limb => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

export const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  lean: lerp(a.lean, b.lean, t),
  hipX: lerp(a.hipX, b.hipX, t),
  hipY: lerp(a.hipY, b.hipY, t),
  lArm: lerpLimb(a.lArm, b.lArm, t),
  rArm: lerpLimb(a.rArm, b.rArm, t),
  lLeg: lerpLimb(a.lLeg, b.lLeg, t),
  rLeg: lerpLimb(a.rLeg, b.rLeg, t),
  head: lerp(a.head, b.head, t),
});

/** Keyframed pose: [[frame, pose], ...]; eased with a snappy cartoon curve. */
export const poseAt = (frame: number, keys: [number, Pose][], ease = Easing.bezier(0.3, 1.4, 0.5, 1)): Pose => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, p0] = keys[i];
    const [f1, p1] = keys[i + 1];
    if (frame <= f1) {
      const t = interpolate(frame, [f0, f1], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return lerpPose(p0, p1, t);
    }
  }
  return keys[keys.length - 1][1];
};

/** Walk cycle (two steps per `stepFrames * 2`) layered on a base pose. */
export const walkPose = (base: Pose, phase: number, amount = 1): Pose => {
  const s = Math.sin(phase * Math.PI * 2);
  return {
    ...base,
    lLeg: [base.lLeg[0] + s * 22 * amount, base.lLeg[1] + Math.max(0, -s) * 25 * amount],
    rLeg: [base.rLeg[0] - s * 22 * amount, base.rLeg[1] + Math.max(0, s) * 25 * amount],
    lArm: [base.lArm[0] - s * 18 * amount, base.lArm[1]],
    rArm: [base.rArm[0] - s * 18 * amount, base.rArm[1]],
    hipY: base.hipY + Math.abs(Math.cos(phase * Math.PI * 2)) * -5 * amount,
  };
};

// ----------------------------------------------------------------- geometry
const rad = (d: number) => (d * Math.PI) / 180;
export const dir = (deg: number): Pt => ({ x: Math.sin(rad(deg)), y: Math.cos(rad(deg)) });
export const add = (a: Pt, b: Pt, k = 1): Pt => ({ x: a.x + b.x * k, y: a.y + b.y * k });

export type Skeleton = {
  hip: Pt;
  neck: Pt;
  shoulderL: Pt;
  shoulderR: Pt;
  elbowL: Pt;
  elbowR: Pt;
  handL: Pt;
  handR: Pt;
  hipL: Pt;
  hipR: Pt;
  kneeL: Pt;
  kneeR: Pt;
  footL: Pt;
  footR: Pt;
  headCenter: Pt;
  up: Pt;
  side: Pt; // torso "right" vector
  angles: { forearmL: number; forearmR: number; upperL: number; upperR: number; torso: number };
};

/** Solve joint positions. Origin (0,0) = ground point between the feet. */
export const solve = (pose: Pose, d: BodyDims, headR: number): Skeleton => {
  const legLen = d.thigh + d.shin;
  const hip = { x: pose.hipX, y: -legLen + pose.hipY };
  const torsoAngle = 180 - pose.lean;
  const up = dir(torsoAngle);
  const side = { x: -up.y, y: up.x }; // perpendicular, pointing screen-right when upright
  const neck = add(hip, up, d.torso);
  const shoulderBase = add(neck, up, -10);
  const shoulderL = add(shoulderBase, side, -d.shoulderHalf);
  const shoulderR = add(shoulderBase, side, d.shoulderHalf);
  const uL = pose.lArm[0] - pose.lean;
  const uR = pose.rArm[0] - pose.lean;
  const elbowL = add(shoulderL, dir(uL), d.upperArm);
  const elbowR = add(shoulderR, dir(uR), d.upperArm);
  const fL = uL + pose.lArm[1];
  const fR = uR + pose.rArm[1];
  const handL = add(elbowL, dir(fL), d.forearm);
  const handR = add(elbowR, dir(fR), d.forearm);
  const hipL = add(hip, { x: -d.hipHalf, y: 0 });
  const hipR = add(hip, { x: d.hipHalf, y: 0 });
  const kneeL = add(hipL, dir(pose.lLeg[0]), d.thigh);
  const kneeR = add(hipR, dir(pose.rLeg[0]), d.thigh);
  const footL = add(kneeL, dir(pose.lLeg[0] + pose.lLeg[1]), d.shin);
  const footR = add(kneeR, dir(pose.rLeg[0] + pose.rLeg[1]), d.shin);
  const headCenter = add(neck, up, 8 + headR * 0.94);
  return {
    hip, neck, shoulderL, shoulderR, elbowL, elbowR, handL, handR, hipL, hipR, kneeL, kneeR, footL, footR,
    headCenter, up, side,
    angles: { forearmL: fL, forearmR: fR, upperL: uL, upperR: uR, torso: torsoAngle },
  };
};

export const pts = (...p: Pt[]) => p.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");

/** Outline of a bulging limb segment (for Ali's muscles). Returns an SVG path. */
export const muscleLimb = (a: Pt, b: Pt, wA: number, wMid: number, wB: number, bulgeAt = 0.45): string => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const n = { x: -dy / len, y: dx / len };
  const m = { x: a.x + dx * bulgeAt, y: a.y + dy * bulgeAt };
  const p = (q: Pt, w: number, s: number) => `${(q.x + n.x * w * s).toFixed(1)},${(q.y + n.y * w * s).toFixed(1)}`;
  // control points pushed out so the curve passes ~through wMid
  const c = (s: number) => p(m, wMid * 1.25, s);
  return `M ${p(a, wA, 1)} Q ${c(1)} ${p(b, wB, 1)} A ${wB} ${wB} 0 0 1 ${p(b, wB, -1)} Q ${c(-1)} ${p(a, wA, -1)} Z`;
};
