// Scene 7 — Finale: the three walk back exhausted, Michael: "Great work, guys!",
// HERO SHOT exactly on the biggest drop (low angle, wind, blue rays, slow motion), then the logo.
import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Character, headScreenPos } from "../characters/Character";
import { POSES, Pose, lerpPose, walkPose, withIdle } from "../characters/rig";
import { clamp01, easeInOut, easeOut, lin, popIn, rand } from "../fx/anim";
import { Doodles, LightRays, SpeechBubble, SpeedLines, Sweat, Svg } from "../fx/Fx";
import { Ground } from "./common";
import { BEAT_FRAMES, beatClock, energyAt, idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { ACCENT, FONT, INK, PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";


export const finaleCues = (slot: SceneSlot) => {
  const hero = slot.anchors.hero;
  const logo = slot.anchors.logo;
  const pre = slot.beats.filter((b) => b < hero);
  const words = VIDEO.lines.finale.split(" ");
  const chunks = words.length >= 3 ? [words.slice(0, words.length - 2).join(" "), ...words.slice(-2)] : words;
  // walk in, Michael appears, says his line one chunk per beat, faces light up on the last beat before the drop
  const speechStart = Math.max(2, pre.length - 1 - chunks.length);
  const michael = pre[speechStart - 1] ?? Math.round(hero * 0.4);
  const speech = chunks.map((_, i) => pre[speechStart + i] ?? Math.round(michael + (i + 1) * BEAT_FRAMES));
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

  // ------------------------------------------------ part A: tired walk back + Michael
  // they walk in from the left, one step per beat, shoulders down; Amr in the middle
  const clock = beatClock(frame);
  const happy = frame >= c.lookUp;
  const walkEnd = c.speech[0] ?? Math.round(c.hero * 0.6);
  const build = lin(frame, [c.lookUp - BEAT_FRAMES * 3, c.hero], [0, 1], (t) => t * t);
  const SA = 1.4;
  const GA = 1040;
  const walkers = [
    { id: "ali" as const, tx: 330 },
    { id: "amr" as const, tx: 640 },
    { id: "hussein" as const, tx: 950 },
  ];

  const partA = (
    <AbsoluteFill style={{ transform: `scale(${1 + build * 0.07})`, transformOrigin: "50% 75%" }}>
      <Svg>
        <Doodles frame={frame} seed={21} />
      </Svg>
      <Ground y={GA} />
      {walkers.map(({ id, tx }, i) => {
        const startX = tx - 900;
        const t = clamp01(frame / Math.max(1, walkEnd));
        const x = startX + (tx - startX) * t; // constant speed while walking (no ease = no foot sliding)
        const walking = frame < walkEnd;
        const m = idleMotion(frame, i * 0.3, 0.5);
        const stride = ((tx - startX) / Math.max(1, walkEnd)) * BEAT_FRAMES / SA; // one step per beat
        let pose: Pose = walking ? walkPose(POSES.tired, clock / 2 + i * 0.5, stride, 1, 10) : withIdle(POSES.tired, m);
        if (happy) pose = lerpPose(withIdle(POSES.tired, m), withIdle(POSES.cheer, m), clamp01((frame - c.lookUp) / 8));
        const h = headScreenPos(id, x, GA, SA, pose);
        return (
          <React.Fragment key={id}>
            <Character
              id={id}
              x={x}
              y={GA}
              scale={SA}
              pose={pose}
              expression={happy ? "happy" : id === "ali" ? "shocked" : "tired"}
              headTilt={happy ? m.headTilt : 8 + Math.sin(frame / 9 + i) * 2}
              goggles={id === "hussein" ? "forehead" : undefined}
              left="none"
              frame={frame}
            />
            {!happy && (
              <Svg>
                <Sweat frame={frame + i * 7} x={h.x + h.r * 0.7} y={h.y - h.r * 0.5} />
              </Svg>
            )}
          </React.Fragment>
        );
      })}
      {frame >= c.michael && (
        <Character
          id="michael"
          x={1560 + (1 - popIn(frame, c.michael, 160, 18)) * 500}
          y={GA}
          scale={SA}
          pose={withIdle(POSES.thumbsUp, idleMotion(frame, 0.1, 0.5))}
          expression="happy"
          flip
          right="none"
          headTilt={idleMotion(frame, 0.1).headTilt}
          frame={frame}
        />
      )}
      <SpeechBubble frame={frame} x={1290} y={230} chunks={c.chunks} chunkFrames={c.speech} tail="right" hideAt={c.hero - 2} />
    </AbsoluteFill>
  );

  // ------------------------------------------------ part B: hero shot (slow motion, low angle)
  const slow = (frame - c.hero) * 0.3 + c.hero; // slow-motion clock
  const heroT = frame - c.hero;
  const push = lin(frame, [c.hero, c.logo], [1, 1.08], easeInOut);
  const flash = inHero ? Math.exp(-heroT / 5) : 0;
  const energy = energyAt(slot.from + frame);
  // Amr in the centre, slightly forward and bigger
  const heroes = [
    { id: "ali" as const, x: 440, s: 1.9, pose: POSES.heroFlex },
    { id: "hussein" as const, x: 1480, s: 1.9, pose: POSES.hero },
    { id: "amr" as const, x: 960, s: 2.12, pose: POSES.heroPoint },
  ];
  const partB = (
    <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
      <Svg>
        <rect x={0} y={0} width={1920} height={1080} fill="#EAF3FB" />
        <LightRays frame={slow} x={960} y={720} n={18} intensity={0.55 + 0.45 * energy} speed={0.6} />
        <circle cx={960} cy={720} r={280} fill={PAPER} opacity={0.6} />
        <SpeedLines frame={frame} n={22} dir={-1} speed={55} y0={60} y1={980} opacity={0.6} seed={7} />
        {Array.from({ length: 26 }, (_, i) => {
          const x = (rand(i) * 2100 - (slow * (3 + rand(i * 2) * 4)) % 2100 + 2100) % 2100 - 90;
          const y = 120 + rand(i * 7) * 820 + Math.sin(slow / 9 + i) * 14;
          return <circle key={i} cx={x} cy={y} r={3 + rand(i * 3) * 6} fill={i % 3 ? ACCENT : PAPER} stroke={INK} strokeWidth={2} />;
        })}
      </Svg>
      <AbsoluteFill style={{ transform: `perspective(1300px) rotateX(14deg) scale(${push})`, transformOrigin: "50% 100%" }}>
        <Ground y={1062} color="#DCE8F5" />
        {heroes.map(({ id, x, s, pose }, i) => {
          const m = idleMotion(slow, i * 0.4, 0.35);
          return (
            <Character
              key={id}
              id={id}
              x={x}
              y={1062}
              scale={s}
              pose={withIdle({ ...pose, head: pose.head + Math.sin(slow / 12 + i) * 2 }, m)}
              expression="happy"
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
