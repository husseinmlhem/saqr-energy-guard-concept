// Scene 10 — ALI · THE BUILD. At the exhibition hall: Ali lifts the LED-wall crate on the beat
// ("Leave the heavy lifting to me!"), the booth walls slam into place one per beat, he hangs the MA HAWA header,
// and — in the song's quiet bar — switches the booth lights on.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, jointScreenPos } from "../characters/Character";
import { POSES, Pose, lerpPose, withIdle } from "../characters/rig";
import { clamp01, easeIn, easeInOut, easeOut, shake } from "../fx/anim";
import { ImpactLines, Sweat } from "../fx/Fx";
import { beatPhase, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { lineText, voiceFrames } from "../voice";
import { ACCENT, FONT, GOLD, INK, PAPER, STROKE } from "../theme";
import { Chapter, Subtitle, camAt } from "./kit";
import { camTransform } from "../world/Office";
import { Cues, SceneProps } from "./types";
import { LogoSvg } from "../brand/Logo";

const G = 1000;
const AX = 520;
const BOOTH = { x: 880, y: 300, w: 860, h: 640 };

export const aliCues = (slot: SceneSlot) => {
  const lift = beatOf(slot, 0);
  const walls = [1, 2, 3].map((i) => beatOf(slot, i));
  const header = beatOf(slot, 4);
  const wipe = beatOf(slot, 5);
  const lights = beatOf(slot, 6);
  const proud = beatOf(slot, 7);
  const cues: Cues = {
    marks: [{ f: lift, name: "LIFT (LED wall crate)" }, ...walls.map((f, i) => ({ f, name: `booth wall ${i + 1} slams in` })), { f: header, name: "MA HAWA header" }, { f: wipe, name: "wipes forehead" }, { f: lights, name: "LIGHTS ON" }, { f: proud, name: "proud flex" }],
    sfx: [{ f: lift, name: "slam", volume: 0.6 }, ...walls.map((f) => ({ f, name: "stamp" as const, volume: 0.8 })), { f: header, name: "whoosh", volume: 0.5 }, { f: lights, name: "sparkle", volume: 0.9 }, { f: lights, name: "ding", volume: 0.5 }],
    voice: [{ f: lift, id: "ali_lift" }],
  };
  return { lift, walls, header, wipe, lights, proud, cues };
};

const Hall: React.FC<{ frame: number; on: number }> = ({ frame, on }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
    <defs>
      <linearGradient id="hallBg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#1A2130" />
        <stop offset="1" stopColor="#2B3447" />
      </linearGradient>
    </defs>
    <rect x={-900} y={-400} width={3720} height={1100} fill="url(#hallBg)" />
    {/* roof truss */}
    {Array.from({ length: 16 }, (_, i) => (
      <g key={i} stroke="#56627A" strokeWidth={5}>
        <line x1={-600 + i * 220} y1={60} x2={-490 + i * 220} y2={140} />
        <line x1={-490 + i * 220} y1={140} x2={-380 + i * 220} y2={60} />
      </g>
    ))}
    <line x1={-900} x2={2820} y1={60} y2={60} stroke="#56627A" strokeWidth={8} />
    <line x1={-900} x2={2820} y1={140} y2={140} stroke="#56627A" strokeWidth={8} />
    {/* distant booths */}
    {[-200, 120, 1900, 2250].map((x, i) => (
      <g key={i} opacity={0.5}>
        <rect x={x} y={420} width={260} height={280} fill="#33405A" />
        <rect x={x + 30} y={450} width={200} height={40} fill={i % 2 ? GOLD : ACCENT} opacity={0.6} />
      </g>
    ))}
    {/* floor */}
    <rect x={-900} y={700} width={3720} height={900} fill="#3A4356" />
    {Array.from({ length: 20 }, (_, i) => (
      <line key={i} x1={960 + (-1300 + i * 200 - 960) * 0.3} y1={700} x2={-1300 + i * 200} y2={1500} stroke="#465068" strokeWidth={3} />
    ))}
    <line x1={-900} x2={2820} y1={700} y2={700} stroke={INK} strokeWidth={STROKE * 0.6} />
    {/* hanging spots — come alive with the booth */}
    {[1000, 1310, 1620].map((x, i) => (
      <g key={i}>
        <line x1={x} x2={x} y1={140} y2={200} stroke="#56627A" strokeWidth={5} />
        <rect x={x - 22} y={196} width={44} height={34} rx={6} fill="#20262F" stroke={INK} strokeWidth={4} />
        {on > 0 && <path d={`M ${x - 16} 230 L ${x - 160} 900 L ${x + 160} 900 L ${x + 16} 230 Z`} fill="#FFF3C4" opacity={0.16 * on * (0.85 + 0.15 * Math.sin(frame / 5 + i))} />}
      </g>
    ))}
  </svg>
);

export const S10Ali: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => aliCues(slot), [slot]);
  const on = easeOut(clamp01((frame - c.lights) / 6));
  const sh = shake(frame, [c.lift, ...c.walls], 9, 0.45);
  const cam = camAt(frame, [
    [0, { x: 900, y: 560, zoom: 1.04 }],
    [c.header, { x: 1000, y: 550, zoom: 1.0 }],
    [c.lights, { x: 1080, y: 540, zoom: 0.96 }],
    [slot.durationInFrames, { x: 1060, y: 540, zoom: 1.0 }],
  ]);
  cam.x += sh.x;
  cam.y += sh.y;
  const m = idleMotion(frame, 0.3, 0.5);
  // lift: squat just before the beat, up exactly on it
  const liftT = frame < c.lift ? 0 : easeOut(clamp01((frame - c.lift) / 6));
  const squatPre = frame < c.lift ? 0 : 0;
  let pose: Pose = withIdle({ ...POSES.carry, hipY: 30 * (1 - liftT) + 8 + squatPre }, m);
  if (frame >= c.walls[0] - 4) {
    const ph = beatPhase(frame);
    const hammer = 1 - Math.pow(Math.sin(Math.PI * ph), 0.7);
    pose = { ...POSES.hammerUp, rArm: [70 + 70 * (1 - hammer), 20 + 10 * hammer], hipY: 10 * hammer + 4, lArm: [-30, 60] };
  }
  if (frame >= c.header) pose = withIdle({ ...POSES.pointUp, rArm: [160, 6] }, m);
  if (frame >= c.wipe) pose = withIdle({ ...POSES.relaxed, rArm: [150, 70] }, m);
  if (frame >= c.lights - 3) pose = lerpPose(pose, withIdle(POSES.heroFlex, m), easeInOut(clamp01((frame - c.lights + 3) / 8)));
  const hands = { l: jointScreenPos("ali", AX, G, 1.5, pose, "handL"), r: jointScreenPos("ali", AX, G, 1.5, pose, "handR") };
  const crateOn = frame < c.walls[0];
  const crateDown = { x: 760, y: G - 20 };
  const crate = crateOn ? { x: (hands.l.x + hands.r.x) / 2, y: Math.min(hands.l.y, hands.r.y) + 40 } : crateDown;

  const wall = (i: number, x: number, w: number, fill: string) => {
    const t = clamp01((frame - (c.walls[i] - 5)) / 5);
    if (frame < c.walls[i] - 5) return null;
    const y = BOOTH.y + (1 - easeIn(t)) * -900;
    return <rect x={x} y={y} width={w} height={BOOTH.h - 40} fill={fill} stroke={INK} strokeWidth={STROKE} />;
  };
  const hdrT = clamp01((frame - c.header + 4) / 8);
  const swing = frame >= c.header ? Math.sin((frame - c.header) / 3) * 6 * Math.exp(-(frame - c.header) / 10) : 0;

  return (
    <AbsoluteFill style={{ background: "#1A2130" }}>
      <AbsoluteFill style={{ transform: camTransform(cam, 0.9), transformOrigin: "0 0" }}>
        <Hall frame={frame} on={on} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: camTransform(cam, 1), transformOrigin: "0 0" }}>
        <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
          {/* booth plot + walls */}
          <rect x={BOOTH.x - 40} y={BOOTH.y + BOOTH.h - 50} width={BOOTH.w + 80} height={30} fill="#C9CED8" stroke={INK} strokeWidth={STROKE} />
          {wall(0, BOOTH.x, 320, "#1F3B66")}
          {wall(1, BOOTH.x + 320, 320, ACCENT)}
          {wall(2, BOOTH.x + 640, 220, "#5D8FC2")}
          {/* LED wall content once the lights are on */}
          {frame >= c.walls[1] && (
            <g>
              <rect x={BOOTH.x + 360} y={BOOTH.y + 80} width={240} height={150} rx={6} fill={on > 0 ? "#0E2238" : "#2A2D34"} stroke={INK} strokeWidth={STROKE * 0.8} />
              {on > 0 && <circle cx={BOOTH.x + 480 + Math.sin(frame / 8) * 50} cy={BOOTH.y + 155} r={44} fill={ACCENT} opacity={0.7 * on} />}
            </g>
          )}
          {/* counter */}
          {frame >= c.walls[2] && <rect x={BOOTH.x + 120} y={BOOTH.y + 420} width={300} height={130} rx={8} fill={PAPER} stroke={INK} strokeWidth={STROKE} />}
          {/* header sign */}
          {frame >= c.header - 4 && (
            <g transform={`translate(${BOOTH.x + BOOTH.w / 2} ${BOOTH.y - 70 - (1 - easeOut(hdrT)) * 400}) rotate(${swing})`}>
              <line x1={-200} x2={-200} y1={-200} y2={-40} stroke="#56627A" strokeWidth={4} />
              <line x1={200} x2={200} y1={-200} y2={-40} stroke="#56627A" strokeWidth={4} />
              <rect x={-330} y={-62} width={660} height={124} rx={12} fill={on > 0 ? PAPER : "#DCE1E8"} stroke={INK} strokeWidth={STROKE} />
              <LogoSvg x={0} y={0} width={360} anchor="middle" />
            </g>
          )}
          {/* booth glow */}
          {on > 0 && <ellipse cx={BOOTH.x + BOOTH.w / 2} cy={BOOTH.y + BOOTH.h - 40} rx={620} ry={90} fill="#FFF3C4" opacity={0.22 * on} />}
          {c.walls.map((f, i) => (
            <ImpactLines key={i} frame={frame} at={f} x={BOOTH.x + 160 + i * 300} y={BOOTH.y + BOOTH.h - 50} r={150} n={10} />
          ))}
        </svg>
        <Character id="ali" x={AX} y={G} scale={1.5} pose={pose} expression={frame >= c.lights ? "happy" : frame >= c.lift && frame < c.walls[0] ? "shocked" : "neutral"} right={frame >= c.walls[0] - 4 && frame < c.header ? "hammer" : "none"} left="none" headTilt={m.headTilt} frame={frame} />
        <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
          {/* the crate */}
          <g transform={`translate(${crate.x} ${crate.y})`}>
            <rect x={-120} y={-150} width={240} height={150} rx={6} fill="#C99A62" stroke={INK} strokeWidth={STROKE} />
            <path d="M -120 -150 L 120 0 M 120 -150 L -120 0" stroke="#A97C46" strokeWidth={6} />
            <rect x={-80} y={-100} width={160} height={46} fill={PAPER} stroke={INK} strokeWidth={4} />
            <text y={-68} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={INK}>
              LED WALL
            </text>
          </g>
        </svg>
        {frame >= c.wipe && frame < c.lights && (
          <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
            <Sweat frame={frame} x={AX + 70} y={420} n={3} />
          </svg>
        )}
      </AbsoluteFill>
      {/* lights-on bloom */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 50% at 65% 55%, rgba(255,243,196,0.35), rgba(255,243,196,0) 70%)", opacity: on, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: frame >= c.lights ? Math.exp(-(frame - c.lights) / 3) * 0.5 : 0, pointerEvents: "none" }} />
      <Chapter frame={frame} title="ALI" sub="THE BUILD" dark />
      <Subtitle frame={frame} at={c.lift} frames={voiceFrames("ali_lift")} speaker="Ali" text={lineText("ali_lift")} />
    </AbsoluteFill>
  );
};
