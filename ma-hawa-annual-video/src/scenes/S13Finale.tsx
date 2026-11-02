// Scene 11 — Finale.
// Bar 1 (build-up): the three walk back, worn out (Hussein still on his laptop); Michael & Saeed are waiting:
//                   "GREAT WORK, GUYS!" — one word per beat — and they straighten up.
// The biggest drop: HERO SHOT — the whole team, low angle, wind, blue light rays, slow motion; Amr in the centre.
// Then the logo.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos } from "../characters/Character";
import { POSES, Pose, lerpPose, walkPose, withIdle } from "../characters/rig";
import { clamp01, easeInOut, easeOut, lin, popIn, rand } from "../fx/anim";
import { LightRays, SpeedLines, Sweat, Svg } from "../fx/Fx";
import { BEAT_FRAMES, beatClock, energyAt, idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO } from "../sync/timeline";
import { ACCENT, INK, PAPER } from "../theme";
import { Ground } from "./common";
import { CAST } from "./S01Play";
import { Shout, Stage, W, breathe, camAt } from "./kit";
import { Cues, SceneProps } from "./types";
import { LogoBlock } from "../brand/Logo";

export const finaleCues = (slot: SceneSlot) => {
  const hero = slot.anchors.hero;
  const logo = slot.anchors.logo;
  const pre = slot.beats.filter((b) => b < hero);
  const words = VIDEO.lines.finale.split(" ");
  // the line lands in the bar right before the hero shot (the song's break) — one word per beat
  const sayStart = Math.max(1, pre.length - 4);
  const say = words.map((_, i) => pre[Math.min(pre.length - 1, sayStart + i)] ?? Math.round((i + 1) * BEAT_FRAMES));
  const cues: Cues = {
    marks: [{ f: 0, name: "walk back, worn out" }, ...say.map((f, i) => ({ f, name: `"${words[i]}"` })), { f: hero, name: "HERO SHOT — biggest drop" }, { f: logo, name: "logo" }],
    sfx: [{ f: hero, name: "slam" as const, volume: 0.6 }, { f: hero, name: "sparkle" as const, volume: 0.8 }, { f: logo, name: "ding" as const, volume: 0.7 }],
    voice: [{ f: say[0], id: "michael_great" }],
  };
  return { hero, logo, say, words, cues };
};

const Logo: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const t = frame - at;
  const wipe = lin(t, [0, 10], [0, 1], easeOut);
  const k = popIn(frame, at + 3, 260, 12);
  return (
    <AbsoluteFill>
      <Svg>
        <circle cx={960} cy={540} r={wipe * 1200} fill={ACCENT} />
        <circle cx={960} cy={540} r={Math.max(0, wipe * 1200 - 60)} fill={PAPER} />
      </Svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", transform: `scale(${0.85 + 0.15 * k})`, opacity: clamp01(k * 1.5) }}>
        <LogoBlock width={1150} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};


const WX = { ali: 300, amr: 560, hussein: 820 } as const;

export const S13Finale: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => finaleCues(slot), [slot]);
  const inHero = frame >= c.hero;
  const inLogo = frame >= c.logo;
  const clock = beatClock(frame);
  const proud = frame >= c.say[c.say.length - 1];

  // ------------------------------------------------ part A: walk back + "GREAT WORK, GUYS!"
  const camA = breathe(camAt(frame, [[0, { x: 900, y: 560, zoom: 1.0 }], [c.hero, { x: 960, y: 520, zoom: 1.12 }]], ), frame);
  const walkEnd = c.say[0] ?? Math.round(c.hero * 0.5);
  const partA = (
    <Stage cam={camA}>
      {CAST.map((id, i) => {
        const m = idleMotion(frame, i * 0.3, 0.5);
        const startX = WX[id] - 520;
        const t = clamp01(frame / Math.max(1, walkEnd));
        const x = startX + (WX[id] - startX) * t;
        const stride = ((WX[id] - startX) / Math.max(1, walkEnd)) * BEAT_FRAMES / 1.35;
        let pose: Pose = frame < walkEnd ? walkPose(POSES.tired, clock / 2 + i * 0.5, stride, 1, 8) : withIdle(POSES.tired, m);
        if (id === "hussein") pose = { ...pose, rArm: [30, 110], lArm: [-20, 80] };
        if (proud) pose = lerpPose(pose, withIdle(id === "ali" ? POSES.flex : POSES.cheer, m), easeInOut(clamp01((frame - c.say[c.say.length - 1]) / 6)));
        const h = headScreenPos(id, x, 1000, 1.35, pose);
        return (
          <React.Fragment key={id}>
            <Character id={id} x={x} y={1000} scale={1.35} pose={pose} expression={proud ? "happy" : id === "ali" ? "shocked" : "tired"} headTilt={proud ? m.headTilt : 8} right={id === "hussein" && !proud ? "laptop" : "none"} left="none" frame={frame} />
            {!proud && (
              <W>
                <Sweat frame={frame + i * 7} x={h.x + h.r * 0.7} y={h.y - h.r * 0.5} />
              </W>
            )}
          </React.Fragment>
        );
      })}
      <Character id="michael" x={1380} y={1000} scale={1.35} pose={withIdle(frame >= c.say[0] ? POSES.thumbsUp : POSES.hipsHands, idleMotion(frame, 0.1, 0.5))} expression="happy" flip right="none" frame={frame} />
      <Character id="saeed" x={1640} y={1000} scale={1.35} pose={withIdle(POSES.sip, idleMotion(frame, 0.4, 0.4))} expression="neutral" flip frame={frame} />
    </Stage>
  );

  // ------------------------------------------------ part B: hero shot (slow motion, low angle)
  const slow = (frame - c.hero) * 0.3 + c.hero;
  const heroT = frame - c.hero;
  const push = lin(frame, [c.hero, c.logo], [1, 1.08], easeInOut);
  const flash = inHero ? Math.exp(-heroT / 5) : 0;
  const energy = energyAt(slot.from + frame);
  const back = [
    { id: "michael" as const, x: 690, s: 1.5, y: 880 },
    { id: "saeed" as const, x: 1270, s: 1.5, y: 840 },
  ];
  const front = [
    { id: "ali" as const, x: 430, s: 1.85, pose: POSES.heroFlex },
    { id: "hussein" as const, x: 1490, s: 1.85, pose: POSES.hero },
    { id: "amr" as const, x: 960, s: 2.08, pose: POSES.heroPoint },
  ];
  const partB = (
    <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
      <Svg>
        <rect x={0} y={0} width={1920} height={1080} fill="#EAF3FB" />
        <LightRays frame={slow} x={960} y={700} n={18} intensity={0.55 + 0.45 * energy} speed={0.6} />
        <circle cx={960} cy={700} r={300} fill={PAPER} opacity={0.6} />
        <SpeedLines frame={frame} n={22} dir={-1} speed={55} y0={60} y1={980} opacity={0.55} seed={7} />
        {Array.from({ length: 26 }, (_, i) => {
          const x = (rand(i) * 2100 - (slow * (3 + rand(i * 2) * 4)) % 2100 + 2100) % 2100 - 90;
          const y = 120 + rand(i * 7) * 820 + Math.sin(slow / 9 + i) * 14;
          return <circle key={i} cx={x} cy={y} r={3 + rand(i * 3) * 6} fill={i % 3 ? ACCENT : PAPER} stroke={INK} strokeWidth={2} />;
        })}
      </Svg>
      <AbsoluteFill style={{ transform: `perspective(1300px) rotateX(14deg) scale(${push})`, transformOrigin: "50% 100%" }}>
        <Ground y={1062} color="#DCE8F5" />
        {back.map(({ id, x, s, y }, i) => (
          <Character key={id} id={id} x={x} y={y} scale={s} pose={withIdle(id === "michael" ? POSES.cheer : POSES.sip, idleMotion(slow, i, 0.3))} expression={id === "michael" ? "happy" : "neutral"} wind={1} frame={slow} right={id === "michael" ? "none" : undefined} />
        ))}
        {front.map(({ id, x, s, pose }, i) => {
          const m = idleMotion(slow, i * 0.4, 0.35);
          return (
            <Character key={id} id={id} x={x} y={1062} scale={s} pose={withIdle({ ...pose, head: pose.head + Math.sin(slow / 12 + i) * 2 }, m)} expression="happy" headTilt={m.headTilt * 0.4} left={id === "amr" ? "clipboard" : "none"} wind={1} frame={slow} />
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: PAPER, opacity: flash }} />
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {!inHero && partA}
      {!inHero && (
        // one word per line, over the right-hand window — clear of the logo wall, right above Michael
        <Shout frame={frame} x={1600} y={182} size={108} speaker="MICHAEL" lines={c.words.map((w, i) => [{ text: w, at: c.say[i] }])} />
      )}
      {inHero && partB}
      {inLogo && <Logo frame={frame} at={c.logo} />}
    </AbsoluteFill>
  );
};
