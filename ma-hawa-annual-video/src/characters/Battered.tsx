// "We went through hell for this": cartoon wear and tear drawn over a character (screen space).
// Torn shoes with a flapping sole and toes poking out, ripped tee and trousers, dirt, band-aids,
// scratches with little blood drips, and a black eye for one of them. level 1 = full (walking back),
// level 0.5 = proud scars only (hero shot: band-aids, torn shoes, rips — no dripping).
import React from "react";
import { rand } from "../fx/anim";
import { INK, PAPER, STROKE } from "../theme";
import { headScreenPos, jointScreenPos } from "./Character";
import { CharId, CHARS, outfitOf } from "./config";
import { Pose } from "./rig";

const BLOOD = "#C8202F";

const BandAid: React.FC<{ x: number; y: number; s: number; rot: number }> = ({ x, y, s, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {[0, 90].map((r) => (
      <g key={r} transform={`rotate(${r + 45})`}>
        <rect x={-30} y={-8} width={60} height={16} rx={7} fill="#E8C49A" stroke={INK} strokeWidth={2.5} />
        <rect x={-9} y={-6} width={18} height={12} rx={3} fill="#F3DCC0" />
        {[-20, 20].map((dx) => (
          <circle key={dx} cx={dx} cy={0} r={1.4} fill="#B89470" />
        ))}
      </g>
    ))}
  </g>
);

/** a drop that forms at (x, y) and falls every `period` frames */
const Drip: React.FC<{ x: number; y: number; frame: number; s: number; seed: number; period?: number }> = ({ x, y, frame, s, seed, period = 26 }) => {
  const t = ((frame + seed * 11) % period) / period;
  const fall = t < 0.45 ? 0 : (t - 0.45) * (t - 0.45) * 420 * s;
  const grow = Math.min(1, t / 0.45);
  return (
    <g>
      <path d={`M ${x} ${y} q ${-2 * s} ${8 * s} 0 ${12 * s} q ${2 * s} ${-4 * s} 0 ${-12 * s}`} fill={BLOOD} />
      <circle cx={x} cy={y + 12 * s + fall} r={(2.2 + 2.6 * grow) * s} fill={BLOOD} opacity={t > 0.95 ? 0 : 1} />
    </g>
  );
};

const Scratch: React.FC<{ x: number; y: number; s: number; rot: number }> = ({ x, y, s, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {[-5, 0, 5].map((dy) => (
      <line key={dy} x1={-14} y1={dy} x2={14} y2={dy - 3} stroke={BLOOD} strokeWidth={2.6} strokeLinecap="round" />
    ))}
  </g>
);

/** jagged rip in a garment: shows what's underneath */
const Rip: React.FC<{ x: number; y: number; s: number; under: string; w?: number; rot?: number }> = ({ x, y, s, under, w = 26, rot = 0 }) => {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    const r = (i % 2 ? 0.55 : 1) * w;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r * 0.6).toFixed(1)}`;
  }).join(" ");
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <polygon points={pts} fill={under} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
    </g>
  );
};

export const Battered: React.FC<{ id: CharId; x: number; y: number; scale: number; pose: Pose; frame: number; level?: number; flip?: boolean; seed?: number }> = ({ id, x, y, scale: s, pose, frame, level = 1, flip = false, seed = 0 }) => {
  const o = outfitOf(id);
  const J = (j: Parameters<typeof jointScreenPos>[5]) => jointScreenPos(id, x, y, s, pose, j, flip);
  const head = headScreenPos(id, x, y, s, pose, flip);
  const fL = J("footL");
  const fR = J("footR");
  const kL = J("kneeL");
  const kR = J("kneeR");
  const hip = J("hip");
  const neck = J("neck");
  const elR = J("elbowR");
  const big = CHARS.characters[id].body === "muscle";
  const L = (big ? 44 : 38) * s;
  const flap = Math.sin(frame / 3 + seed) * 10;
  const full = level >= 1;
  const eye = CHARS.faceGeometry.leftEye;
  return (
    <g>
      {/* torn shoes: the sole hangs off the front, toes poke out */}
      {[
        { f: fL, side: -1 },
        { f: fR, side: 1 },
      ].map(({ f, side }, k) => {
        const toe = { x: f.x + side * (L - 10 * s), y: f.y + 6 * s };
        return (
          <g key={k}>
            <g transform={`translate(${toe.x - side * 26 * s} ${toe.y}) rotate(${side * (8 + flap * (k ? 1 : -0.6))})`}>
              <path d={`M 0 0 L ${side * 30 * s} ${2 * s} L ${side * 28 * s} ${7 * s} L 0 ${6 * s} Z`} fill="#2A2522" stroke={INK} strokeWidth={STROKE * 0.5} />
            </g>
            {[0, 1, 2].map((t) => (
              <circle key={t} cx={toe.x - side * (4 + t * 7) * s} cy={toe.y - (3 + (t % 2) * 2) * s} r={4.2 * s} fill={o.skin} stroke={INK} strokeWidth={STROKE * 0.35} />
            ))}
          </g>
        );
      })}
      {/* ripped trousers at a knee, with a scrape */}
      <Rip x={(k => k.x)(seed % 2 ? kL : kR)} y={(seed % 2 ? kL : kR).y} s={s} under={o.skin} w={15} rot={-10} />
      <Scratch x={(seed % 2 ? kL : kR).x} y={(seed % 2 ? kL : kR).y} s={s * 0.55} rot={-20} />
      {full && <Drip x={(seed % 2 ? kL : kR).x + 4 * s} y={(seed % 2 ? kL : kR).y + 6 * s} frame={frame} s={s * 0.8} seed={seed} period={32} />}
      {/* ripped, dirty tee */}
      <Rip x={hip.x + (seed % 2 ? 26 : -24) * s} y={hip.y - 30 * s} s={s} under={o.skin} w={13} rot={20} />
      <Rip x={neck.x + (seed % 2 ? -30 : 34) * s} y={neck.y + 22 * s} s={s} under={o.skin} w={9} rot={-30} />
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={hip.x + (rand(seed * 7 + i) - 0.5) * 70 * s} cy={hip.y - (20 + rand(seed + i * 3) * 80) * s} rx={(6 + rand(i + seed) * 6) * s} ry={(4 + rand(i * 2 + seed) * 3) * s} fill="#7A5A3A" opacity={0.35} />
      ))}
      {/* scratched arm */}
      <Scratch x={elR.x} y={elR.y} s={s * 0.5} rot={30} />
      {full && <Drip x={elR.x} y={elR.y + 4 * s} frame={frame} s={s * 0.7} seed={seed + 3} period={28} />}
      {/* band-aids on the head, a scratch with a drip on the cheek */}
      <BandAid x={head.x + (seed % 2 ? 0.35 : -0.38) * head.r} y={head.y - 0.52 * head.r} s={head.r / 95} rot={seed * 17} />
      <Scratch x={head.x + (seed % 2 ? -0.42 : 0.44) * head.r} y={head.y + 0.22 * head.r} s={head.r / 120} rot={-25} />
      {full && <Drip x={head.x + (seed % 2 ? -0.38 : 0.46) * head.r} y={head.y + 0.3 * head.r} frame={frame} s={head.r / 110} seed={seed + 5} period={30} />}
      {/* black eye for one of them */}
      {seed === 0 && <ellipse cx={head.x + (eye[0] - 0.5) * 2 * head.r} cy={head.y + (eye[1] - 0.5) * 2 * head.r} rx={head.r * 0.16} ry={head.r * 0.12} fill="#4A2E6E" opacity={0.42} />}
      {/* the odd fly circling the most beaten-up one */}
      {full && seed === 2 && (
        <g transform={`translate(${head.x + Math.cos(frame / 4) * head.r * 1.2} ${head.y - head.r * 1.1 + Math.sin(frame / 3) * 14})`}>
          <ellipse rx={4} ry={3} fill={INK} />
          <ellipse cx={-3} cy={-4} rx={4} ry={2.5} fill={PAPER} opacity={0.8} />
          <ellipse cx={3} cy={-4} rx={4} ry={2.5} fill={PAPER} opacity={0.8} />
        </g>
      )}
    </g>
  );
};
