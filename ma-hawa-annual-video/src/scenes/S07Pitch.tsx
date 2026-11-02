// Scene 7 — The pitch: over-the-shoulder from Michael. Hussein drives the deck with the clicker
// (one slide per beat), Amr in the middle of the team. Michael: "EXCELLENT! MAKE IT HAPPEN!"
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character } from "../characters/Character";
import { POSES, Pose, lerpPose, withIdle } from "../characters/rig";
import { clamp01, easeInOut, easeOut, popIn, rand } from "../fx/anim";
import { BEAT_FRAMES, idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { ACCENT, FONT, GOLD, INK, PAPER, STROKE } from "../theme";
import { CAST } from "./S01Pump";
import { Shout, Stage, W, breathe, camAt } from "./kit";
import { Cues, SceneProps } from "./types";

const X = { ali: 190, amr: 420, hussein: 660 } as const;
const G = 1000;
const SCR = { x: 770, y: 70, w: 1040, h: 585 };

const Slide: React.FC<{ kind: string; title: string; i: number; n: number; frame: number }> = ({ kind, title, i, n, frame }) => {
  const { w, h } = SCR;
  const dark = kind === "title" || kind === "stage";
  const bg = dark ? "#0E2238" : "#F7FAFD";
  const fg = dark ? PAPER : INK;
  return (
    <g>
      <rect width={w} height={h} fill={bg} />
      <rect width={w} height={8} fill={ACCENT} />
      <text x={40} y={72} fontFamily={FONT} fontWeight={900} fontSize={kind === "title" ? 0 : 48} fill={fg}>
        {title}
      </text>
      <text x={w - 40} y={h - 26} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={20} fill={dark ? "#9AB" : "#8893A6"}>
        {`MA HAWA · ${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`}
      </text>
      {kind === "title" && (
        <g>
          <circle cx={w * 0.78} cy={h * 0.45} r={190} fill={ACCENT} opacity={0.25} />
          <circle cx={w * 0.84} cy={h * 0.38} r={90} fill={GOLD} opacity={0.6} />
          <text x={60} y={h * 0.5} fontFamily={FONT} fontWeight={900} fontSize={96} fill={PAPER}>
            THE BIG
          </text>
          <text x={60} y={h * 0.5 + 100} fontFamily={FONT} fontWeight={900} fontSize={96} fill={ACCENT}>
            IDEA
          </text>
          <path d="M 64 410 C 180 380, 260 440, 380 400" fill="none" stroke={ACCENT} strokeWidth={10} strokeLinecap="round" />
        </g>
      )}
      {kind === "booth" && (
        <g transform={`translate(${w / 2} ${h * 0.62})`}>
          <polygon points="-330,40 0,150 330,40 0,-70" fill="#DCE4EE" stroke={INK} strokeWidth={4} />
          <polygon points="-330,40 -330,-190 0,-300 0,-70" fill="#1F3B66" stroke={INK} strokeWidth={4} />
          <polygon points="0,-70 0,-300 330,-190 330,40" fill={ACCENT} stroke={INK} strokeWidth={4} />
          <text x={-170} y={-150} fontFamily={FONT} fontWeight={900} fontSize={40} fill={PAPER} transform="skewY(18) translate(0 40)">
            MA HAWA
          </text>
          <polygon points="80,-220 260,-160 260,-60 80,-120" fill="#0E2238" stroke={INK} strokeWidth={4} />
          <polygon points="90,-205 250,-152 250,-70 90,-123" fill={`hsl(${(frame * 4) % 360} 60% 60%)`} opacity={0.7} />
          <polygon points="-120,40 -40,66 -40,6 -120,-20" fill={PAPER} stroke={INK} strokeWidth={4} />
          {[-260, -60, 140].map((x, k) => (
            <path key={k} d={`M ${x} -300 L ${x - 40} 60 L ${x + 60} 60 Z`} fill={GOLD} opacity={0.12 + 0.08 * Math.sin(frame / 6 + k)} />
          ))}
        </g>
      )}
      {kind === "interactive" && (
        <g>
          <rect x={w * 0.25} y={h * 0.2} width={w * 0.5} height={h * 0.6} rx={18} fill="#0E2238" stroke={INK} strokeWidth={5} />
          {[0, 1, 2].map((k) => {
            const t = ((frame / 20 + k / 3) % 1);
            return <circle key={k} cx={w * 0.52} cy={h * 0.5} r={30 + t * 140} fill="none" stroke={ACCENT} strokeWidth={6} opacity={1 - t} />;
          })}
          {Array.from({ length: 14 }, (_, k) => (
            <circle key={k} cx={w * 0.3 + rand(k) * w * 0.4} cy={h * 0.25 + rand(k * 3) * h * 0.5} r={4 + rand(k * 5) * 6} fill={k % 2 ? GOLD : PAPER} />
          ))}
          <path d={`M ${w * 0.55} ${h * 0.54} l 0 -70 q 0 -14 14 -14 q 14 0 14 14 l 0 40 l 30 6 q 16 4 14 22 l -8 60 l -70 0 l -26 -40 q -8 -14 6 -18 q 10 -2 18 8 Z`} fill="#F1D3B8" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>
      )}
      {kind === "stage" && (
        <g>
          {[0.2, 0.4, 0.6, 0.8].map((x, k) => (
            <path key={k} d={`M ${w * x} 90 L ${w * x - 120 + Math.sin(frame / 8 + k) * 60} ${h * 0.7} L ${w * x + 120 + Math.sin(frame / 8 + k) * 60} ${h * 0.7} Z`} fill={k % 2 ? ACCENT : GOLD} opacity={0.35} />
          ))}
          <rect x={w * 0.12} y={h * 0.62} width={w * 0.76} height={40} fill="#1F3B66" stroke={PAPER} strokeWidth={3} />
          {Array.from({ length: 26 }, (_, k) => (
            <circle key={k} cx={30 + k * 40} cy={h * 0.9 + Math.sin(frame / 4 + k) * 6} r={22} fill="#05101F" />
          ))}
          <text x={40} y={72} fontFamily={FONT} fontWeight={900} fontSize={48} fill={PAPER}>
            {title}
          </text>
        </g>
      )}
      {kind === "chart" && (
        <g>
          {Array.from({ length: 7 }, (_, k) => {
            const hh = 60 + k * 50 + rand(k) * 30;
            return <rect key={k} x={120 + k * 120} y={h * 0.85 - hh} width={70} height={hh} rx={6} fill={k === 6 ? GOLD : ACCENT} stroke={INK} strokeWidth={4} />;
          })}
          <path d={`M 140 ${h * 0.7} L 400 ${h * 0.55} L 640 ${h * 0.45} L 920 ${h * 0.18}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <path d={`M 880 ${h * 0.16} L 930 ${h * 0.17} L 912 ${h * 0.24}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {kind === "impact" && (
        <g>
          <circle cx={w * 0.3} cy={h * 0.55} r={130} fill="#3FBF6F" stroke={INK} strokeWidth={6} />
          <path d={`M ${w * 0.3 - 60} ${h * 0.55} l 45 45 l 85 -95`} fill="none" stroke={PAPER} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
          <text x={w * 0.5} y={h * 0.5} fontFamily={FONT} fontWeight={900} fontSize={64} fill={INK}>
            READY TO
          </text>
          <text x={w * 0.5} y={h * 0.5 + 76} fontFamily={FONT} fontWeight={900} fontSize={64} fill={ACCENT}>
            LAUNCH
          </text>
        </g>
      )}
    </g>
  );
};

export const pitchCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const slides = VIDEO.pitchSlides.map((_, i) => beatOf(slot, Math.min(i, n - 3)));
  const ok = [beatOf(slot, n - 2), beatOf(slot, n - 1), Math.round(beatOf(slot, n - 1) + BEAT_FRAMES / 2)];
  const cues: Cues = {
    marks: [...slides.map((f, i) => ({ f, name: `slide: ${VIDEO.pitchSlides[i].title}` })), { f: ok[0], name: "EXCELLENT!" }, { f: ok[1], name: "MAKE IT HAPPEN!" }],
    sfx: [...slides.map((f) => ({ f, name: "tick" as const, volume: 0.6 })), { f: ok[0], name: "ding" as const, volume: 0.8 }, { f: ok[1], name: "sparkle" as const, volume: 0.8 }],
  };
  return { slides, ok, cues };
};

export const S07Pitch: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => pitchCues(slot), [slot]);
  const cur = Math.max(0, c.slides.filter((f) => frame >= f).length - 1);
  const slideIn = easeOut(clamp01((frame - c.slides[cur]) / 5));
  const cam = breathe(
    camAt(frame, [
      [0, { x: 1040, y: 470, zoom: 1.12 }],
      [c.ok[0], { x: 1000, y: 500, zoom: 1.02 }],
      [slot.durationInFrames, { x: 960, y: 520, zoom: 0.98 }],
    ]),
    frame,
    0.6,
  );
  const approve = frame >= c.ok[0];
  const mm = idleMotion(frame, 0.2, 0.4);
  const mPose: Pose = approve ? lerpPose(withIdle(POSES.armsCrossed, mm), { ...POSES.cheer, lArm: [-14, -8] }, easeInOut(clamp01((frame - c.ok[0]) / 6))) : withIdle(POSES.armsCrossed, mm);

  return (
    <AbsoluteFill>
      <Stage cam={cam} variant="meeting">
        <W>
          {/* wall screen */}
          <rect x={SCR.x - 16} y={SCR.y - 16} width={SCR.w + 32} height={SCR.h + 32} rx={10} fill="#15161A" stroke={INK} strokeWidth={STROKE} />
          <svg x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} viewBox={`0 0 ${SCR.w} ${SCR.h}`} overflow="hidden">
            {cur > 0 && <Slide kind={VIDEO.pitchSlides[cur - 1].kind} title={VIDEO.pitchSlides[cur - 1].title} i={cur - 1} n={c.slides.length} frame={frame} />}
            <g transform={`translate(${(1 - slideIn) * SCR.w} 0)`}>
              <Slide kind={VIDEO.pitchSlides[cur].kind} title={VIDEO.pitchSlides[cur].title} i={cur} n={c.slides.length} frame={frame} />
            </g>
          </svg>
          {approve && <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill="#0B1220" opacity={0.55 * clamp01((frame - c.ok[0]) / 4)} />}
          <rect x={SCR.x + SCR.w / 2 - 120} y={SCR.y + SCR.h + 16} width={240} height={14} fill="#3B3F48" />
          <ellipse cx={SCR.x + SCR.w / 2} cy={SCR.y + SCR.h / 2} rx={SCR.w * 0.6} ry={SCR.h * 0.7} fill={ACCENT} opacity={0.06} />
        </W>
        {CAST.map((id, i) => {
          const m = idleMotion(frame, i * 0.3, 0.5);
          const click = c.slides.some((f) => frame >= f - 3 && frame < f + 4);
          let pose: Pose = withIdle(POSES.relaxed, m);
          if (id === "hussein") pose = withIdle({ ...POSES.presentPoint, rArm: [112 + (click ? -8 : 0), -6], lArm: [-24, -60] }, m);
          if (id === "amr") pose = withIdle(POSES.clipboard, m);
          if (approve) pose = lerpPose(pose, withIdle(POSES.cheer, m), easeInOut(clamp01((frame - c.ok[0] - 2) / 6)));
          return (
            <Character
              key={id}
              id={id}
              x={X[id]}
              y={G}
              scale={1.3}
              pose={pose}
              expression={approve ? "happy" : id === "hussein" ? "happy" : "neutral"}
              headTilt={m.headTilt}
              right={id === "hussein" ? "clicker" : "none"}
              left={id === "amr" ? "clipboard" : "none"}
              frame={frame}
            />
          );
        })}
        {/* Michael, seen from behind in the foreground */}
        <div style={{ position: "absolute", inset: 0, filter: "blur(1.2px)" }}>
          <Character id="michael" x={1290} y={1500} scale={2.3} pose={mPose} back expression="happy" right="none" shadow={false} frame={frame} />
        </div>
      </Stage>
      {approve && (
        <Shout
          frame={frame}
          x={1120}
          y={350}
          size={128}
          speaker="MICHAEL"
          lines={[[{ text: VIDEO.lines.pitchOk.split(" ")[0], at: c.ok[0] }], VIDEO.lines.pitchOk.split(" ").slice(1).map((t, i) => ({ text: t, at: i < 2 ? c.ok[1] : c.ok[2] }))]}
        />
      )}
      {approve && (
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
          {Array.from({ length: 30 }, (_, i) => {
            const t = frame - c.ok[0];
            const x = 960 + (rand(i) - 0.5) * 1800 + Math.sin(t / 6 + i) * 20;
            const y = -40 + t * (8 + rand(i * 3) * 8) - rand(i * 5) * 200;
            return <rect key={i} x={x} y={y} width={16} height={26} rx={4} fill={i % 3 === 0 ? GOLD : ACCENT} stroke={INK} strokeWidth={2.5} transform={`rotate(${t * 9 + i * 40} ${x + 8} ${y + 13})`} />;
          })}
        </svg>
      )}
      <div style={{ position: "absolute", left: 40, top: 36, fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: INK, opacity: popIn(frame, 0, 200, 16) * (approve ? 0 : 1) }}>
        ● LIVE PITCH
      </div>
    </AbsoluteFill>
  );
};
