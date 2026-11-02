// Scene 7 — Finale: the three walk back exhausted, Michael: "Great work, guys!",
// HERO SHOT exactly on the biggest drop (low angle, wind, blue rays, slow motion), then the logo.
import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Character, headScreenPos } from "../characters/Character";
import { POSES, lerpPose, walkPose } from "../characters/rig";
import { clamp01, easeInOut, easeOut, lin, popIn, rand } from "../fx/anim";
import { Doodles, Floor, LightRays, SpeechBubble, SpeedLines, Sweat, Svg } from "../fx/Fx";
import { BEAT_FRAMES, beatClock, energyAt, idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { ACCENT, FONT, INK, PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";

const GROUND = 965;

export const finaleCues = (slot: SceneSlot) => {
  const hero = slot.anchors.hero;
  const logo = slot.anchors.logo;
  const pre = slot.beats.filter((b) => b < hero);
  const michael = pre[1] ?? Math.round(hero * 0.25);
  const words = VIDEO.lines.finale.split(" ");
  const chunks = words.length >= 3 ? [words.slice(0, words.length - 2).join(" "), ...words.slice(-2)] : words;
  const speech = chunks.map((_, i) => pre[2 + i] ?? Math.round(michael + (i + 1) * BEAT_FRAMES));
  const lookUp = pre[pre.length - 1] ?? hero - Math.round(BEAT_FRAMES);
  const cues: Cues = {
    marks: [
      { f: 0, name: "walk back (tired)" },
      { f: michael, name: "Michael pops in" },
      ...speech.map((f, i) => ({ f, name: `say "${chunks[i]}"` })),
      { f: lookUp, name: "faces light up" },
      { f: hero, name: "HERO SHOT (biggest drop)" },
      { f: logo, name: "logo" },
    ],
    sfx: [
      { f: michael, name: "pop", volume: 0.45 },
      ...speech.map((f) => ({ f, name: "tick" as const, volume: 0.35 })),
      { f: hero, name: "whoosh", volume: 0.9 },
      { f: hero, name: "sparkle", volume: 0.7 },
      { f: logo, name: "ding", volume: 0.7 },
    ],
  };
  return { hero, logo, michael, chunks, speech, lookUp, cues };
};

const Logo: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const t = frame - at;
  const wipe = lin(t, [0, 10], [0, 1], easeOut);
  const k = popIn(frame, at + 3, 260, 12);
  const draw = lin(t, [4, 22], [1, 0], easeInOut);
  return (
    <AbsoluteFill>
      <Svg>
        <circle cx={960} cy={540} r={wipe * 1200} fill={ACCENT} />
        <circle cx={960} cy={540} r={Math.max(0, wipe * 1200 - 60)} fill={PAPER} />
      </Svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${0.85 + 0.15 * k})`, opacity: clamp01(k * 1.5) }}>
        {VIDEO.brand.logo ? (
          <Img src={staticFile(VIDEO.brand.logo)} style={{ maxWidth: 900, maxHeight: 420, objectFit: "contain" }} />
        ) : (
          // placeholder wordmark — replace via config/video.json → brand.logo
          <div style={{ position: "relative", textAlign: "center", fontFamily: FONT, color: INK }}>
            <div style={{ position: "relative", fontWeight: 900, fontSize: 190, letterSpacing: 6, lineHeight: 1 }}>
              {VIDEO.brand.name.split(" ")[0]?.toUpperCase()}
              <span style={{ color: ACCENT }}> {VIDEO.brand.name.split(" ").slice(1).join(" ").toUpperCase()}</span>
            </div>
            <svg width={900} height={90} viewBox="0 0 900 90" style={{ display: "block", margin: "18px auto 0", overflow: "visible" }}>
              <path
                d="M 30 60 C 200 10, 330 90, 470 45 S 760 0, 870 40"
                fill="none"
                stroke={ACCENT}
                strokeWidth={16}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={draw}
              />
              <path d="M 120 82 C 260 50, 380 100, 520 72" fill="none" stroke={INK} strokeWidth={STROKE} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={draw} />
            </svg>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const S7Finale: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => finaleCues(slot), [slot]);
  const inHero = frame >= c.hero;
  const inLogo = frame >= c.logo;

  // ------------------------------------------------ part A: tired walk + Michael
  const walkT = lin(frame, [0, Math.max(1, c.hero * 0.65)], [0, 1], easeOut);
  const clock = beatClock(frame);
  const happy = frame >= c.lookUp;
  const build = lin(frame, [c.lookUp - BEAT_FRAMES * 3, c.hero], [0, 1], (t) => t * t);

  const partA = (
    <AbsoluteFill style={{ transform: `scale(${1 + build * 0.08})`, transformOrigin: "50% 70%" }}>
      <Svg>
        <Doodles frame={frame} seed={21} />
        <Floor y={GROUND + 6} />
      </Svg>
      {(["amr", "ali", "hussein"] as const).map((id, i) => {
        const tx = 300 + i * 300;
        const x = -260 - (2 - i) * 180 + (tx + 260 + (2 - i) * 180) * walkT;
        const walking = walkT < 0.98;
        const base = happy ? POSES.cheer : POSES.tiredWalk;
        const pose = walking ? walkPose(base, clock / 2 + i * 0.25, 0.7) : happy ? lerpPose(POSES.tiredWalk, POSES.cheer, clamp01((frame - c.lookUp) / 5)) : POSES.tiredWalk;
        const m = idleMotion(frame, i * 0.3, 0.5);
        const h = headScreenPos(id, x, GROUND, 1.2, pose);
        return (
          <React.Fragment key={id}>
            <Character
              id={id}
              x={x}
              y={GROUND - m.y}
              scale={1.2}
              pose={pose}
              expression={happy ? "happy" : id === "ali" ? "shocked" : "tired"}
              headTilt={happy ? m.headTilt : 12 + Math.sin(frame / 8 + i) * 3}
              goggles={id === "hussein" ? "forehead" : undefined}
              left="none"
              frame={frame}
            />
            {!happy && (
              <Svg>
                <Sweat frame={frame + i * 7} x={h.x + h.r * 0.8} y={h.y - h.r * 0.6} />
              </Svg>
            )}
          </React.Fragment>
        );
      })}
      {frame >= c.michael && (
        <Character
          id="michael"
          x={1520 + (1 - popIn(frame, c.michael, 220, 14)) * 500}
          y={GROUND}
          scale={1.2}
          pose={POSES.thumbsUp}
          expression="happy"
          flip
          right="none"
          headTilt={idleMotion(frame, 0.1).headTilt}
          frame={frame}
        />
      )}
      <SpeechBubble frame={frame} x={1250} y={250} chunks={c.chunks} chunkFrames={c.speech} tail="right" hideAt={c.hero - 2} />
    </AbsoluteFill>
  );

  // ------------------------------------------------ part B: hero shot (slow motion)
  const slow = (frame - c.hero) * 0.3 + c.hero; // slow-motion clock
  const heroT = frame - c.hero;
  const push = lin(frame, [c.hero, c.logo], [1, 1.1], easeInOut);
  const flash = inHero ? Math.exp(-heroT / 5) : 0;
  const energy = energyAt(slot.from + frame);
  const heroes = [
    { id: "amr" as const, x: 500, pose: POSES.heroPoint, expr: "happy" as const },
    { id: "ali" as const, x: 960, pose: POSES.heroFlex, expr: "happy" as const },
    { id: "hussein" as const, x: 1420, pose: POSES.hero, expr: "happy" as const },
  ];
  const partB = (
    <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
      <Svg>
        <rect x={0} y={0} width={1920} height={1080} fill="#EAF3FB" />
        <LightRays frame={slow} x={960} y={760} n={18} intensity={0.55 + 0.45 * energy} speed={0.6} />
        <circle cx={960} cy={760} r={260} fill={PAPER} opacity={0.7} />
        <SpeedLines frame={frame} n={22} dir={-1} speed={55} y0={60} y1={980} opacity={0.75} seed={7} />
        {/* floating dust in slow motion */}
        {Array.from({ length: 26 }, (_, i) => {
          const x = (rand(i) * 2100 - (slow * (3 + rand(i * 2) * 4)) % 2100 + 2100) % 2100 - 90;
          const y = 120 + rand(i * 7) * 820 + Math.sin(slow / 9 + i) * 14;
          return <circle key={i} cx={x} cy={y} r={3 + rand(i * 3) * 6} fill={i % 3 ? ACCENT : PAPER} stroke={INK} strokeWidth={2} />;
        })}
      </Svg>
      <AbsoluteFill style={{ transform: `perspective(1300px) rotateX(17deg) scale(${push})`, transformOrigin: "50% 100%" }}>
        <Svg>
          <line x1={-200} x2={2120} y1={1050} y2={1050} stroke={INK} strokeWidth={STROKE} />
        </Svg>
        {heroes.map(({ id, x, pose, expr }, i) => {
          const m = idleMotion(slow, i * 0.4, 0.5);
          const breathe = Math.sin(slow / 10 + i) * 0.015;
          return (
            <Character
              key={id}
              id={id}
              x={x}
              y={1050}
              scale={1.95}
              pose={{ ...pose, head: pose.head + Math.sin(slow / 12 + i) * 3 }}
              expression={expr}
              squashX={1 - breathe}
              squashY={1 + breathe}
              headTilt={m.headTilt * 0.4}
              goggles={id === "hussein" ? "eyes" : undefined}
              gogglesGlow={id === "hussein" ? 0.7 + 0.3 * Math.sin(slow / 4) : 0}
              left={id === "amr" ? "clipboard" : "none"}
              wind={1}
              frame={slow}
            />
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: PAPER, opacity: flash }} />
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {!inHero && partA}
      {inHero && partB}
      {inLogo && <Logo frame={frame} at={c.logo} />}
    </AbsoluteFill>
  );
};
