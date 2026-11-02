// 2D character rig with inverse kinematics.
// Angles in degrees, screen space: 0 = straight down, +90 = screen right, -90 = screen left, 180 = up.
// "l" limbs are on the screen-left, "r" limbs on the screen-right.
// Feet stay planted (two-bone IK) when the hips move, so bounces bend the knees
// instead of sliding the whole body — that is most of what makes motion read as "real".
import { Easing, interpolate } from "remotion";

export type Limb = [number, number]; // [upper angle (absolute), lower angle (relative to upper)]
export type Pt = { x: number; y: number };

export type Pose = {
  lean: number; // torso tilt, + = right
  hipX: number;
  hipY: number; // + = down (knees bend, feet stay planted)
  lArm: Limb;
  rArm: Limb;
  lLeg: Limb;
  rLeg: Limb;
  head: number; // extra head tilt
  /** hand IK targets in body space (origin = ground point between the feet) */
  lHand?: Pt;
  rHand?: Pt;
  /** quick hand targets computed from the skeleton */
  hold?: "mouth" | "chest" | "boxes" | "none";
  /** foot IK targets (body space); default = planted under the hips */
  lFoot?: Pt;
  rFoot?: Pt;
  /** false = legs follow the angles freely (jumping, flying) */
  plant?: boolean;
  /** draw arms in front of the head (blowing a balloon, hands at the face) */
  armsFront?: boolean;
  /** draw arms behind the torso (hiding something behind the back) */
  armsBack?: boolean;
};

export type BodyDims = {
  thigh: number;
  shin: number;
  torso: number;
  neck: number;
  upperArm: number;
  forearm: number;
  shoulderHalf: number;
  hipHalf: number;
  /** limb thickness: [upper arm, forearm, thigh, shin] */
  w: [number, number, number, number];
};

export const DIMS: Record<string, BodyDims> = {
  leader: { thigh: 76, shin: 72, torso: 126, neck: 12, upperArm: 62, forearm: 56, shoulderHalf: 39, hipHalf: 17, w: [24, 21, 31, 25] },
  genius: { thigh: 75, shin: 71, torso: 122, neck: 12, upperArm: 60, forearm: 55, shoulderHalf: 36, hipHalf: 16, w: [23, 19, 30, 24] },
  muscle: { thigh: 72, shin: 68, torso: 130, neck: 14, upperArm: 64, forearm: 58, shoulderHalf: 54, hipHalf: 21, w: [36, 29, 36, 29] },
  boss: { thigh: 76, shin: 72, torso: 126, neck: 12, upperArm: 62, forearm: 56, shoulderHalf: 41, hipHalf: 18, w: [26, 23, 32, 26] },
  money: { thigh: 76, shin: 72, torso: 126, neck: 12, upperArm: 62, forearm: 56, shoulderHalf: 37, hipHalf: 17, w: [27, 25, 30, 25] },
};

export const P = (lean = 0, overrides: Partial<Pose> = {}): Pose => ({
  lean,
  hipX: 0,
  hipY: 0,
  lArm: [-10, -6],
  rArm: [10, 6],
  lLeg: [-4, 2],
  rLeg: [4, -2],
  head: 0,
  ...overrides,
});

// ----------------------------------------------------------------- pose library (natural, not cartoon)
export const POSES = {
  stand: P(),
  relaxed: P(0, { lArm: [-8, -14], rArm: [8, 14] }),
  wave: P(0, { rArm: [150, 25] }),
  cheer: P(0, { lArm: [-150, -18], rArm: [150, 18] }),
  point: P(-2, { rArm: [96, -4], lArm: [-12, -20] }),
  pointUp: P(0, { rArm: [168, 4], lArm: [-16, -40] }),
  clipboard: P(0, { lArm: [-22, -100], rArm: [12, 30] }),
  shrug: P(0, { lArm: [-55, 95], rArm: [55, -95] }),
  shocked: P(-2, { lArm: [-60, -110], rArm: [60, 110], hipY: 4, head: -4 }),
  flex: P(0, { lArm: [-95, -105], rArm: [95, 105] }),
  hipsHands: P(0, { lArm: [-38, 95], rArm: [38, -95] }),
  tapUp: P(0, { lArm: [-160, -10], rArm: [160, 10] }),
  blow: P(0, { hold: "mouth", armsFront: true }),
  carry: P(0, { hold: "boxes", hipY: 8 }),
  holdSign: P(0, { hold: "chest" }),
  // bat poses face screen-right; flip the character to swing to the left
  batReady: P(-3, { rArm: [-30, -118], lArm: [16, 60] }),
  batWindup: P(-12, { rArm: [-125, -45], lArm: [-40, 60], hipY: 6 }),
  batSwing: P(10, { rArm: [84, 4], lArm: [70, 14], hipY: 8, lFoot: { x: -34, y: 0 }, rFoot: { x: 30, y: 0 } }),
  sip: P(0, { rArm: [24, 128], lArm: [-10, -8] }),
  type: P(4, { lArm: [30, 70], rArm: [40, 60] }),
  whiteboard: P(0, { rArm: [128, -16], lArm: [-26, -96] }),
  tired: P(8, { lArm: [4, 0], rArm: [10, 0], hipY: 10, head: 14 }),
  hero: P(0, { lArm: [-34, 98], rArm: [160, 8], lFoot: { x: -42, y: 0 }, rFoot: { x: 40, y: 0 } }),
  heroFlex: P(0, { lArm: [-98, -108], rArm: [98, 108], lFoot: { x: -46, y: 0 }, rFoot: { x: 46, y: 0 }, hipY: 4 }),
  heroPoint: P(-3, { rArm: [112, -4], lArm: [-34, 98], lFoot: { x: -44, y: 0 }, rFoot: { x: 38, y: 0 } }),
  fly: P(-20, { lArm: [-120, 30], rArm: [140, -30], lLeg: [-40, 40], rLeg: [30, 50], plant: false }),
  lying: P(0, { lArm: [-30, -20], rArm: [30, 20], lLeg: [-10, 10], rLeg: [10, -10], plant: false }),
  sitDazed: P(0, { hipY: 70, lArm: [-40, -20], rArm: [40, 20], lFoot: { x: -60, y: 0 }, rFoot: { x: 60, y: 0 } }),
  thumbsUp: P(0, { rArm: [62, 108], lArm: [-10, -8] }),
  hideBehind: P(0, { lArm: [-16, 46], rArm: [16, -46], armsBack: true, head: -3 }),
  think: P(0, { rArm: [40, 128], lArm: [-30, 85] }),
  armsCrossed: P(0, { lArm: [-28, 105], rArm: [28, -105] }),
  presentPoint: P(-4, { lArm: [-118, -10], rArm: [24, 60] }),
  laugh: P(-8, { lArm: [-30, 110], rArm: [30, 125], head: -12 }),
  phoneTalk: P(0, { rArm: [30, 140], lArm: [-24, 96] }),
  hammerUp: P(0, { rArm: [140, 30], lArm: [-30, 60] }),
  hammerDown: P(6, { rArm: [70, 20], lArm: [-30, 60], hipY: 10 }),
} satisfies Record<string, Pose>;

/** layer the beat-locked idle groove (see idleMotion) on top of any pose */
export const withIdle = (pose: Pose, m: { hipY: number; hipX: number; sway: number }): Pose => ({
  ...pose,
  hipY: pose.hipY + m.hipY,
  hipX: pose.hipX + m.hipX,
  lArm: [pose.lArm[0] - m.sway * 3, pose.lArm[1]],
  rArm: [pose.rArm[0] - m.sway * 3, pose.rArm[1]],
});

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpLimb = (a: Limb, b: Limb, t: number): Limb => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const lerpPt = (a: Pt | undefined, b: Pt | undefined, t: number): Pt | undefined =>
  a && b ? { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) } : t < 0.5 ? a : b;

export const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  lean: lerp(a.lean, b.lean, t),
  hipX: lerp(a.hipX, b.hipX, t),
  hipY: lerp(a.hipY, b.hipY, t),
  lArm: lerpLimb(a.lArm, b.lArm, t),
  rArm: lerpLimb(a.rArm, b.rArm, t),
  lLeg: lerpLimb(a.lLeg, b.lLeg, t),
  rLeg: lerpLimb(a.rLeg, b.rLeg, t),
  head: lerp(a.head, b.head, t),
  lHand: lerpPt(a.lHand, b.lHand, t),
  rHand: lerpPt(a.rHand, b.rHand, t),
  // IK hold targets don't interpolate; switch half way
  hold: t < 0.5 ? a.hold : b.hold,
  lFoot: lerpPt(a.lFoot ?? FOOT_L, b.lFoot ?? FOOT_L, t),
  rFoot: lerpPt(a.rFoot ?? FOOT_R, b.rFoot ?? FOOT_R, t),
  plant: t < 0.5 ? a.plant : b.plant,
  armsFront: t < 0.5 ? a.armsFront : b.armsFront,
  armsBack: t < 0.5 ? a.armsBack : b.armsBack,
});

const FOOT_L = { x: -20, y: 0 };
const FOOT_R = { x: 20, y: 0 };

export const easeNatural = Easing.bezier(0.45, 0, 0.2, 1);

/**
 * Keyframed pose with natural easing. `lag` delays the arms by a few frames
 * relative to the body (follow-through), which removes the "robot" feel.
 */
export const poseAt = (frame: number, keys: [number, Pose][], lag = 3, ease = easeNatural): Pose => {
  const at = (f: number): Pose => {
    if (f <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [f0, p0] = keys[i];
      const [f1, p1] = keys[i + 1];
      if (f <= f1) {
        const t = interpolate(f, [f0, f1], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return lerpPose(p0, p1, t);
      }
    }
    return keys[keys.length - 1][1];
  };
  const body = at(frame);
  if (!lag) return body;
  const arms = at(frame - lag);
  return { ...body, lArm: arms.lArm, rArm: arms.rArm };
};

/**
 * Walk cycle in place. `phase` counts steps*0.5 (1.0 = left+right step). `stride` in px (body space).
 * Stance foot slides back at body speed, swing foot lifts and swings forward; hips bob; arms swing opposite.
 */
export const walkPose = (base: Pose, phase: number, stride = 46, dir: 1 | -1 = 1, lift = 16): Pose => {
  const foot = (off: number, baseX: number): Pt => {
    const q = (((phase + off) % 1) + 1) % 1;
    if (q < 0.5) return { x: baseX + dir * stride * (0.5 - 2 * q) * 0.5, y: 0 };
    const t = (q - 0.5) / 0.5;
    const e = 0.5 - 0.5 * Math.cos(Math.PI * t);
    return { x: baseX + dir * stride * (-0.25 + 0.5 * e), y: -lift * Math.sin(Math.PI * t) };
  };
  const s = Math.sin(phase * Math.PI * 2);
  return {
    ...base,
    lFoot: foot(0, -14),
    rFoot: foot(0.5, 14),
    lArm: [base.lArm[0] + s * 16 * dir, base.lArm[1] + Math.max(0, s) * 10],
    rArm: [base.rArm[0] + s * 16 * dir, base.rArm[1] - Math.max(0, -s) * 10],
    hipY: base.hipY + 3 - 4 * Math.cos(phase * Math.PI * 4) * 0.5,
    lean: base.lean + 3 * dir,
  };
};

// ----------------------------------------------------------------- geometry
const rad = (d: number) => (d * Math.PI) / 180;
export const dir = (deg: number): Pt => ({ x: Math.sin(rad(deg)), y: Math.cos(rad(deg)) });
export const add = (a: Pt, b: Pt, k = 1): Pt => ({ x: a.x + b.x * k, y: a.y + b.y * k });
const angleOf = (v: Pt) => (Math.atan2(v.x, v.y) * 180) / Math.PI; // inverse of dir()

/** two-bone IK: returns the middle joint. `bend` = +1/-1 picks which side the joint bends to. */
export const ik2 = (root: Pt, target: Pt, a: number, b: number, bend: 1 | -1): { mid: Pt; end: Pt } => {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const dRaw = Math.hypot(dx, dy) || 1e-3;
  const d = Math.min(a + b - 0.5, Math.max(Math.abs(a - b) + 0.5, dRaw));
  const ux = dx / dRaw;
  const uy = dy / dRaw;
  const cosA = (a * a + d * d - b * b) / (2 * a * d);
  const A = Math.acos(Math.max(-1, Math.min(1, cosA))) * bend;
  const mx = ux * Math.cos(A) - uy * Math.sin(A);
  const my = ux * Math.sin(A) + uy * Math.cos(A);
  const mid = { x: root.x + mx * a, y: root.y + my * a };
  const end = { x: root.x + ux * d, y: root.y + uy * d };
  return { mid, end };
};

export type Skeleton = {
  hip: Pt;
  neck: Pt;
  neckTop: Pt;
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
  mouth: Pt;
  up: Pt;
  side: Pt;
  angles: { forearmL: number; forearmR: number; upperL: number; upperR: number; torso: number };
};

/** Solve joint positions. Origin (0,0) = ground point between the feet. */
export const solve = (pose: Pose, d: BodyDims, headR: number): Skeleton => {
  const legLen = d.thigh + d.shin;
  const stand = legLen * 0.99 + 6; // ankle sits 6px above the ground; knees never fully locked
  const hip = { x: pose.hipX, y: -stand + pose.hipY };
  const torsoAngle = 180 - pose.lean;
  const up = dir(torsoAngle);
  const side = { x: -up.y, y: up.x };
  const neck = add(hip, up, d.torso);
  const neckTop = add(neck, up, d.neck);
  const headCenter = add(neckTop, up, headR * 0.86);
  const mouth = add(headCenter, up, -headR * 0.45);
  const shoulderBase = add(neck, up, -14);
  const shoulderL = add(shoulderBase, side, -d.shoulderHalf);
  const shoulderR = add(shoulderBase, side, d.shoulderHalf);
  const hipL = add(hip, side, -d.hipHalf);
  const hipR = add(hip, side, d.hipHalf);

  // ---- arms
  let lTarget = pose.lHand;
  let rTarget = pose.rHand;
  if (pose.hold === "mouth") {
    lTarget = add(mouth, { x: -16, y: 12 });
    rTarget = add(mouth, { x: 16, y: 12 });
  } else if (pose.hold === "chest") {
    lTarget = add(add(neck, up, -62), side, -48);
    rTarget = add(add(neck, up, -62), side, 48);
  } else if (pose.hold === "boxes") {
    lTarget = add(add(neck, up, -40), side, -62);
    rTarget = add(add(neck, up, -40), side, 62);
  }
  const armFK = (sh: Pt, limb: Limb) => {
    const u = limb[0] - pose.lean;
    const el = add(sh, dir(u), d.upperArm);
    const f = u + limb[1];
    return { el, hand: add(el, dir(f), d.forearm), u, f };
  };
  const armIK = (sh: Pt, target: Pt, outward: -1 | 1) => {
    // pick the elbow solution that points outward and down
    const a = ik2(sh, target, d.upperArm, d.forearm, 1);
    const b = ik2(sh, target, d.upperArm, d.forearm, -1);
    const score = (m: Pt) => (m.x - sh.x) * outward + (m.y - sh.y) * 0.5;
    const { mid, end } = score(a.mid) >= score(b.mid) ? a : b;
    return { el: mid, hand: end, u: angleOf({ x: mid.x - sh.x, y: mid.y - sh.y }), f: angleOf({ x: end.x - mid.x, y: end.y - mid.y }) };
  };
  const L = lTarget ? armIK(shoulderL, lTarget, -1) : armFK(shoulderL, pose.lArm);
  const R = rTarget ? armIK(shoulderR, rTarget, 1) : armFK(shoulderR, pose.rArm);

  // ---- legs: planted IK by default
  let kneeL: Pt, kneeR: Pt, footL: Pt, footR: Pt;
  if (pose.plant === false) {
    kneeL = add(hipL, dir(pose.lLeg[0]), d.thigh);
    kneeR = add(hipR, dir(pose.rLeg[0]), d.thigh);
    footL = add(kneeL, dir(pose.lLeg[0] + pose.lLeg[1]), d.shin);
    footR = add(kneeR, dir(pose.rLeg[0] + pose.rLeg[1]), d.shin);
  } else {
    const ft = (p: Pt | undefined, def: number) => p ?? { x: def, y: 0 };
    const tl = ft(pose.lFoot, -d.hipHalf - 3);
    const tr = ft(pose.rFoot, d.hipHalf + 3);
    // Front view: a bent knee points mostly toward the camera, so only a small part of the
    // IK bend shows sideways — the leg reads shorter (foreshortened) instead of bow-legged.
    const front = (root: Pt, target: Pt, bend: 1 | -1) => {
      const { mid, end } = ik2(root, target, d.thigh, d.shin, bend);
      const t = d.thigh / (d.thigh + d.shin);
      const lin = { x: root.x + (end.x - root.x) * t, y: root.y + (end.y - root.y) * t };
      return { mid: { x: lin.x + (mid.x - lin.x) * 0.22, y: lin.y + (mid.y - lin.y) * 0.22 }, end };
    };
    const l = front(hipL, { x: tl.x, y: tl.y - 6 }, 1);
    const r = front(hipR, { x: tr.x, y: tr.y - 6 }, -1);
    kneeL = l.mid;
    kneeR = r.mid;
    footL = l.end;
    footR = r.end;
  }
  return {
    hip, neck, neckTop, shoulderL, shoulderR,
    elbowL: L.el, elbowR: R.el, handL: L.hand, handR: R.hand,
    hipL, hipR, kneeL, kneeR, footL, footR, headCenter, mouth, up, side,
    angles: { forearmL: L.f, forearmR: R.f, upperL: L.u, upperR: R.u, torso: torsoAngle },
  };
};

export const pts = (...p: Pt[]) => p.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");
