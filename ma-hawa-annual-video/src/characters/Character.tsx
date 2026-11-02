// A bobblehead: big real-photo head (or line-art placeholder) on a small line-art body.
import React from "react";
import { Img, staticFile } from "remotion";
import { ACCENT, ACCENT_SOFT, INK, PAPER, STROKE } from "../theme";
import { CHARS, CharId, Expression, HEAD_R, charCfg, facePath } from "./config";
import { Goggles, Prop, PropName } from "./props";
import { DIMS, Pose, Pt, Skeleton, add, muscleLimb, pts, solve } from "./rig";

export type CharacterProps = {
  id: CharId;
  x: number;
  y: number;
  scale?: number;
  pose: Pose;
  expression?: Expression;
  flip?: boolean;
  /** whole-body spin around the hips (deg) */
  rotate?: number;
  squashX?: number;
  squashY?: number;
  headTilt?: number;
  opacity?: number;
  goggles?: "eyes" | "forehead" | "none";
  gogglesGlow?: number;
  left?: PropName;
  right?: PropName;
  frame?: number;
  /** wind amount 0..1 (ties, ghutra, kandura flutter) */
  wind?: number;
  /** seen from behind (no face) — for turning away */
  back?: boolean;
  /** extra svg drawn in body space, in front of everything */
  children?: React.ReactNode;
};

const DEFAULT_PROPS: Record<string, { left?: PropName; right?: PropName }> = {
  leader: { left: "clipboard" },
  boss: { right: "bat" },
  money: { right: "coffee" },
  genius: {},
  muscle: {},
};

const lineStyle = (sw: number) => ({
  stroke: INK,
  strokeWidth: sw,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
});

/** where the head is on screen — used to put stars, sweat, bulbs above heads */
export const headScreenPos = (
  id: CharId,
  x: number,
  y: number,
  scale: number,
  pose: Pose,
  flip = false,
  rotate = 0,
): { x: number; y: number; r: number } => {
  const sk = solve(pose, DIMS[charCfg(id).body], HEAD_R);
  const f = flip ? -1 : 1;
  // rotate around the hip pivot like <Character rotate>
  const px = sk.headCenter.x * scale * f;
  const py = (sk.headCenter.y - sk.hip.y) * scale;
  const a = (rotate * Math.PI) / 180;
  const rx = px * Math.cos(a) - py * Math.sin(a);
  const ry = px * Math.sin(a) + py * Math.cos(a);
  return { x: x + rx, y: y + sk.hip.y * scale + ry, r: HEAD_R * scale };
};

export const Character: React.FC<CharacterProps> = (p) => {
  const cfg = charCfg(p.id);
  const body = cfg.body;
  const d = DIMS[body];
  const s = p.scale ?? 1;
  const sw = STROKE / s;
  const sk = solve(p.pose, d, HEAD_R);
  const r = HEAD_R;
  const flip = p.flip ? -1 : 1;
  const sx = p.squashX ?? 1;
  const sy = p.squashY ?? 1;
  const rot = p.rotate ?? 0;
  const pivotY = sk.hip.y;
  const expression = p.expression ?? "neutral";
  const face = p.back ? null : facePath(p.id, expression);
  const tilt = (p.headTilt ?? 0) + p.pose.head + p.pose.lean * 0.5;
  const hc = sk.headCenter;
  const pivot = { x: hc.x, y: hc.y + r * 0.7 };
  const defaults = DEFAULT_PROPS[body] ?? {};
  const left = p.left ?? defaults.left ?? "none";
  const right = p.right ?? defaults.right ?? "none";
  const frame = p.frame ?? 0;
  const wind = p.wind ?? 0;

  const transform = [
    `translate(${p.x}px, ${p.y}px)`,
    `translate(0px, ${pivotY * s}px)`,
    `rotate(${rot}deg)`,
    `translate(0px, ${-pivotY * s}px)`,
    `scale(${s * flip * sx}, ${s * sy})`,
  ].join(" ");

  const svgStyle: React.CSSProperties = { position: "absolute", left: 0, top: 0, overflow: "visible" };

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transform, transformOrigin: "0 0", opacity: p.opacity ?? 1 }}>
      {/* back layer: body, outfit, arms */}
      <svg width={1} height={1} style={svgStyle}>
        <defs>
          <filter id="glowBlur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={10} />
          </filter>
        </defs>
        {body === "money" && <GhutraBack hc={hc} r={r} sw={sw} wind={wind} frame={frame} neck={sk.neck} />}
        <Body body={body} sk={sk} sw={sw} wind={wind} frame={frame} />
        {/* head backing (hides limbs behind the head) */}
        <circle cx={hc.x} cy={hc.y} r={r} fill={PAPER} />
        {left !== "none" && <HandProp name={left} at={sk.handL} angle={sk.angles.forearmL} sw={sw} frame={frame} flip={flip} />}
        {right !== "none" && <HandProp name={right} at={sk.handR} angle={sk.angles.forearmR} sw={sw} frame={frame} flip={flip} />}
      </svg>
      {/* photo head */}
      {face && (
        <Img
          src={staticFile(face)}
          style={{
            position: "absolute",
            left: hc.x - r,
            top: hc.y - r,
            width: 2 * r,
            height: 2 * r,
            transform: `rotate(${tilt}deg) scaleX(${flip})`,
            transformOrigin: "50% 85%",
          }}
        />
      )}
      {/* front layer: head ring / placeholder face, goggles, ghutra front */}
      <svg width={1} height={1} style={svgStyle}>
        <g transform={`rotate(${tilt} ${pivot.x} ${pivot.y})`}>
          {p.back ? (
            <BackOfHead hc={hc} r={r} sw={sw} body={body} />
          ) : face ? (
            <circle cx={hc.x} cy={hc.y} r={r} {...lineStyle(sw)} />
          ) : (
            <PlaceholderHead id={p.id} hc={hc} r={r} sw={sw} expression={expression} flip={flip} />
          )}
          {body === "money" && !p.back && <GhutraFront hc={hc} r={r} sw={sw} />}
          {body === "genius" && (p.goggles ?? "forehead") !== "none" && (
            <g transform={`translate(${hc.x} ${hc.y})`}>
              <Goggles
                r={r}
                sw={sw}
                eyes={[CHARS.faceGeometry.leftEye, CHARS.faceGeometry.rightEye]}
                mode={(p.goggles ?? "forehead") as "eyes" | "forehead"}
                glow={p.gogglesGlow}
              />
            </g>
          )}
        </g>
        {p.children}
      </svg>
    </div>
  );
};

const HandProp: React.FC<{ name: PropName; at: Pt; angle: number; sw: number; frame: number; flip: number }> = ({
  name, at, angle, sw, frame,
}) => (
  <g transform={`translate(${at.x} ${at.y})`}>
    <Prop name={name} sw={sw} angle={angle} frame={frame} />
  </g>
);

// ------------------------------------------------------------------- bodies
const Body: React.FC<{ body: string; sk: Skeleton; sw: number; wind: number; frame: number }> = ({ body, sk, sw, wind, frame }) => {
  const L = lineStyle(sw);
  const legs = (
    <>
      <polyline points={pts(sk.hipL, sk.kneeL, sk.footL)} {...L} />
      <polyline points={pts(sk.hipR, sk.kneeR, sk.footR)} {...L} />
      <line x1={sk.footL.x} y1={sk.footL.y} x2={sk.footL.x - 14} y2={sk.footL.y + 1} {...L} />
      <line x1={sk.footR.x} y1={sk.footR.y} x2={sk.footR.x + 14} y2={sk.footR.y + 1} {...L} />
    </>
  );
  const arms = (
    <>
      <polyline points={pts(sk.shoulderL, sk.elbowL, sk.handL)} {...L} />
      <polyline points={pts(sk.shoulderR, sk.elbowR, sk.handR)} {...L} />
    </>
  );
  const spine = <line x1={sk.hip.x} y1={sk.hip.y} x2={sk.neck.x} y2={sk.neck.y} {...L} />;
  const at = (k: number, side = 0): Pt => add(add(sk.neck, sk.up, -k), sk.side, side);
  const flutter = Math.sin(frame / 3) * 10 * wind;

  switch (body) {
    case "leader": {
      // Amr: shirt collar + blue tie
      const knot = at(10);
      const tip = add(at(58), sk.side, 4 + flutter * 0.6);
      return (
        <g>
          {legs}
          {spine}
          <polyline points={pts(at(0, -14), at(10), at(0, 14))} {...L} />
          <path d={`M ${pts(at(6, -6))} L ${pts(at(6, 6))} L ${pts(at(16, 4))} L ${pts(at(16, -4))} Z`} {...L} fill={ACCENT} strokeWidth={sw * 0.7} />
          <path d={`M ${pts(at(16, -4))} L ${pts(add(at(48), sk.side, -9 + flutter * 0.4))} L ${pts(tip)} L ${pts(add(at(48), sk.side, 9 + flutter * 0.4))} L ${pts(at(16, 4))} Z`} {...L} fill={ACCENT} strokeWidth={sw * 0.7} />
          <circle cx={knot.x} cy={knot.y} r={0.1} />
          {arms}
        </g>
      );
    }
    case "genius": {
      // Hussein: pocket with pens
      const pk = at(30, -26);
      return (
        <g>
          {legs}
          {spine}
          <polyline points={pts(at(0, -12), at(9), at(0, 12))} {...L} />
          <rect x={pk.x - 13} y={pk.y} width={26} height={22} rx={3} {...L} fill={PAPER} strokeWidth={sw * 0.7} />
          <line x1={pk.x - 5} y1={pk.y + 4} x2={pk.x - 5} y2={pk.y - 12} stroke={ACCENT} strokeWidth={sw} strokeLinecap="round" />
          <line x1={pk.x + 5} y1={pk.y + 4} x2={pk.x + 5} y2={pk.y - 9} {...L} />
          {arms}
        </g>
      );
    }
    case "muscle": {
      // Ali: V-shaped torso, pecs, abs, huge arms
      const sh = 64;
      const waist = 26;
      const top = at(-2);
      const shL = add(at(12), sk.side, -sh);
      const shR = add(at(12), sk.side, sh);
      const wL = add(sk.hip, sk.side, -waist);
      const wR = add(sk.hip, sk.side, waist);
      const trapL = add(top, sk.side, -18);
      const trapR = add(top, sk.side, 18);
      const ctl = (a: Pt, b: Pt, k: number): Pt => add({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, sk.side, k);
      const torso = `M ${pts(trapL)} Q ${pts(add(trapL, sk.side, -30))} ${pts(shL)} Q ${pts(ctl(shL, wL, -14))} ${pts(wL)} L ${pts(wR)} Q ${pts(ctl(shR, wR, 14))} ${pts(shR)} Q ${pts(add(trapR, sk.side, 30))} ${pts(trapR)}`;
      const pecY = 36;
      const pec = (s: number) => `M ${pts(at(pecY - 18, s * 4))} Q ${pts(at(pecY + 10, s * 26))} ${pts(at(pecY - 2, s * 50))}`;
      const abs = [62, 80, 98].map((k) => `M ${pts(at(k, -16))} L ${pts(at(k, -4))} M ${pts(at(k, 4))} L ${pts(at(k, 16))}`).join(" ");
      const limbs = (
        <>
          <path d={muscleLimb(sk.shoulderL, sk.elbowL, 20, 30, 16, 0.4)} {...L} fill={PAPER} />
          <path d={muscleLimb(sk.elbowL, sk.handL, 15, 20, 11, 0.35)} {...L} fill={PAPER} />
          <path d={muscleLimb(sk.shoulderR, sk.elbowR, 20, 30, 16, 0.4)} {...L} fill={PAPER} />
          <path d={muscleLimb(sk.elbowR, sk.handR, 15, 20, 11, 0.35)} {...L} fill={PAPER} />
          <circle cx={sk.handL.x} cy={sk.handL.y} r={12} {...L} fill={PAPER} />
          <circle cx={sk.handR.x} cy={sk.handR.y} r={12} {...L} fill={PAPER} />
        </>
      );
      return (
        <g>
          <path d={muscleLimb(sk.hipL, sk.kneeL, 15, 17, 12)} {...L} fill={PAPER} />
          <path d={muscleLimb(sk.kneeL, sk.footL, 12, 12, 9, 0.3)} {...L} fill={PAPER} />
          <path d={muscleLimb(sk.hipR, sk.kneeR, 15, 17, 12)} {...L} fill={PAPER} />
          <path d={muscleLimb(sk.kneeR, sk.footR, 12, 12, 9, 0.3)} {...L} fill={PAPER} />
          <line x1={sk.footL.x} y1={sk.footL.y + 6} x2={sk.footL.x - 22} y2={sk.footL.y + 6} {...L} />
          <line x1={sk.footR.x} y1={sk.footR.y + 6} x2={sk.footR.x + 22} y2={sk.footR.y + 6} {...L} />
          <path d={`${torso} Z`} fill={PAPER} stroke="none" />
          <path d={torso} {...L} />
          <path d={pec(-1)} {...L} />
          <path d={pec(1)} {...L} />
          <path d={abs} {...L} strokeWidth={sw * 0.7} />
          <line x1={wL.x} y1={wL.y} x2={wR.x} y2={wR.y} {...L} />
          {limbs}
        </g>
      );
    }
    case "boss": {
      // Michael: suit jacket, lapels, blue tie
      const sh = 26;
      const shL = add(at(8), sk.side, -sh);
      const shR = add(at(8), sk.side, sh);
      const hemL = add(sk.hip, sk.side, -24);
      const hemR = add(sk.hip, sk.side, 24);
      const jacket = `M ${pts(at(0, -10))} L ${pts(shL)} L ${pts(add(hemL, sk.up, -10))} L ${pts(hemR.x < hemL.x ? hemR : add(hemR, sk.up, -10))} L ${pts(shR)} L ${pts(at(0, 10))} Z`;
      const lapel = `M ${pts(at(0, -10))} L ${pts(at(48, 0))} L ${pts(at(0, 10))}`;
      const tie = `M ${pts(at(6, -5))} L ${pts(at(6, 5))} L ${pts(add(at(44, 6), sk.side, flutter * 0.4))} L ${pts(add(at(52, 0), sk.side, flutter * 0.6))} L ${pts(add(at(44, -6), sk.side, flutter * 0.4))} Z`;
      const b1 = at(66);
      const b2 = at(86);
      return (
        <g>
          {legs}
          <path d={jacket} {...L} fill={PAPER} />
          <path d={tie} {...L} fill={ACCENT} strokeWidth={sw * 0.7} />
          <path d={lapel} {...L} />
          <circle cx={b1.x} cy={b1.y} r={3.5} fill={INK} />
          <circle cx={b2.x} cy={b2.y} r={3.5} fill={INK} />
          <polyline points={pts(shL, sk.elbowL, sk.handL)} {...L} />
          <polyline points={pts(shR, sk.elbowR, sk.handR)} {...L} />
        </g>
      );
    }
    case "money": {
      // Saeed: kandura (long white robe)
      const hemY = -10;
      const shL = add(at(6), sk.side, -22);
      const shR = add(at(6), sk.side, 22);
      const sway = Math.sin(frame / 4) * 6 * wind;
      const hemL = { x: sk.hip.x - 40 + sway, y: hemY };
      const hemR = { x: sk.hip.x + 40 + sway, y: hemY };
      const robe = `M ${pts(shL)} Q ${pts(add(sk.hip, sk.side, -34))} ${pts(hemL)} Q ${pts({ x: sk.hip.x + sway, y: hemY + 6 })} ${pts(hemR)} Q ${pts(add(sk.hip, sk.side, 34))} ${pts(shR)} Z`;
      const tassel0 = at(4);
      const tassel1 = at(40);
      return (
        <g>
          <line x1={sk.footL.x + 6} y1={hemY} x2={sk.footL.x} y2={sk.footL.y} {...L} />
          <line x1={sk.footR.x - 6} y1={hemY} x2={sk.footR.x} y2={sk.footR.y} {...L} />
          <line x1={sk.footL.x} y1={sk.footL.y} x2={sk.footL.x - 16} y2={sk.footL.y} {...L} />
          <line x1={sk.footR.x} y1={sk.footR.y} x2={sk.footR.x + 16} y2={sk.footR.y} {...L} />
          <path d={robe} {...L} fill={PAPER} />
          <line x1={tassel0.x} y1={tassel0.y} x2={tassel1.x} y2={tassel1.y} {...L} strokeWidth={sw * 0.6} />
          <circle cx={tassel1.x} cy={tassel1.y + 4} r={5} fill={ACCENT} stroke={INK} strokeWidth={sw * 0.5} />
          {/* wide sleeves */}
          <path d={muscleLimb(shL, sk.elbowL, 12, 13, 12, 0.5)} {...L} fill={PAPER} />
          <path d={muscleLimb(sk.elbowL, sk.handL, 12, 12, 11, 0.5)} {...L} fill={PAPER} />
          <path d={muscleLimb(shR, sk.elbowR, 12, 13, 12, 0.5)} {...L} fill={PAPER} />
          <path d={muscleLimb(sk.elbowR, sk.handR, 12, 12, 11, 0.5)} {...L} fill={PAPER} />
        </g>
      );
    }
    default:
      return (
        <g>
          {legs}
          {spine}
          {arms}
        </g>
      );
  }
};

// ------------------------------------------------------------------- ghutra (Saeed)
const GhutraBack: React.FC<{ hc: Pt; r: number; sw: number; wind: number; frame: number; neck: Pt }> = ({ hc, r, sw, wind, frame, neck }) => {
  const R = r * 1.14;
  const flap = Math.sin(frame / 3.5) * 14 * wind;
  const d = `M ${hc.x - R} ${hc.y + r * 0.1}
    A ${R} ${R} 0 0 1 ${hc.x + R} ${hc.y + r * 0.1}
    L ${hc.x + R * 0.98 + flap} ${neck.y + 30}
    Q ${hc.x + r * 0.5} ${neck.y + 40} ${hc.x + r * 0.35} ${neck.y + 6}
    L ${hc.x - r * 0.35} ${neck.y + 6}
    Q ${hc.x - r * 0.5} ${neck.y + 40} ${hc.x - R * 0.98 + flap} ${neck.y + 30} Z`;
  return <path d={d} fill={PAPER} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
};

const GhutraFront: React.FC<{ hc: Pt; r: number; sw: number }> = ({ hc, r, sw }) => (
  <g>
    {/* cloth edge framing the face */}
    <path
      d={`M ${hc.x - r * 0.98} ${hc.y + r * 0.35} Q ${hc.x - r * 1.02} ${hc.y - r * 0.95} ${hc.x} ${hc.y - r * 1.03} Q ${hc.x + r * 1.02} ${hc.y - r * 0.95} ${hc.x + r * 0.98} ${hc.y + r * 0.35}`}
      fill="none"
      stroke={INK}
      strokeWidth={sw}
      strokeLinecap="round"
    />
    <path
      d={`M ${hc.x - r * 1.04} ${hc.y - r * 0.2} A ${r * 1.04} ${r * 1.04} 0 0 1 ${hc.x + r * 1.04} ${hc.y - r * 0.2} L ${hc.x + r * 0.84} ${hc.y - r * 0.32} A ${r * 0.86} ${r * 0.8} 0 0 0 ${hc.x - r * 0.84} ${hc.y - r * 0.32} Z`}
      fill={PAPER}
      stroke={INK}
      strokeWidth={sw * 0.8}
      strokeLinejoin="round"
    />
    {/* agal: double black cord */}
    <ellipse cx={hc.x} cy={hc.y - r * 0.74} rx={r * 0.78} ry={r * 0.17} fill="none" stroke={INK} strokeWidth={sw * 1.6} />
    <ellipse cx={hc.x} cy={hc.y - r * 0.6} rx={r * 0.84} ry={r * 0.17} fill="none" stroke={INK} strokeWidth={sw * 1.6} />
  </g>
);

const BackOfHead: React.FC<{ hc: Pt; r: number; sw: number; body: string }> = ({ hc, r, sw, body }) =>
  body === "money" ? (
    <g>
      <circle cx={hc.x} cy={hc.y} r={r * 1.08} fill={PAPER} stroke={INK} strokeWidth={sw} />
      <path d={`M ${hc.x - r * 0.2} ${hc.y - r * 0.5} Q ${hc.x - r * 0.3} ${hc.y + r * 0.4} ${hc.x - r * 0.45} ${hc.y + r * 1.1}`} fill="none" stroke={INK} strokeWidth={sw * 0.6} strokeLinecap="round" />
      <path d={`M ${hc.x + r * 0.25} ${hc.y - r * 0.5} Q ${hc.x + r * 0.35} ${hc.y + r * 0.4} ${hc.x + r * 0.5} ${hc.y + r * 1.1}`} fill="none" stroke={INK} strokeWidth={sw * 0.6} strokeLinecap="round" />
      <ellipse cx={hc.x} cy={hc.y - r * 0.74} rx={r * 0.78} ry={r * 0.17} fill="none" stroke={INK} strokeWidth={sw * 1.6} />
      <ellipse cx={hc.x} cy={hc.y - r * 0.6} rx={r * 0.84} ry={r * 0.17} fill="none" stroke={INK} strokeWidth={sw * 1.6} />
    </g>
  ) : (
    <g>
      <circle cx={hc.x} cy={hc.y} r={r} fill={PAPER} stroke={INK} strokeWidth={sw} />
      <path d={`M ${hc.x - r} ${hc.y} A ${r} ${r} 0 0 1 ${hc.x + r} ${hc.y} Q ${hc.x} ${hc.y + r * 0.3} ${hc.x - r} ${hc.y} Z`} fill={INK} />
    </g>
  );

// ------------------------------------------------------------------- placeholder head
const PlaceholderHead: React.FC<{ id: CharId; hc: Pt; r: number; sw: number; expression: Expression; flip: number }> = ({
  id, hc, r, sw, expression, flip,
}) => {
  const cfg = charCfg(id);
  const L = lineStyle(sw);
  const ex = r * 0.3;
  const ey = hc.y - r * 0.02;
  const my = hc.y + r * 0.38;
  const mouth = {
    happy: <path d={`M ${hc.x - r * 0.28} ${my - 6} Q ${hc.x} ${my + r * 0.26} ${hc.x + r * 0.28} ${my - 6}`} {...L} />,
    neutral: <path d={`M ${hc.x - r * 0.22} ${my} Q ${hc.x} ${my + r * 0.08} ${hc.x + r * 0.22} ${my}`} {...L} />,
    shocked: <ellipse cx={hc.x} cy={my + 4} rx={r * 0.13} ry={r * 0.18} {...L} />,
    tired: <path d={`M ${hc.x - r * 0.2} ${my + 4} q ${r * 0.1} ${-r * 0.08} ${r * 0.2} 0 q ${r * 0.1} ${r * 0.08} ${r * 0.2} 0`} {...L} />,
  }[expression];
  const eyeR = expression === "shocked" ? 9 : 7;
  return (
    <g>
      <circle cx={hc.x} cy={hc.y} r={r} {...L} fill={PAPER} />
      {cfg.placeholder.hair === "side-part" && (
        <path
          d={`M ${hc.x - r * 0.92} ${hc.y - r * 0.25} Q ${hc.x - r * 0.9} ${hc.y - r * 1.02} ${hc.x + r * 0.1} ${hc.y - r * 0.98} Q ${hc.x + r * 0.95} ${hc.y - r * 0.9} ${hc.x + r * 0.93} ${hc.y - r * 0.25} Q ${hc.x + r * 0.6} ${hc.y - r * 0.62} ${hc.x - r * 0.25} ${hc.y - r * 0.62} Q ${hc.x - r * 0.75} ${hc.y - r * 0.6} ${hc.x - r * 0.92} ${hc.y - r * 0.25} Z`}
          fill={INK}
        />
      )}
      {/* brows */}
      <path d={`M ${hc.x - ex - 14} ${ey - r * 0.2} q 14 ${expression === "tired" ? 4 : -8} 28 0`} {...L} strokeWidth={sw * 0.8} />
      <path d={`M ${hc.x + ex - 14} ${ey - r * 0.2} q 14 ${expression === "tired" ? 4 : -8} 28 0`} {...L} strokeWidth={sw * 0.8} />
      {expression === "tired" ? (
        <>
          <line x1={hc.x - ex - 9} x2={hc.x - ex + 9} y1={ey} y2={ey} {...L} />
          <line x1={hc.x + ex - 9} x2={hc.x + ex + 9} y1={ey} y2={ey} {...L} />
        </>
      ) : (
        <>
          <circle cx={hc.x - ex} cy={ey} r={eyeR} fill={INK} />
          <circle cx={hc.x + ex} cy={ey} r={eyeR} fill={INK} />
        </>
      )}
      <path d={`M ${hc.x} ${ey + 4} q -8 ${r * 0.2} 2 ${r * 0.24}`} {...L} strokeWidth={sw * 0.7} />
      {mouth}
      {/* cheeks */}
      <circle cx={hc.x - r * 0.55} cy={hc.y + r * 0.25} r={r * 0.11} fill={ACCENT_SOFT} />
      <circle cx={hc.x + r * 0.55} cy={hc.y + r * 0.25} r={r * 0.11} fill={ACCENT_SOFT} />
      {/* initials badge — marks this as a placeholder until a photo is set */}
      <g transform={`translate(${hc.x + r * 0.72} ${hc.y + r * 0.72}) scale(${flip} 1)`}>
        <circle r={r * 0.3} fill={ACCENT} stroke={INK} strokeWidth={sw * 0.7} />
        <text y={r * 0.11} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={r * 0.3} fill={PAPER}>
          {cfg.placeholder.initials}
        </text>
      </g>
    </g>
  );
};

/** Just a head (photo or placeholder) at a screen position — for top-down shots and close-ups. */
export const FaceDisc: React.FC<{ id: CharId; x: number; y: number; r: number; expression?: Expression; rotate?: number; ring?: string; goggles?: "eyes" | "forehead" | "none"; gogglesGlow?: number }> = ({
  id, x, y, r, expression = "neutral", rotate = 0, ring = INK, goggles = "none", gogglesGlow = 0,
}) => {
  const face = facePath(id, expression);
  const s = r / HEAD_R;
  const sw = STROKE / s;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `rotate(${rotate}deg) scale(${s})`, transformOrigin: "0 0" }}>
      <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
        <circle r={HEAD_R} fill={PAPER} />
      </svg>
      {face && <Img src={staticFile(face)} style={{ position: "absolute", left: -HEAD_R, top: -HEAD_R, width: 2 * HEAD_R, height: 2 * HEAD_R }} />}
      <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
        <defs>
          <filter id="glowBlur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={10} />
          </filter>
        </defs>
        {face ? (
          <circle r={HEAD_R} fill="none" stroke={ring} strokeWidth={sw} />
        ) : (
          <PlaceholderHead id={id} hc={{ x: 0, y: 0 }} r={HEAD_R} sw={sw} expression={expression} flip={1} />
        )}
        {charCfg(id).body === "money" && <GhutraFront hc={{ x: 0, y: 0 }} r={HEAD_R} sw={sw} />}
        {charCfg(id).body === "genius" && goggles !== "none" && (
          <Goggles r={HEAD_R} sw={sw} eyes={[CHARS.faceGeometry.leftEye, CHARS.faceGeometry.rightEye]} mode={goggles} glow={gogglesGlow} />
        )}
      </svg>
    </div>
  );
};
