// A character: real-photo head (or line-art placeholder) on a clothed, outlined body.
// Bodies are drawn as outlined "tubes" (dark under-stroke + coloured over-stroke) so joints are seamless,
// with outfit colours taken from each person's photo (config/characters.json → outfit).
import React from "react";
import { Img, staticFile } from "remotion";
import { ACCENT, ACCENT_SOFT, INK, PAPER, STROKE } from "../theme";
import { CHARS, CharId, Expression, HEAD_R, Outfit, charCfg, facePath, outfitOf } from "./config";
import { Goggles, Prop, PropName } from "./props";
import { DIMS, Pose, Pt, Skeleton, add, pts, solve } from "./rig";

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
  /** wind amount 0..1 (tie, ghutra, kandura flutter) */
  wind?: number;
  /** seen from behind (no face) — for turning away */
  back?: boolean;
  /** soft contact shadow on the ground (default on unless spinning) */
  shadow?: boolean;
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

/** any skeleton point on screen (stars over heads, balloons at mouths…) */
export const jointScreenPos = (
  id: CharId,
  x: number,
  y: number,
  scale: number,
  pose: Pose,
  joint: keyof Pick<Skeleton, "headCenter" | "mouth" | "handL" | "handR" | "neck" | "hip">,
  flip = false,
  rotate = 0,
): Pt => {
  const sk = solve(pose, DIMS[charCfg(id).body], HEAD_R);
  const f = flip ? -1 : 1;
  const j = sk[joint];
  const px = j.x * scale * f;
  const py = (j.y - sk.hip.y) * scale;
  const a = (rotate * Math.PI) / 180;
  return { x: x + px * Math.cos(a) - py * Math.sin(a), y: y + sk.hip.y * scale + px * Math.sin(a) + py * Math.cos(a) };
};

/** where the head is on screen (centre + radius) */
export const headScreenPos = (id: CharId, x: number, y: number, scale: number, pose: Pose, flip = false, rotate = 0) => ({
  ...jointScreenPos(id, x, y, scale, pose, "headCenter", flip, rotate),
  r: HEAD_R * scale,
});

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
  const tilt = (p.headTilt ?? 0) + p.pose.head + p.pose.lean * 0.6;
  const hc = sk.headCenter;
  const pivot = { x: hc.x, y: hc.y + r * 0.8 };
  const defaults = DEFAULT_PROPS[body] ?? {};
  const left = p.left ?? defaults.left ?? "none";
  const right = p.right ?? defaults.right ?? "none";
  const frame = p.frame ?? 0;
  const wind = p.wind ?? 0;
  const o = outfitOf(p.id);
  const armsFront = !!p.pose.armsFront;

  const transform = [
    `translate(${p.x}px, ${p.y}px)`,
    `translate(0px, ${pivotY * s}px)`,
    `rotate(${rot}deg)`,
    `translate(0px, ${-pivotY * s}px)`,
    `scale(${s * flip * sx}, ${s * sy})`,
  ].join(" ");
  const svgStyle: React.CSSProperties = { position: "absolute", left: 0, top: 0, overflow: "visible" };
  const arms = <Arms sk={sk} d={d} o={o} sw={sw} body={body} />;
  const props = (
    <>
      {left !== "none" && <HandProp name={left} at={sk.handL} angle={sk.angles.forearmL} sw={sw} frame={frame} />}
      {right !== "none" && <HandProp name={right} at={sk.handR} angle={sk.angles.forearmR} sw={sw} frame={frame} />}
    </>
  );

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transform, transformOrigin: "0 0", opacity: p.opacity ?? 1 }}>
      <svg width={1} height={1} style={svgStyle}>
        <defs>
          <filter id="glowBlur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={10} />
          </filter>
          <pattern id={`gingham-${p.id}`} width={10} height={10} patternUnits="userSpaceOnUse">
            <rect width={10} height={10} fill={o.top} />
            <rect width={5} height={10} fill="rgba(255,255,255,0.35)" />
            <rect width={10} height={5} fill="rgba(255,255,255,0.35)" />
            <rect width={5} height={5} fill="rgba(40,80,150,0.18)" />
          </pattern>
        </defs>
        {(p.shadow ?? rot === 0) && <ellipse cx={(sk.footL.x + sk.footR.x) / 2} cy={4} rx={Math.abs(sk.footR.x - sk.footL.x) / 2 + 52} ry={10} fill="rgba(20,30,50,0.10)" />}
        <Legs sk={sk} d={d} o={o} sw={sw} body={body} />
        <Neck sk={sk} o={o} sw={sw} w={body === "muscle" ? 40 : 28} />
        <Torso sk={sk} d={d} o={o} sw={sw} body={body} id={p.id} wind={wind} frame={frame} />
        {body === "money" && !p.back && <GhutraDrape hc={hc} r={r} sw={sw} wind={wind} frame={frame} sk={sk} />}
        {!armsFront && arms}
        {!face && <circle cx={hc.x} cy={hc.y} r={r} fill={PAPER} />}
        {!armsFront && props}
      </svg>
      {face && <PhotoHead src={face} hc={hc} r={r} tilt={tilt} flip={flip} sw={sw} />}
      <svg width={1} height={1} style={svgStyle}>
        <g transform={`rotate(${tilt} ${pivot.x} ${pivot.y})`}>
          {p.back ? (
            <BackOfHead hc={hc} r={r} sw={sw} body={body} />
          ) : face ? null : (
            <PlaceholderHead id={p.id} hc={hc} r={r} sw={sw} expression={expression} flip={flip} />
          )}
          {body === "money" && !p.back && !face && <GhutraFront hc={hc} r={r} sw={sw} />}
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
        {armsFront && arms}
        {armsFront && props}
        {p.children}
      </svg>
    </div>
  );
};

/**
 * The photo head as a cut-out silhouette (background removed by process_faces.py), outlined like the
 * line art, with the photo's own neck/shirt faded out so it sits on the drawn neck.
 */
const PhotoHead: React.FC<{ src: string; hc: Pt; r: number; tilt: number; flip: number; sw: number }> = ({ src, hc, r, tilt, flip, sw }) => {
  const o = Math.max(1.5, sw * 0.55);
  // oval vignette around hair + face + beard: drops the photo's own neck/shirt cleanly
  const fade = "radial-gradient(ellipse 50% 45% at 50% 45%, #000 90%, transparent 100%)";
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left: hc.x - r,
        top: hc.y - r,
        width: 2 * r,
        height: 2 * r,
        transform: `rotate(${tilt}deg) scaleX(${flip})`,
        transformOrigin: "50% 90%",
        WebkitMaskImage: fade,
        maskImage: fade,
        filter: `drop-shadow(${o}px 0 0 ${INK}) drop-shadow(-${o}px 0 0 ${INK}) drop-shadow(0 ${o}px 0 ${INK}) drop-shadow(0 -${o}px 0 ${INK})`,
      }}
    />
  );
};

const HandProp: React.FC<{ name: PropName; at: Pt; angle: number; sw: number; frame: number }> = ({ name, at, angle, sw, frame }) => (
  <g transform={`translate(${at.x} ${at.y})`}>
    <Prop name={name} sw={sw} angle={angle} frame={frame} />
  </g>
);

// ------------------------------------------------------------------- body parts
/** outlined tube through points with per-segment widths (seamless joints) */
const Tube: React.FC<{ p: Pt[]; w: number[]; color: string; sw: number; cap?: "round" | "butt" }> = ({ p, w, color, sw, cap = "round" }) => (
  <g>
    {p.slice(1).map((b, i) => (
      <line key={`u${i}`} x1={p[i].x} y1={p[i].y} x2={b.x} y2={b.y} stroke={INK} strokeWidth={w[i] + 2 * sw} strokeLinecap={cap} />
    ))}
    {p.slice(1).map((b, i) => (
      <line key={`o${i}`} x1={p[i].x} y1={p[i].y} x2={b.x} y2={b.y} stroke={color} strokeWidth={w[i]} strokeLinecap={cap} />
    ))}
  </g>
);

const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

const Hand: React.FC<{ at: Pt; elbow: Pt; o: Outfit; sw: number; size: number }> = ({ at, elbow, o, sw, size }) => {
  const dx = at.x - elbow.x;
  const dy = at.y - elbow.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const c = { x: at.x + ux * size * 0.35, y: at.y + uy * size * 0.35 };
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI - 90;
  return (
    <g transform={`translate(${c.x} ${c.y}) rotate(${ang})`}>
      <ellipse cx={size * 0.45} cy={-size * 0.1} rx={size * 0.28} ry={size * 0.42} transform={`rotate(-25 ${size * 0.45} ${-size * 0.1})`} fill={o.skin} stroke={INK} strokeWidth={sw * 0.8} />
      <ellipse rx={size * 0.55} ry={size * 0.7} fill={o.skin} stroke={INK} strokeWidth={sw * 0.8} />
    </g>
  );
};

const Arms: React.FC<{ sk: Skeleton; d: (typeof DIMS)[string]; o: Outfit; sw: number; body: string }> = ({ sk, d, o, sw, body }) => {
  const [wu, wf] = d.w;
  const sleeveCol = body === "leader" ? `url(#gingham-${o.id})` : o.top;
  const arm = (sh: Pt, el: Pt, hand: Pt) => {
    if (o.sleeves === "short") {
      // skin arm, then a short sleeve over the upper arm
      const sleeveEnd = lerpPt(sh, el, 0.62);
      return (
        <g>
          <Tube p={[sh, el, hand]} w={[wu - 3, wf]} color={o.skin} sw={sw} />
          <Tube p={[sh, sleeveEnd]} w={[wu + 6]} color={o.top} sw={sw} cap="butt" />
          <circle cx={sh.x} cy={sh.y} r={(wu + 6) / 2} fill={o.top} />
          <Hand at={hand} elbow={el} o={o} sw={sw} size={wf * 0.95} />
        </g>
      );
    }
    const cuff = lerpPt(el, hand, 0.9);
    return (
      <g>
        <Tube p={[sh, el, cuff]} w={[wu, wf]} color={sleeveCol} sw={sw} />
        {o.cuff && <Tube p={[lerpPt(el, hand, 0.78), cuff]} w={[wf + 2]} color={o.cuff} sw={sw * 0.6} cap="butt" />}
        <Hand at={hand} elbow={el} o={o} sw={sw} size={wf * 0.95} />
      </g>
    );
  };
  return (
    <g>
      {arm(sk.shoulderL, sk.elbowL, sk.handL)}
      {arm(sk.shoulderR, sk.elbowR, sk.handR)}
    </g>
  );
};

const Shoe: React.FC<{ at: Pt; side: -1 | 1; o: Outfit; sw: number; big?: boolean }> = ({ at, side, o, sw, big }) => {
  const L = big ? 44 : 38;
  const H = big ? 20 : 17;
  const x0 = at.x - side * 8;
  const y = at.y + 6;
  const toe = x0 + side * L;
  const d = `M ${x0 - side * 6} ${y} L ${x0 - side * 6} ${y - H + 4} Q ${x0 - side * 4} ${y - H} ${x0 + side * 8} ${y - H} Q ${toe - side * 6} ${y - H + 3} ${toe} ${y - 4} Q ${toe + side * 2} ${y} ${toe - side * 4} ${y} Z`;
  return (
    <g>
      <path d={d} fill={o.shoes} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      {o.sandals && <path d={`M ${x0} ${y - H + 2} L ${x0 + side * 22} ${y - 4}`} stroke={INK} strokeWidth={sw * 0.6} />}
    </g>
  );
};

const Legs: React.FC<{ sk: Skeleton; d: (typeof DIMS)[string]; o: Outfit; sw: number; body: string }> = ({ sk, d, o, sw, body }) => {
  const [, , wt, ws] = d.w;
  const pelvisW = d.hipHalf * 2 + wt;
  const top = add(sk.hip, sk.up, 12);
  const crotch = add(sk.hip, sk.up, -22);
  const a = add(top, sk.side, -pelvisW / 2);
  const b = add(top, sk.side, pelvisW / 2);
  const c = add(crotch, sk.side, pelvisW / 2 - 2);
  const e = add(crotch, sk.side, -pelvisW / 2 + 2);
  const robe = body === "money";
  return (
    <g>
      <Tube p={[sk.hipL, sk.kneeL, sk.footL]} w={[wt, ws]} color={o.bottom} sw={sw} />
      <Tube p={[sk.hipR, sk.kneeR, sk.footR]} w={[wt, ws]} color={o.bottom} sw={sw} />
      {!robe && <polygon points={pts(a, b, c, e)} fill={o.bottom} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />}
      {!robe && (
        <>
          <line x1={sk.hipL.x} y1={sk.hipL.y} x2={sk.kneeL.x} y2={sk.kneeL.y} stroke={o.bottom} strokeWidth={wt} strokeLinecap="round" />
          <line x1={sk.hipR.x} y1={sk.hipR.y} x2={sk.kneeR.x} y2={sk.kneeR.y} stroke={o.bottom} strokeWidth={wt} strokeLinecap="round" />
          <line x1={crotch.x} y1={crotch.y} x2={add(crotch, sk.up, -14).x} y2={add(crotch, sk.up, -14).y} stroke={INK} strokeWidth={sw * 0.6} strokeLinecap="round" />
        </>
      )}
      <Shoe at={sk.footL} side={-1} o={o} sw={sw} big={body === "muscle"} />
      <Shoe at={sk.footR} side={1} o={o} sw={sw} big={body === "muscle"} />
    </g>
  );
};

const Neck: React.FC<{ sk: Skeleton; o: Outfit; sw: number; w: number }> = ({ sk, o, sw, w }) => {
  const a = add(sk.neck, sk.up, -10);
  const b = add(sk.neckTop, sk.up, 18);
  return <Tube p={[a, b]} w={[w]} color={o.skin} sw={sw} cap="butt" />;
};

const Torso: React.FC<{ sk: Skeleton; d: (typeof DIMS)[string]; o: Outfit; sw: number; body: string; id: CharId; wind: number; frame: number }> = ({
  sk, d, o, sw, body, id, wind, frame,
}) => {
  const L = lineStyle(sw);
  const T = d.torso;
  // torso-local point: u = across (+ right), v = up from the hips
  const q = (u: number, v: number): Pt => add(add(sk.hip, sk.side, u), sk.up, v);
  const S = d.shoulderHalf;
  const hipW = d.hipHalf + d.w[2] / 2;
  const muscle = body === "muscle";
  const chest = muscle ? S + 10 : S + 4;
  const waist = muscle ? hipW - 2 : hipW + 1;
  const hemV = body === "boss" ? -16 : body === "genius" || muscle ? -8 : 4;
  const neckW = muscle ? 22 : 15;
  const shirt = (fill: string) => {
    const path = `M ${pts(q(-waist, hemV))} L ${pts(q(-waist - 1, 30))} Q ${pts(q(-chest - 2, T * 0.55))} ${pts(q(-chest, T - 34))} Q ${pts(q(-S - 14, T - 10))} ${pts(q(-S + 4, T - 2))} L ${pts(q(-neckW, T + 2))} Q ${pts(q(0, T - 12))} ${pts(q(neckW, T + 2))} L ${pts(q(S - 4, T - 2))} Q ${pts(q(S + 14, T - 10))} ${pts(q(chest, T - 34))} Q ${pts(q(chest + 2, T * 0.55))} ${pts(q(waist + 1, 30))} L ${pts(q(waist, hemV))} Z`;
    return <path d={path} {...L} fill={fill} />;
  };
  const flutter = Math.sin(frame / 3) * 9 * wind;

  switch (body) {
    case "leader": {
      // Amr: gingham shirt, collar, navy tie, belt
      return (
        <g>
          {shirt(`url(#gingham-${id})`)}
          <path d={`M ${pts(q(-waist - 1, 6))} L ${pts(q(waist + 1, 6))}`} stroke={INK} strokeWidth={sw * 2.4} />
          <rect x={q(0, 6).x - 9} y={q(0, 6).y - 7} width={18} height={14} rx={3} fill="#C9A86A" stroke={INK} strokeWidth={sw * 0.6} />
          {/* tie */}
          <path d={`M ${pts(q(-7, T - 6))} L ${pts(q(7, T - 6))} L ${pts(q(5, T - 20))} L ${pts(q(-5, T - 20))} Z`} {...L} fill={o.accent} strokeWidth={sw * 0.8} />
          <path d={`M ${pts(q(-5, T - 20))} L ${pts(q(-11 + flutter * 0.3, T * 0.32))} L ${pts(q(0 + flutter * 0.6, T * 0.22))} L ${pts(q(11 + flutter * 0.3, T * 0.32))} L ${pts(q(5, T - 20))} Z`} {...L} fill={o.accent} strokeWidth={sw * 0.8} />
          {/* collar */}
          <path d={`M ${pts(q(-neckW - 2, T + 1))} L ${pts(q(-6, T - 16))} L ${pts(q(-2, T - 2))}`} {...L} fill={o.top} strokeWidth={sw * 0.8} />
          <path d={`M ${pts(q(neckW + 2, T + 1))} L ${pts(q(6, T - 16))} L ${pts(q(2, T - 2))}`} {...L} fill={o.top} strokeWidth={sw * 0.8} />
        </g>
      );
    }
    case "genius":
      // Hussein: navy t-shirt with crew neck
      return (
        <g>
          {shirt(o.top)}
          <path d={`M ${pts(q(-neckW - 1, T + 1))} Q ${pts(q(0, T - 16))} ${pts(q(neckW + 1, T + 1))}`} fill="none" stroke="#3A4766" strokeWidth={sw * 1.2} />
          <path d={`M ${pts(q(-waist + 4, hemV + 6))} L ${pts(q(waist - 4, hemV + 6))}`} stroke="#3A4766" strokeWidth={sw * 0.6} />
        </g>
      );
    case "muscle":
      // Ali: knit tee stretched over a big chest
      return (
        <g>
          {shirt(o.top)}
          <path d={`M ${pts(q(-neckW - 1, T + 1))} Q ${pts(q(0, T - 18))} ${pts(q(neckW + 1, T + 1))}`} fill="none" stroke="#B9AC98" strokeWidth={sw * 1.4} />
          <path d={`M ${pts(q(-S + 4, T - 44))} Q ${pts(q(-S * 0.45, T - 70))} ${pts(q(-3, T - 50))}`} fill="none" stroke="#B9AC98" strokeWidth={sw * 0.8} strokeLinecap="round" />
          <path d={`M ${pts(q(S - 4, T - 44))} Q ${pts(q(S * 0.45, T - 70))} ${pts(q(3, T - 50))}`} fill="none" stroke="#B9AC98" strokeWidth={sw * 0.8} strokeLinecap="round" />
          <path d={`M ${pts(q(0, T - 52))} L ${pts(q(0, 40))}`} stroke="#C8BCA9" strokeWidth={sw * 0.5} />
        </g>
      );
    case "boss": {
      // Michael: dark blazer, open white collar
      return (
        <g>
          {shirt(o.top)}
          <path d={`M ${pts(q(-neckW - 1, T + 1))} L ${pts(q(0, T * 0.45))} L ${pts(q(neckW + 1, T + 1))} Z`} fill={o.cuff ?? PAPER} stroke={INK} strokeWidth={sw * 0.8} strokeLinejoin="round" />
          <path d={`M ${pts(q(-neckW - 1, T + 1))} L ${pts(q(-7, T - 18))} L ${pts(q(-2, T - 4))}`} fill={PAPER} stroke={INK} strokeWidth={sw * 0.6} />
          <path d={`M ${pts(q(neckW + 1, T + 1))} L ${pts(q(7, T - 18))} L ${pts(q(2, T - 4))}`} fill={PAPER} stroke={INK} strokeWidth={sw * 0.6} />
          <path d={`M ${pts(q(-neckW - 4, T))} L ${pts(q(-24, T * 0.62))} L ${pts(q(-2, T * 0.42))}`} fill="none" stroke="#5A606B" strokeWidth={sw * 0.8} strokeLinejoin="round" />
          <path d={`M ${pts(q(neckW + 4, T))} L ${pts(q(24, T * 0.62))} L ${pts(q(2, T * 0.42))}`} fill="none" stroke="#5A606B" strokeWidth={sw * 0.8} strokeLinejoin="round" />
          <circle cx={q(0, T * 0.32).x} cy={q(0, T * 0.32).y} r={3.5} fill="#5A606B" />
          <circle cx={q(0, T * 0.16).x} cy={q(0, T * 0.16).y} r={3.5} fill="#5A606B" />
        </g>
      );
    }
    case "money": {
      // Saeed: kandura to the ankles, flaring over the feet
      const sway = Math.sin(frame / 4) * 6 * wind;
      const hemY = Math.min(sk.footL.y, sk.footR.y) - 4;
      const hl = { x: Math.min(sk.footL.x - 18, sk.hip.x - 46) + sway, y: hemY };
      const hr = { x: Math.max(sk.footR.x + 18, sk.hip.x + 46) + sway, y: hemY };
      const robe = `M ${pts(q(-neckW, T + 2))} L ${pts(q(-S + 4, T - 2))} Q ${pts(q(-S - 14, T - 10))} ${pts(q(-chest, T - 34))} Q ${pts(q(-chest - 6, T * 0.3))} ${pts(hl)} Q ${pts({ x: (hl.x + hr.x) / 2, y: hemY + 5 })} ${pts(hr)} Q ${pts(q(chest + 6, T * 0.3))} ${pts(q(chest, T - 34))} Q ${pts(q(S + 14, T - 10))} ${pts(q(S - 4, T - 2))} L ${pts(q(neckW, T + 2))} Q ${pts(q(0, T - 10))} ${pts(q(-neckW, T + 2))} Z`;
      const tA = q(0, T - 6);
      const tB = q(0, T - 70);
      return (
        <g>
          <path d={robe} {...L} fill={o.top} />
          <path d={`M ${pts(q(-10, 0))} Q ${pts(q(-16, -60))} ${pts({ x: hl.x + 30, y: hemY - 2 })}`} fill="none" stroke="#D9D9D9" strokeWidth={sw * 0.6} />
          <path d={`M ${pts(q(12, 0))} Q ${pts(q(18, -60))} ${pts({ x: hr.x - 28, y: hemY - 2 })}`} fill="none" stroke="#D9D9D9" strokeWidth={sw * 0.6} />
          <line x1={tA.x} y1={tA.y} x2={tB.x} y2={tB.y} stroke="#BDBDBD" strokeWidth={sw * 0.7} />
          <path d={`M ${tB.x} ${tB.y} q ${-3 + flutter * 0.2} 20 ${flutter * 0.4} 40`} fill="none" stroke="#9E9E9E" strokeWidth={sw * 1.1} strokeLinecap="round" />
        </g>
      );
    }
    default:
      return shirt(o.top);
  }
};

// ------------------------------------------------------------------- ghutra (Saeed)
/** ghutra cloth falling from the head onto both shoulders (matches the real ghutra in the photo) */
const GhutraDrape: React.FC<{ hc: Pt; r: number; sw: number; wind: number; frame: number; sk: Skeleton }> = ({ hc, r, sw, wind, frame, sk }) => {
  const flap = Math.sin(frame / 3.5) * 12 * wind;
  const flap2 = Math.sin(frame / 3.1 + 1) * 10 * wind;
  const left = `M ${hc.x - r * 0.86} ${hc.y - r * 0.1}
    Q ${hc.x - r * 1.12} ${hc.y + r * 0.7} ${sk.shoulderL.x - 14 + flap} ${sk.shoulderL.y + 46}
    L ${sk.shoulderL.x + 26 + flap * 0.5} ${sk.shoulderL.y + 40}
    Q ${hc.x - r * 0.4} ${hc.y + r * 1.2} ${hc.x - r * 0.42} ${hc.y + r * 0.7} Z`;
  const right = `M ${hc.x + r * 0.86} ${hc.y - r * 0.1}
    Q ${hc.x + r * 1.12} ${hc.y + r * 0.7} ${sk.shoulderR.x + 14 + flap2} ${sk.shoulderR.y + 46}
    L ${sk.shoulderR.x - 26 + flap2 * 0.5} ${sk.shoulderR.y + 40}
    Q ${hc.x + r * 0.4} ${hc.y + r * 1.2} ${hc.x + r * 0.42} ${hc.y + r * 0.7} Z`;
  return (
    <g>
      <path d={left} fill={PAPER} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <path d={right} fill={PAPER} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${hc.x - r * 0.95} ${hc.y + r * 0.4} Q ${hc.x - r * 0.9} ${hc.y + r * 1.0} ${sk.shoulderL.x + 2} ${sk.shoulderL.y + 34}`} fill="none" stroke="#D5D5D5" strokeWidth={sw * 0.6} />
      <path d={`M ${hc.x + r * 0.95} ${hc.y + r * 0.4} Q ${hc.x + r * 0.9} ${hc.y + r * 1.0} ${sk.shoulderR.x - 2} ${sk.shoulderR.y + 34}`} fill="none" stroke="#D5D5D5" strokeWidth={sw * 0.6} />
    </g>
  );
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
      <path
        d={`M ${hc.x - r * 0.78} ${hc.y - r * 0.3} Q ${hc.x - r * 0.8} ${hc.y - r * 0.95} ${hc.x} ${hc.y - r * 0.98} Q ${hc.x + r * 0.8} ${hc.y - r * 0.95} ${hc.x + r * 0.78} ${hc.y - r * 0.3} L ${hc.x + r * 1.0} ${hc.y + r * 1.25} Q ${hc.x} ${hc.y + r * 1.4} ${hc.x - r * 1.0} ${hc.y + r * 1.25} Z`}
        fill={PAPER}
        stroke={INK}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path d={`M ${hc.x - r * 0.25} ${hc.y - r * 0.4} Q ${hc.x - r * 0.35} ${hc.y + r * 0.5} ${hc.x - r * 0.5} ${hc.y + r * 1.2}`} fill="none" stroke="#D5D5D5" strokeWidth={sw * 0.6} />
      <path d={`M ${hc.x + r * 0.25} ${hc.y - r * 0.4} Q ${hc.x + r * 0.35} ${hc.y + r * 0.5} ${hc.x + r * 0.5} ${hc.y + r * 1.2}`} fill="none" stroke="#D5D5D5" strokeWidth={sw * 0.6} />
      <ellipse cx={hc.x} cy={hc.y - r * 0.66} rx={r * 0.7} ry={r * 0.15} fill="none" stroke={INK} strokeWidth={sw * 1.5} />
      <ellipse cx={hc.x} cy={hc.y - r * 0.52} rx={r * 0.76} ry={r * 0.15} fill="none" stroke={INK} strokeWidth={sw * 1.5} />
    </g>
  ) : (
    <g>
      <ellipse cx={hc.x} cy={hc.y} rx={r * 0.72} ry={r * 0.85} fill="#2A2420" stroke={INK} strokeWidth={sw} />
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
  id, x, y, r, expression = "neutral", rotate = 0, goggles = "none", gogglesGlow = 0,
}) => {
  const face = facePath(id, expression);
  const s = r / HEAD_R;
  const sw = STROKE / s;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `rotate(${rotate}deg) scale(${s})`, transformOrigin: "0 0" }}>
      {face && <PhotoHead src={face} hc={{ x: 0, y: 0 }} r={HEAD_R} tilt={0} flip={1} sw={sw} />}
      <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
        <defs>
          <filter id="glowBlur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={10} />
          </filter>
        </defs>
        {!face && <PlaceholderHead id={id} hc={{ x: 0, y: 0 }} r={HEAD_R} sw={sw} expression={expression} flip={1} />}
        {charCfg(id).body === "money" && !face && <GhutraFront hc={{ x: 0, y: 0 }} r={HEAD_R} sw={sw} />}
        {charCfg(id).body === "genius" && goggles !== "none" && (
          <Goggles r={HEAD_R} sw={sw} eyes={[CHARS.faceGeometry.leftEye, CHARS.faceGeometry.rightEye]} mode={goggles} glow={gogglesGlow} />
        )}
      </svg>
    </div>
  );
};
