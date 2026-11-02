// Scene 1 — PLAYTIME, as a split screen of three angled comic panels that slam in on the beat:
//   left   Ali in the gym: dumbbell curls, a rep on every beat
//   centre Amr on a sun lounger at the beach, blowing up a balloon: a breath on every beat
//   right  Hussein with a shisha: a pull on the hose, then the smoke goes into his balloon (alternating beats)
// Every move lands on the beat; the panels punch in on the downbeat.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos, jointScreenPos } from "../characters/Character";
import { POSES, Pose, withIdle } from "../characters/rig";
import { clamp01, popIn, rand } from "../fx/anim";
import { beatClock, beatPhase, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { ACCENT, FONT, GOLD, INK, PAPER, STROKE } from "../theme";
import { W } from "./kit";
import { Dumbbell, LOUNGE_ROT, Lounger, MouthBalloon, Shisha, ShishaHose, Smoke, Umbrella, balloonR, breathsAt, curlPose, loungePose, shishaPose } from "./playtime";
import { Cues, SceneProps } from "./types";

type Who = "ali" | "amr" | "hussein";
export const CAST: Who[] = ["ali", "amr", "hussein"];
export const BALLOON: Record<Who, string> = { ali: ACCENT, amr: "#9EC8EC", hussein: "#5D8FC2" };
export { balloonR };

/** a dance step on the beat, holding a balloon up */
export const dancePose = (frame: number, offset: number): Pose => {
  const clock = beatClock(frame);
  const side = Math.floor(clock) % 2 === 0 ? 1 : -1;
  const m = idleMotion(frame, offset, 1);
  return withIdle({ ...POSES.relaxed, lean: side * 4, hipX: side * 10, rArm: [150 + side * 10, 20], lArm: [-30, -60] }, m);
};

// panel outlines (screen space): slanted gutters for a comic-book split screen
const PANELS: { id: Who; poly: [number, number][]; cx: number; from: 1 | -1; tag: string }[] = [
  { id: "ali", poly: [[0, 0], [652, 0], [612, 1080], [0, 1080]], cx: 310, from: -1, tag: "GYM MODE" },
  { id: "amr", poly: [[672, 0], [1288, 0], [1248, 1080], [632, 1080]], cx: 960, from: 1, tag: "BEACH MODE" },
  { id: "hussein", poly: [[1308, 0], [1920, 0], [1920, 1080], [1268, 1080]], cx: 1610, from: -1, tag: "SHISHA MODE" },
];

export const playCues = (slot: SceneSlot) => {
  const n = Math.max(4, slot.beats.length);
  const beats = Array.from({ length: n }, (_, k) => beatOf(slot, k));
  const enter = [0, 3, 6];
  const punch = slot.downbeats.filter((f) => f > 4);
  const cues: Cues = {
    marks: [
      ...beats.map((f, k) => ({ f, name: `beat ${k + 1}: curl ${k % 2 ? "R" : "L"} · breath · ${k % 2 ? "blow" : "shisha"}` })),
      ...punch.map((f) => ({ f, name: "panels punch in" })),
    ],
    sfx: [
      ...enter.map((f, i) => ({ f, name: "whoosh" as const, volume: 0.35 - i * 0.06 })),
      ...beats.map((f, k) => ({ f, name: (k % 2 ? "puff" : "sip") as "puff" | "sip", volume: 0.3 })),
      ...punch.map((f) => ({ f, name: "tick" as const, volume: 0.35 })),
    ],
    voice: [
      { f: beats[1], id: "ali_rep", sub: true },
      { f: beats[3], id: "amr_beach", sub: true },
      { f: beats[5], id: "hussein_shisha", sub: true },
    ],
  };
  return { beats, enter, punch, cues };
};

// ------------------------------------------------------------------ the three worlds
const Gym: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = Math.exp(-beatPhase(frame) * 5);
  return (
    <W>
      <defs>
        <linearGradient id="gymWall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3A4150" />
          <stop offset="1" stopColor="#252A33" />
        </linearGradient>
      </defs>
      <rect x={-50} y={-50} width={760} height={900} fill="url(#gymWall)" />
      {/* mirror wall with reflections */}
      <rect x={70} y={210} width={480} height={470} rx={8} fill="#55657C" stroke={INK} strokeWidth={STROKE} />
      {[120, 260, 400].map((x) => (
        <path key={x} d={`M ${x} 230 l 70 0 l -100 430 l -70 0 Z`} fill="#FFFFFF" opacity={0.07} />
      ))}
      {/* neon sign */}
      <text x={300} y={176} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} letterSpacing={5} fill="none" stroke={ACCENT} strokeWidth={4} opacity={0.6 + pulse * 0.4} style={{ filter: `drop-shadow(0 0 ${8 + pulse * 10}px ${ACCENT})` }}>
        NO PAIN NO GAIN
      </text>
      {/* dumbbell rack */}
      <rect x={40} y={760} width={560} height={16} rx={6} fill="#5B6270" stroke={INK} strokeWidth={4} />
      {[80, 160, 470, 550].map((x, i) => (
        <g key={x}>
          <Dumbbell x={x} y={744} s={0.62 + (i % 2) * 0.1} color={i % 2 ? "#3D4554" : "#262B34"} />
        </g>
      ))}
      {/* rubber floor */}
      <rect x={-50} y={820} width={760} height={320} fill="#1B1F26" />
      {[0, 1, 2, 3, 4].map((k) => (
        <line key={k} x1={-50} y1={850 + k * 50} x2={710} y2={850 + k * 50} stroke="#2A303A" strokeWidth={3} />
      ))}
      {/* spotlight */}
      <path d="M 250 -20 L 370 -20 L 560 1080 L 60 1080 Z" fill="#FFFFFF" opacity={0.05 + pulse * 0.04} />
    </W>
  );
};

const Beach: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = Math.exp(-beatPhase(frame) * 5);
  return (
    <W>
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7CC8F4" />
          <stop offset="1" stopColor="#DDF2FF" />
        </linearGradient>
        <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2F8FCF" />
          <stop offset="1" stopColor="#6DC1EC" />
        </linearGradient>
      </defs>
      <rect x={600} y={-50} width={720} height={640} fill="url(#sky)" />
      {/* sun pulses on the beat */}
      <circle cx={1170} cy={150} r={70 + pulse * 8} fill="#FFE07A" opacity={0.35} />
      <circle cx={1170} cy={150} r={52 + pulse * 4} fill="#FFD447" stroke={INK} strokeWidth={STROKE} />
      {/* clouds + gull */}
      {[0, 1].map((k) => {
        const cx = 700 + ((frame * (0.6 + k * 0.3) + k * 300) % 700);
        return (
          <g key={k} opacity={0.9}>
            <ellipse cx={cx} cy={120 + k * 90} rx={70} ry={22} fill={PAPER} />
            <ellipse cx={cx + 40} cy={110 + k * 90} rx={40} ry={22} fill={PAPER} />
          </g>
        );
      })}
      <path d={`M ${760 + frame * 1.5} ${260 + Math.sin(frame / 8) * 6} q 16 -14 32 0 q 16 -14 32 0`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      {/* sea with moving wave lines */}
      <rect x={600} y={560} width={720} height={180} fill="url(#sea)" />
      {[0, 1, 2].map((k) => {
        const off = ((frame * (1.2 + k * 0.4)) % 80) - 80;
        return (
          <path
            key={k}
            d={Array.from({ length: 12 }, (_, i) => `${i === 0 ? "M" : "Q"} ${600 + off + i * 80 - 40} ${590 + k * 46 - 10} ${600 + off + i * 80} ${590 + k * 46}`).join(" ")}
            fill="none"
            stroke={PAPER}
            strokeWidth={4}
            opacity={0.55}
          />
        );
      })}
      {/* sand */}
      <path d="M 600 742 Q 900 700 1320 736 L 1320 1130 L 600 1130 Z" fill="#F3DCA8" />
      <path d="M 600 742 Q 900 700 1320 736" fill="none" stroke="#FFFFFF" strokeWidth={10} opacity={0.6} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <circle key={k} cx={660 + rand(k) * 600} cy={800 + rand(k + 9) * 250} r={3} fill="#D9BC80" />
      ))}
      {/* starfish */}
      <path d="M 700 1000 l 10 -24 l 10 24 l 24 2 l -20 14 l 8 24 l -22 -14 l -22 14 l 8 -24 l -20 -14 Z" fill="#F29A6B" stroke={INK} strokeWidth={3} />
    </W>
  );
};

const Lounge: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = Math.exp(-beatPhase(frame) * 5);
  return (
    <W>
      <defs>
        <radialGradient id="loungeWall" cx="0.55" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#7A4A36" />
          <stop offset="1" stopColor="#3B2420" />
        </radialGradient>
      </defs>
      <rect x={1250} y={-50} width={720} height={1200} fill="url(#loungeWall)" />
      {/* arched window with a night skyline */}
      <path d="M 1430 640 L 1430 290 Q 1560 140 1690 290 L 1690 640 Z" fill="#20284A" stroke={INK} strokeWidth={STROKE} />
      {[0, 1, 2, 3, 4].map((k) => (
        <rect key={k} x={1446 + k * 46} y={470 - (k % 3) * 50} width={34} height={180 + (k % 3) * 50} fill="#2E3A66" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
        <rect key={k} x={1452 + (k % 5) * 46} y={500 + Math.floor(k / 5) * 40} width={8} height={10} fill="#FFD27A" opacity={0.8} />
      ))}
      <path d="M 1430 640 L 1430 290 Q 1560 140 1690 290 L 1690 640" fill="none" stroke="#C9A24A" strokeWidth={10} />
      {/* hanging lanterns */}
      {[1360, 1830].map((x, i) => (
        <g key={x} transform={`translate(${x} ${0}) rotate(${Math.sin(frame / 20 + i) * 3} 0 0)`}>
          <line x1={0} y1={-10} x2={0} y2={150} stroke={INK} strokeWidth={4} />
          <circle cx={0} cy={210} r={70 + pulse * 6} fill="#FFC86B" opacity={0.18} />
          <path d="M -30 150 L 30 150 L 40 200 L 22 260 L -22 260 L -40 200 Z" fill="#E7B45A" stroke={INK} strokeWidth={STROKE} />
          <path d="M -18 166 L 18 166 L 24 202 L 12 244 L -12 244 L -24 202 Z" fill="#FFE7A8" opacity={0.85} />
        </g>
      ))}
      {/* majlis cushions + rug */}
      <rect x={1250} y={800} width={720} height={330} fill="#4A2C24" />
      <path d="M 1300 1080 L 1360 900 L 1900 900 L 1950 1080 Z" fill="#8C2F39" stroke={INK} strokeWidth={STROKE} />
      <path d="M 1340 1060 L 1390 920 L 1870 920 L 1915 1060 Z" fill="none" stroke={GOLD} strokeWidth={6} strokeDasharray="18 10" />
      {[1820, 1890].map((x, i) => (
        <rect key={x} x={x - 60} y={700 + i * 30} width={120} height={110} rx={30} fill={i ? "#C9A24A" : "#2E6E6A"} stroke={INK} strokeWidth={STROKE} />
      ))}
    </W>
  );
};

// ------------------------------------------------------------------ scene
const Panel: React.FC<{ poly: [number, number][]; enter: number; from: 1 | -1; frame: number; cam: { x: number; y: number; z: number }; children: React.ReactNode }> = ({ poly, enter, from, frame, cam, children }) => {
  const k = popIn(frame, enter, 300, 22);
  const clip = `polygon(${poly.map(([x, y]) => `${x}px ${y}px`).join(", ")})`;
  return (
    <AbsoluteFill style={{ clipPath: clip, transform: `translateY(${from * (1 - k) * 1150}px)` }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const S01Play: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => playCues(slot), [slot]);
  // each panel: slow push + a punch on the downbeat
  const punch = c.punch.reduce((a, f) => a + (frame >= f ? Math.exp(-(frame - f) / 5) * 0.06 : 0), 0);
  const push = 1 + (frame / slot.durationInFrames) * 0.06;

  // --- Ali
  const aliX = 300;
  const aliS = 1.5;
  const aliG = 1010;
  const aliPose = curlPose(frame, 0.1);
  const hL = jointScreenPos("ali", aliX, aliG, aliS, aliPose, "handL");
  const hR = jointScreenPos("ali", aliX, aliG, aliS, aliPose, "handR");
  const reps = c.beats.filter((f) => frame >= f).length;

  // --- Amr (reclined: rotate around the hips)
  const amrS = 1.3;
  const hip = { x: 958, y: 812 };
  const amrY = hip.y + (148 * 0.99 + 6) * amrS;
  const amrPose = loungePose(frame);
  const amrHead = headScreenPos("amr", hip.x, amrY, amrS, amrPose, false, LOUNGE_ROT);
  const amrMouth = jointScreenPos("amr", hip.x, amrY, amrS, amrPose, "mouth", false, LOUNGE_ROT);
  const amrR = balloonR(breathsAt(frame, c.beats)) * amrS;

  // --- Hussein (sitting on a pouf, shisha on his left)
  const huX = 1650;
  const huS = 1.4;
  const huG = 1010;
  const sh = shishaPose("hussein", frame, 0.4, true);
  const huHead = headScreenPos("hussein", huX, huG, huS, sh.pose);
  const huMouth = jointScreenPos("hussein", huX, huG, huS, sh.pose, "mouth");
  const huL = jointScreenPos("hussein", huX, huG, huS, sh.pose, "handL");
  const huR = jointScreenPos("hussein", huX, huG, huS, sh.pose, "handR");
  const huHip = jointScreenPos("hussein", huX, huG, huS, sh.pose, "hip");
  const blowBeats = c.beats.filter((_, k) => k % 2 === 1);
  const huR0 = balloonR(breathsAt(frame, blowBeats) * 1.6) * huS;
  const smokeIn = clamp01(blowBeats.filter((f) => frame >= f).length / 3);
  const shX = 1440;
  const shS = 0.95;
  const port = { x: shX - 20 * shS, y: huG - 112 * shS };
  const exhale = clamp01(1 - (beatPhase(frame) - 0.05) / 0.4) * (Math.round(beatClock(frame)) % 2 === 1 ? 0 : 1) * (frame > c.beats[0] + 4 ? 1 : 0);

  return (
    <AbsoluteFill style={{ background: INK }}>
      <Panel poly={PANELS[0].poly} enter={c.enter[0]} from={PANELS[0].from} frame={frame} cam={{ x: PANELS[0].cx, y: 620, z: push + punch }}>
        <Gym frame={frame} />
        <Character id="ali" x={aliX} y={aliG} scale={aliS} pose={aliPose} expression="happy" left="none" right="none" frame={frame} />
        <W>
          <Dumbbell x={hL.x} y={hL.y} s={aliS * 0.9} />
          <Dumbbell x={hR.x} y={hR.y} s={aliS * 0.9} />
          {reps > 0 && (
            <g transform={`translate(520 300) scale(${popIn(frame, c.beats[reps - 1], 500, 12)})`}>
              <circle r={62} fill={ACCENT} stroke={INK} strokeWidth={STROKE} />
              <text y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={INK} letterSpacing={3}>
                REPS
              </text>
              <text y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={PAPER} stroke={INK} strokeWidth={6} paintOrder="stroke">
                {reps}
              </text>
            </g>
          )}
        </W>
      </Panel>

      <Panel poly={PANELS[1].poly} enter={c.enter[1]} from={PANELS[1].from} frame={frame} cam={{ x: PANELS[1].cx, y: 620, z: push + punch }}>
        <Beach frame={frame} />
        <W>
          <Umbrella x={1170} ground={968} s={1.0} tilt={-14} />
          <Lounger hip={hip} s={amrS} ground={968} />
        </W>
        <Character id="amr" x={hip.x} y={amrY} scale={amrS} rotate={LOUNGE_ROT} pose={amrPose} expression="happy" left="none" right="none" shadow={false} frame={frame} />
        <W>
          <MouthBalloon mouth={amrMouth} headR={amrHead.r} r={amrR} fill={BALLOON.amr} frame={frame} />
          {/* a cold drink in the sand */}
          <g transform="translate(720 930)">
            <path d="M -18 -60 L 18 -60 L 12 0 L -12 0 Z" fill="#FFB36B" stroke={INK} strokeWidth={4} />
            <line x1={6} y1={-60} x2={20} y2={-92} stroke={INK} strokeWidth={4} />
            <circle cx={-14} cy={-62} r={10} fill="#8DD16B" stroke={INK} strokeWidth={3} />
          </g>
        </W>
      </Panel>

      <Panel poly={PANELS[2].poly} enter={c.enter[2]} from={PANELS[2].from} frame={frame} cam={{ x: PANELS[2].cx, y: 620, z: push + punch }}>
        <Lounge frame={frame} />
        <W>
          <Shisha x={shX} ground={huG} s={shS} glow={0.25 + sh.inhale * 0.75} frame={frame} />
          <ellipse cx={huHip.x} cy={huHip.y + 40} rx={110} ry={46} fill="#2E6E6A" stroke={INK} strokeWidth={STROKE} />
          <ellipse cx={huHip.x} cy={huHip.y + 26} rx={96} ry={22} fill="#3F8A85" />
        </W>
        <Character id="hussein" x={huX} y={huG} scale={huS} pose={sh.pose} expression="happy" left="none" right="none" frame={frame} />
        <W>
          <ShishaHose from={port} to={huL} sag={170} />
          {sh.blow > 0.35 ? (
            <MouthBalloon mouth={huMouth} headR={huHead.r} r={huR0} fill={BALLOON.hussein} frame={frame} smoke={smokeIn} />
          ) : (
            <g>
              <ellipse cx={huR.x + 6} cy={huR.y - huR0 * 1.15} rx={huR0} ry={huR0 * 1.1} fill={BALLOON.hussein} stroke={INK} strokeWidth={STROKE} />
              {smokeIn > 0 && <ellipse cx={huR.x + 6} cy={huR.y - huR0 * 1.15} rx={huR0 * 0.6} ry={huR0 * 0.55} fill="#E7ECF2" opacity={0.45 * smokeIn} />}
              <path d={`M ${huR.x - 2} ${huR.y - 6} l 8 -10 l 8 10 Z`} fill={BALLOON.hussein} stroke={INK} strokeWidth={3} />
            </g>
          )}
          {exhale > 0 && <Smoke frame={frame} x={huMouth.x + 10} y={huMouth.y - 6} amount={exhale * 0.8} spread={0.6} seed={2} />}
          <Smoke frame={frame} x={shX} y={huG - 400 * shS} amount={0.35 + sh.inhale * 0.4} spread={0.5} seed={5} />
        </W>
      </Panel>

      {/* gutters + mode tags */}
      <W>
        {PANELS.map((p, i) => {
          const k = popIn(frame, c.enter[i], 300, 22);
          const t = popIn(frame, c.enter[i] + 8, 420, 14);
          const tx = p.cx - 120;
          return (
            <g key={p.id} transform={`translate(0 ${p.from * (1 - k) * 1150})`}>
              <polygon points={p.poly.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={PAPER} strokeWidth={10} />
              <g transform={`translate(${tx} 44) rotate(-3) scale(${t})`}>
                <rect x={0} y={0} width={240} height={52} rx={10} fill={PAPER} stroke={INK} strokeWidth={4} />
                <rect x={0} y={0} width={14} height={52} rx={4} fill={ACCENT} />
                <text x={128} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} letterSpacing={3} fill={INK}>
                  {p.tag}
                </text>
              </g>
            </g>
          );
        })}
      </W>
      {/* a tiny flash as each panel lands */}
      <AbsoluteFill style={{ background: PAPER, opacity: c.enter.reduce((a, f) => a + (frame >= f + 6 ? Math.exp(-(frame - f - 6) / 2) * 0.12 : 0), 0) }} />
    </AbsoluteFill>
  );
};
