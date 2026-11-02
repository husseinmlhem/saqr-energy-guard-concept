// Scene 5 — Hard work: fast three-way split screen, everything ticking on the beat.
// Ali carries heavy boxes | Amr (centre) plans on the whiteboard | Hussein at many screens, goggles glowing.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, jointScreenPos } from "../characters/Character";
import { POSES, Pose, lerpPose, walkPose, withIdle } from "../characters/rig";
import { clamp01, popIn, rand } from "../fx/anim";
import { StarShape } from "../fx/Fx";
import { beatClock, beatPulse, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { ACCENT, ACCENT_SOFT, FONT, INK, PAPER, STROKE } from "../theme";
import { Cues, SceneProps } from "./types";

const PW = 640;
const BOARD_ITEMS = ["IDEA", "→", "PLAN", "→", "BUILD", "✓"];
const PANEL_ORDER = ["ali", "amr", "hussein"] as const;

export const hardworkCues = (slot: SceneSlot) => {
  const n = slot.beats.length;
  const panels = [0, 1, 2].map((i) => beatOf(slot, Math.min(i, n - 1)));
  const board = BOARD_ITEMS.map((_, i) => beatOf(slot, Math.min(n - 1, 2 + i)));
  const nBoxes = Math.max(2, Math.min(4, Math.floor((n - 2) / 2)));
  const boxes = Array.from({ length: nBoxes }, (_, i) => beatOf(slot, Math.min(n - 1, 2 + i * 2)));
  const half = slot.downbeats[Math.floor(slot.downbeats.length / 2)] ?? beatOf(slot, Math.floor(n / 2));
  const cues: Cues = {
    marks: [
      ...panels.map((f, i) => ({ f, name: `panel ${PANEL_ORDER[i]} in` })),
      ...board.map((f, i) => ({ f, name: `whiteboard: ${BOARD_ITEMS[i]}` })),
      ...boxes.map((f, i) => ({ f, name: `box ${i + 1} lands` })),
      { f: half, name: "montage speeds up" },
    ],
    sfx: [
      ...panels.map((f) => ({ f, name: "whoosh" as const, volume: 0.55 })),
      ...board.map((f) => ({ f, name: "tick" as const, volume: 0.5 })),
      ...boxes.map((f) => ({ f, name: "stamp" as const, volume: 0.5 })),
    ],
  };
  return { panels, board, boxes, half, cues };
};

const Panel: React.FC<{ i: number; at: number; frame: number; zoom: number; children: React.ReactNode }> = ({ i, at, frame, zoom, children }) => {
  const k = popIn(frame, at, 220, 18);
  const dir = i % 2 === 0 ? -1 : 1;
  return (
    <div style={{ position: "absolute", left: i * PW, top: 0, width: PW, height: 1080, overflow: "hidden", transform: `translateY(${(1 - k) * 1100 * dir}px)`, background: PAPER }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 62%" }}>{children}</div>
    </div>
  );
};

const Floor: React.FC<{ y: number }> = ({ y }) => (
  <>
    <rect x={0} y={y - 4} width={PW} height={1080 - y + 4} fill="#F2F5F9" />
    <line x1={0} x2={PW} y1={y - 4} y2={y - 4} stroke={INK} strokeWidth={STROKE * 0.8} />
  </>
);

export const S5HardWork: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => hardworkCues(slot), [slot]);
  const pulse = beatPulse(frame, 5);
  const clock = beatClock(frame);
  const fast = frame >= c.half;
  // after the half-way downbeat each beat punches into the next panel
  const focus = fast ? Math.floor(clock) % 3 : -1;
  const zoomFor = (i: number) => 1 + (focus === i ? 0.06 * pulse : 0) + (fast ? 0.02 : 0);

  // --- Ali: walking with a growing stack of boxes held at the chest
  const G = 1000;
  const S_ALI = 1.0;
  const nBoxes = c.boxes.filter((f) => frame >= f).length;
  const aliPose: Pose = walkPose(POSES.carry, clock / 2, 34, 1, 12);
  const lastBox = [...c.boxes].reverse().find((f) => frame >= f) ?? -999;
  const settle = frame - lastBox < 10 ? Math.sin(((frame - lastBox) / 10) * Math.PI) * 10 : 0;
  const aliHands = {
    l: jointScreenPos("ali", 320, G, S_ALI, { ...aliPose, hipY: aliPose.hipY + settle }, "handL"),
    r: jointScreenPos("ali", 320, G, S_ALI, { ...aliPose, hipY: aliPose.hipY + settle }, "handR"),
  };
  // --- Amr
  const amrM = idleMotion(frame, 0.2, 0.6);
  const write = (Math.sin(clock * Math.PI) + 1) / 2;
  const amrPose = withIdle(lerpPose(POSES.whiteboard, { ...POSES.whiteboard, rArm: [104, -26] }, write), amrM);
  // --- Hussein
  const glow = 0.55 + 0.45 * pulse;
  const hm = idleMotion(frame, 0.6, 0.5);

  return (
    <AbsoluteFill style={{ background: INK }}>
      {/* ---------------- Ali: heavy boxes */}
      <Panel i={0} at={c.panels[0]} frame={frame} zoom={zoomFor(0)}>
        <svg width={PW} height={1080} style={{ position: "absolute" }}>
          <Floor y={G} />
          {Array.from({ length: 8 }, (_, i) => {
            const x = ((i * 120 - frame * 7) % 960 + 960) % 960 - 120;
            return <line key={i} x1={x} x2={x + 50} y1={G + 34} y2={G + 34} stroke={ACCENT} strokeWidth={STROKE} strokeLinecap="round" />;
          })}
        </svg>
        <Character id="ali" x={320} y={G} scale={S_ALI} pose={{ ...aliPose, hipY: aliPose.hipY + settle }} expression={nBoxes >= 3 ? "shocked" : "neutral"} left="none" right="none" frame={frame} />
        <svg width={PW} height={1080} style={{ position: "absolute" }}>
          {Array.from({ length: nBoxes }, (_, i) => {
            const land = c.boxes[i];
            const drop = (1 - clamp01((frame - land + 5) / 5)) * 260;
            const wob = Math.sin(frame / 5 + i) * 2 * i;
            const cx = (aliHands.l.x + aliHands.r.x) / 2 - 18;
            const y = Math.min(aliHands.l.y, aliHands.r.y) + 18 - i * 70 - drop;
            return (
              <g key={i} transform={`translate(${cx + wob} ${y}) rotate(${wob * 0.6})`}>
                <rect x={-78} y={-70} width={156} height={70} rx={4} fill="#D9B98C" stroke={INK} strokeWidth={STROKE} />
                <rect x={-12} y={-70} width={24} height={70} fill="#C5A372" />
                <text y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={18} fill={INK}>
                  {["HEAVY", "HEAVIER", "STAGE", "LED WALL"][i] ?? "HEAVY"}
                </text>
              </g>
            );
          })}
          {/* hands in front of the bottom box */}
          {nBoxes > 0 &&
            [aliHands.l, aliHands.r].map((h, k) => <ellipse key={k} cx={h.x + (k ? -10 : 10)} cy={h.y} rx={13} ry={16} fill="#9C7865" stroke={INK} strokeWidth={STROKE * 0.8} />)}
        </svg>
      </Panel>

      {/* ---------------- Amr: whiteboard plan (centre panel) */}
      <Panel i={1} at={c.panels[1]} frame={frame} zoom={zoomFor(1)}>
        <svg width={PW} height={1080} style={{ position: "absolute" }}>
          <Floor y={G} />
          <rect x={30} y={190} width={400} height={380} rx={10} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
          <line x1={90} x2={70} y1={570} y2={G - 4} stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
          <line x1={370} x2={390} y1={570} y2={G - 4} stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
          {BOARD_ITEMS.map((t, i) => {
            const k = popIn(frame, c.board[i], 500, 14);
            if (k <= 0) return null;
            const col = i % 2;
            const row = Math.floor(i / 2);
            const isArrow = t === "→";
            const x = 50 + col * 190;
            const y = 215 + row * 115;
            return (
              <g key={i} transform={`translate(${x + 80} ${y + 42}) scale(${k}) translate(${-x - 80} ${-y - 42})`}>
                {isArrow ? (
                  <path d={`M ${x + 20} ${y + 42} L ${x + 140} ${y + 42} M ${x + 115} ${y + 22} L ${x + 140} ${y + 42} L ${x + 115} ${y + 62}`} fill="none" stroke={ACCENT} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
                ) : t === "✓" ? (
                  <path d={`M ${x + 30} ${y + 42} l 30 30 l 70 -70`} fill="none" stroke={ACCENT} strokeWidth={STROKE * 1.6} strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <>
                    <rect x={x} y={y} width={165} height={84} rx={14} fill={i === 4 ? ACCENT_SOFT : PAPER} stroke={INK} strokeWidth={STROKE} />
                    <text x={x + 82} y={y + 55} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={INK}>
                      {t}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
        <Character id="amr" x={520} y={G} scale={1.0} pose={amrPose} flip expression="neutral" right="marker" left="none" headTilt={amrM.headTilt} frame={frame} />
      </Panel>

      {/* ---------------- Hussein: many screens */}
      <Panel i={2} at={c.panels[2]} frame={frame} zoom={zoomFor(2)}>
        <svg width={PW} height={1080} style={{ position: "absolute" }}>
          <Floor y={G} />
          {Array.from({ length: 6 }, (_, k) => {
            const col = k % 3;
            const row = Math.floor(k / 3);
            const x = 30 + col * 200;
            const y = 110 + row * 160;
            const on = (Math.floor(clock) + k) % 3 === 0;
            return (
              <g key={k}>
                <rect x={x} y={y} width={180} height={120} rx={8} fill={on ? ACCENT_SOFT : "#F7FAFD"} stroke={INK} strokeWidth={STROKE} />
                {Array.from({ length: 5 }, (_, j) => {
                  const w = 30 + rand(k * 10 + j + Math.floor(clock)) * 110;
                  return <line key={j} x1={x + 16} x2={x + 16 + w} y1={y + 22 + j * 19} y2={y + 22 + j * 19} stroke={j % 2 ? ACCENT : INK} strokeWidth={5} strokeLinecap="round" />;
                })}
                <line x1={x + 90} x2={x + 90} y1={y + 120} y2={y + 140} stroke={INK} strokeWidth={STROKE} />
              </g>
            );
          })}
        </svg>
        <Character
          id="hussein"
          x={320}
          y={G}
          scale={1.12}
          pose={withIdle({ ...POSES.type, lArm: [-36 + Math.sin(frame / 2) * 12, -70], rArm: [36 - Math.cos(frame / 2) * 12, 70] }, hm)}
          expression="neutral"
          goggles="eyes"
          gogglesGlow={glow}
          headTilt={hm.headTilt}
          frame={frame}
        />
        <svg width={PW} height={1080} style={{ position: "absolute" }}>
          {/* desk in front of him */}
          <rect x={20} y={760} width={600} height={26} rx={6} fill="#E9DCC8" stroke={INK} strokeWidth={STROKE} />
          <rect x={60} y={786} width={520} height={G - 790} fill="#F4ECDF" stroke={INK} strokeWidth={STROKE} />
          <rect x={170} y={724} width={300} height={40} rx={8} fill={PAPER} stroke={INK} strokeWidth={STROKE} />
          {Array.from({ length: 8 }, (_, k) => (
            <rect key={k} x={186 + k * 34} y={734} width={24} height={14} rx={3} fill={(Math.floor(frame / 3) + k) % 4 === 0 ? ACCENT : PAPER} stroke={INK} strokeWidth={3} />
          ))}
          {fast && (
            <g transform={`translate(565 650) rotate(${frame * 5}) scale(${0.6 + 0.4 * pulse})`}>
              <StarShape r={28} fill={ACCENT} />
            </g>
          )}
        </svg>
      </Panel>

      {[1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: i * PW - 5, top: 0, width: 10, height: 1080, background: slot.downbeats.some((d) => frame >= d && frame < d + 4) ? ACCENT : INK }} />
      ))}
    </AbsoluteFill>
  );
};
