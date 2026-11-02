// Scene 5 — Hard work: fast three-way split screen, everything ticking on the beat.
// Amr plans on a whiteboard / Ali carries heavy boxes / Hussein at many screens, goggles glowing.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos } from "../characters/Character";
import { POSES, lerpPose, walkPose } from "../characters/rig";
import { clamp01, popIn, rand, squash } from "../fx/anim";
import { SpeedLines, StarShape } from "../fx/Fx";
import { beatClock, beatPulse, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { ACCENT, ACCENT_SOFT, FONT, INK, PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";

const PW = 640;
const BOARD_ITEMS = ["IDEA", "→", "PLAN", "→", "BUILD", "✓"];

export const hardworkCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const panels = [0, 1, 2].map((i) => beatOf(slot, i));
  const board = BOARD_ITEMS.map((_, i) => beatOf(slot, Math.min(n - 1, 3 + i)));
  const boxes = [0, 1, 2, 3].map((i) => beatOf(slot, Math.min(n - 1, 4 + i * 2)));
  const half = slot.downbeats[Math.floor(slot.downbeats.length / 2)] ?? beatOf(slot, Math.floor(n / 2));
  const cues: Cues = {
    marks: [
      ...panels.map((f, i) => ({ f, name: `panel ${["Amr", "Ali", "Hussein"][i]} in` })),
      ...board.map((f, i) => ({ f, name: `whiteboard: ${BOARD_ITEMS[i]}` })),
      ...boxes.map((f, i) => ({ f, name: `box ${i + 1} lands` })),
      { f: half, name: "montage speeds up" },
    ],
    sfx: [
      ...panels.map((f) => ({ f, name: "whoosh" as const, volume: 0.6 })),
      ...board.map((f) => ({ f, name: "tick" as const, volume: 0.5 })),
      ...boxes.map((f) => ({ f, name: "stamp" as const, volume: 0.55 })),
    ],
  };
  return { panels, board, boxes, half, cues };
};

const Panel: React.FC<{ i: number; at: number; frame: number; zoom: number; children: React.ReactNode }> = ({ i, at, frame, zoom, children }) => {
  const k = popIn(frame, at, 260, 15);
  const dir = i % 2 === 0 ? -1 : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: i * PW,
        top: 0,
        width: PW,
        height: 1080,
        overflow: "hidden",
        transform: `translateY(${(1 - k) * 1100 * dir}px)`,
        background: PAPER,
      }}
    >
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 60%" }}>{children}</div>
    </div>
  );
};

export const S5HardWork: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => hardworkCues(slot), [slot]);
  const pulse = beatPulse(frame, 5);
  const clock = beatClock(frame);
  const fast = frame >= c.half;
  // after the half-way downbeat each beat punches into the next panel
  const focus = fast ? Math.floor(clock) % 3 : -1;
  const zoomFor = (i: number) => 1 + (focus === i ? 0.07 * pulse : 0) + (fast ? 0.02 : 0);

  // --- Amr
  const amrPose = lerpPose(POSES.whiteboard, { ...POSES.whiteboard, rArm: [100, -30] }, (Math.sin(clock * Math.PI) + 1) / 2);
  // --- Ali walking in place under a growing stack
  const nBoxes = c.boxes.filter((f) => frame >= f).length;
  const aliPose = walkPose(POSES.carry, clock / 2, 0.5);
  const lastBox = [...c.boxes].reverse().find((f) => frame >= f) ?? -999;
  const [asx, asy] = squash(frame, lastBox, 0.12);
  const aliHead = headScreenPos("ali", 320, 905, 0.8, aliPose);
  // --- Hussein
  const glow = 0.55 + 0.45 * pulse;
  const hm = idleMotion(frame, 0.6, 0.6);

  return (
    <AbsoluteFill style={{ background: INK }}>
      {/* ---------------- Amr: whiteboard plan */}
      <Panel i={0} at={c.panels[0]} frame={frame} zoom={zoomFor(0)}>
        <svg width={PW} height={1080} style={{ position: "absolute" }}>
          <rect x={40} y={170} width={430} height={400} rx={10} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
          <line x1={100} x2={100} y1={570} y2={900} stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
          <line x1={410} x2={410} y1={570} y2={900} stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
          <line x1={0} x2={PW} y1={906} y2={906} stroke={INK} strokeWidth={STROKE} />
          {BOARD_ITEMS.map((t, i) => {
            const k = popIn(frame, c.board[i], 500, 12);
            if (k <= 0) return null;
            const col = i % 2;
            const row = Math.floor(i / 2);
            const isArrow = t === "→";
            const x = 70 + col * 200 + (isArrow ? 20 : 0);
            const y = 200 + row * 120;
            return (
              <g key={i} transform={`translate(${x + 80} ${y + 45}) scale(${k}) translate(${-x - 80} ${-y - 45})`}>
                {isArrow ? (
                  <path d={`M ${x + 20} ${y + 45} L ${x + 140} ${y + 45} M ${x + 115} ${y + 25} L ${x + 140} ${y + 45} L ${x + 115} ${y + 65}`} fill="none" stroke={ACCENT} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
                ) : t === "✓" ? (
                  <path d={`M ${x + 30} ${y + 45} l 30 30 l 70 -70`} fill="none" stroke={ACCENT} strokeWidth={STROKE * 1.6} strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <>
                    <rect x={x} y={y} width={170} height={90} rx={14} fill={i === 4 ? ACCENT_SOFT : PAPER} stroke={INK} strokeWidth={STROKE} />
                    <text x={x + 85} y={y + 58} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INK}>
                      {t}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
        <Character id="amr" x={515} y={905} scale={0.9} pose={amrPose} flip expression="neutral" right="marker" left="none" headTilt={Math.sin(clock * Math.PI) * 4} frame={frame} />
      </Panel>

      {/* ---------------- Ali: heavy boxes */}
      <Panel i={1} at={c.panels[1]} frame={frame} zoom={zoomFor(1)}>
        <svg width={PW} height={1080} style={{ position: "absolute" }}>
          <SpeedLines frame={frame} n={8} dir={-1} y0={300} y1={880} opacity={0.35} seed={4} />
          <line x1={0} x2={PW} y1={906} y2={906} stroke={INK} strokeWidth={STROKE} />
          {Array.from({ length: 8 }, (_, i) => {
            const x = ((i * 120 - frame * 9) % 960 + 960) % 960 - 120;
            return <line key={i} x1={x} x2={x + 50} y1={940} y2={940} stroke={ACCENT} strokeWidth={STROKE} strokeLinecap="round" />;
          })}
        </svg>
        <Character
          id="ali"
          x={320}
          y={905}
          scale={0.8}
          pose={aliPose}
          expression={nBoxes >= 3 ? "shocked" : "neutral"}
          squashX={asx}
          squashY={asy}
          left="none"
          right="none"
          frame={frame}
        />
        <svg width={PW} height={1080} style={{ position: "absolute" }}>
          {Array.from({ length: nBoxes }, (_, i) => {
            const land = c.boxes[i];
            const drop = (1 - clamp01((frame - land + 6) / 6)) * 300;
            const wob = Math.sin(frame / 4 + i) * 3 * (i + 1);
            // balanced on top of his (big) head
            const y = aliHead.y - aliHead.r + 4 - i * 76 - drop;
            return (
              <g key={i} transform={`translate(${320 + wob} ${y}) rotate(${wob * 0.6})`}>
                <rect x={-80} y={-72} width={160} height={72} rx={4} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
                <rect x={-14} y={-72} width={28} height={72} fill={ACCENT_SOFT} />
                <line x1={-80} x2={80} y1={-52} y2={-52} stroke={INK} strokeWidth={STROKE * 0.6} />
                <text y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={INK}>
                  {i === 0 ? "HEAVY" : i === 1 ? "HEAVIER" : i === 2 ? "STAGE" : "LED WALL"}
                </text>
              </g>
            );
          })}
        </svg>
      </Panel>

      {/* ---------------- Hussein: many screens */}
      <Panel i={2} at={c.panels[2]} frame={frame} zoom={zoomFor(2)}>
        <svg width={PW} height={1080} style={{ position: "absolute" }}>
          {Array.from({ length: 6 }, (_, k) => {
            const col = k % 3;
            const row = Math.floor(k / 3);
            const x = 30 + col * 200;
            const y = 120 + row * 160;
            const on = (Math.floor(clock) + k) % 3 === 0;
            return (
              <g key={k}>
                <rect x={x} y={y} width={180} height={120} rx={8} fill={on ? ACCENT_SOFT : PAPER} stroke={INK} strokeWidth={STROKE} />
                {Array.from({ length: 5 }, (_, j) => {
                  const w = 30 + rand(k * 10 + j + Math.floor(clock)) * 110;
                  return <line key={j} x1={x + 16} x2={x + 16 + w} y1={y + 22 + j * 19} y2={y + 22 + j * 19} stroke={j % 2 ? ACCENT : INK} strokeWidth={5} strokeLinecap="round" />;
                })}
                <line x1={x + 90} x2={x + 90} y1={y + 120} y2={y + 140} stroke={INK} strokeWidth={STROKE} />
              </g>
            );
          })}
          <rect x={20} y={760} width={600} height={24} rx={6} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
          <line x1={80} x2={80} y1={784} y2={906} stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
          <line x1={560} x2={560} y1={784} y2={906} stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
          <line x1={0} x2={PW} y1={906} y2={906} stroke={INK} strokeWidth={STROKE} />
        </svg>
        <Character
          id="hussein"
          x={320}
          y={850 - hm.y}
          scale={0.85}
          pose={{ ...POSES.type, lArm: [-40 + Math.sin(frame / 2) * 12, -70], rArm: [40 - Math.cos(frame / 2) * 12, 70] }}
          expression="neutral"
          goggles="eyes"
          gogglesGlow={glow}
          squashX={hm.scaleX}
          squashY={hm.scaleY}
          headTilt={hm.headTilt}
          frame={frame}
        />
        <svg width={PW} height={1080} style={{ position: "absolute" }}>
          <rect x={160} y={712} width={320} height={46} rx={8} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
          {Array.from({ length: 8 }, (_, k) => (
            <rect key={k} x={180 + k * 36} y={724} width={26} height={14} rx={3} fill={(Math.floor(frame / 3) + k) % 4 === 0 ? ACCENT : PAPER} stroke={INK} strokeWidth={3} />
          ))}
          {fast && (
            <g transform={`translate(560 640) rotate(${frame * 5}) scale(${0.6 + 0.4 * pulse})`}>
              <StarShape r={30} fill={ACCENT} />
            </g>
          )}
        </svg>
      </Panel>

      {/* dividers flash on the downbeats */}
      {[1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: i * PW - 5, top: 0, width: 10, height: 1080, background: slot.downbeats.some((d) => frame >= d && frame < d + 4) ? ACCENT : INK }} />
      ))}
    </AbsoluteFill>
  );
};
