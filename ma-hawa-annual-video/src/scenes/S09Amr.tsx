// Scene 9 — AMR · THE PLAN. Amr runs the project: client call, the timeline locks in row by row on the beat,
// "Timeline's locked. Let's go, team!" — and Ali and Hussein rush past to get going.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character } from "../characters/Character";
import { POSES, Pose, lerpPose, walkPose, withIdle } from "../characters/rig";
import { clamp01, easeInOut, easeOut, popIn } from "../fx/anim";
import { SpeedLines } from "../fx/Fx";
import { beatClock, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { lineText, voiceFrames } from "../voice";
import { ACCENT, FONT, GOLD, INK, PAPER, STROKE } from "../theme";
import { Chapter, Stage, Subtitle, W, breathe, camAt } from "./kit";
import { Cues, SceneProps } from "./types";

const ROWS = [
  { name: "Design", start: 0.0, len: 0.3, color: ACCENT },
  { name: "Booth build", start: 0.22, len: 0.38, color: "#5D8FC2" },
  { name: "Content", start: 0.35, len: 0.4, color: "#7B61C4" },
  { name: "Event day", start: 0.78, len: 0.16, color: GOLD },
];
const BOARD = { x: 200, y: 170, w: 980, h: 500 };
const AX = 1440;
const G = 1010;

export const amrCues = (slot: SceneSlot) => {
  const call = beatOf(slot, 0);
  const client = beatOf(slot, 1);
  const rows = ROWS.map((_, i) => beatOf(slot, 1 + i));
  const lock = beatOf(slot, 5);
  const go = beatOf(slot, 5);
  const rush = beatOf(slot, 6);
  const cues: Cues = {
    marks: [{ f: call, name: "client call" }, { f: client, name: "CLIENT ✓" }, ...rows.map((f, i) => ({ f, name: `timeline: ${ROWS[i].name}` })), { f: lock, name: "LOCKED — Let's go, team!" }, { f: rush, name: "team rushes off" }],
    sfx: [{ f: client, name: "ding", volume: 0.5 }, ...rows.map((f) => ({ f, name: "tick" as const, volume: 0.55 })), { f: lock, name: "stamp", volume: 0.9 }, { f: rush, name: "whoosh", volume: 0.6 }],
    voice: [{ f: go, id: "amr_lead" }],
  };
  return { call, client, rows, lock, go, rush, cues };
};

const Gantt: React.FC<{ frame: number; c: ReturnType<typeof amrCues> }> = ({ frame, c }) => {
  const { x, y, w, h } = BOARD;
  const lx = x + 300;
  const cw = w - 340;
  const locked = frame >= c.lock;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="rgba(255,255,255,0.92)" stroke={INK} strokeWidth={STROKE} />
      <text x={x + 36} y={y + 64} fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>
        PROJECT TIMELINE
      </text>
      {["W1", "W2", "W3", "W4", "W5", "W6"].map((wk, i) => (
        <g key={wk}>
          <text x={lx + (i + 0.5) * (cw / 6)} y={y + 120} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill="#7A8496">
            {wk}
          </text>
          <line x1={lx + i * (cw / 6)} x2={lx + i * (cw / 6)} y1={y + 136} y2={y + h - 24} stroke="#E3E8EF" strokeWidth={3} />
        </g>
      ))}
      {ROWS.map((r, i) => {
        const ry = y + 150 + i * 80;
        const k = easeOut(clamp01((frame - c.rows[i] + 2) / 8));
        return (
          <g key={r.name}>
            <text x={x + 36} y={ry + 40} fontFamily={FONT} fontWeight={800} fontSize={26} fill={INK}>
              {r.name}
            </text>
            <rect x={lx} y={ry + 12} width={cw} height={44} rx={10} fill="#F1F4F8" />
            <rect x={lx + r.start * cw} y={ry + 12} width={r.len * cw * k} height={44} rx={10} fill={r.color} stroke={INK} strokeWidth={4} opacity={k > 0 ? 1 : 0} />
            {k >= 1 && (
              <g transform={`translate(${lx + (r.start + r.len) * cw + 30} ${ry + 34}) scale(${popIn(frame, c.rows[i] + 6, 500, 12)})`}>
                <circle r={18} fill="#3FBF6F" stroke={INK} strokeWidth={4} />
                <path d="M -8 0 l 6 6 l 10 -12" fill="none" stroke={PAPER} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
          </g>
        );
      })}
      {locked && (
        <g transform={`translate(${x + w - 200} ${y + 70}) rotate(-10) scale(${1 + (1 - popIn(frame, c.lock - 1, 500, 12)) * 1.3})`}>
          <rect x={-150} y={-46} width={300} height={92} rx={14} fill="rgba(255,255,255,0.85)" stroke={ACCENT} strokeWidth={9} />
          <text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} letterSpacing={6} fill={ACCENT}>
            LOCKED
          </text>
        </g>
      )}
    </g>
  );
};

export const S09Amr: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => amrCues(slot), [slot]);
  const m = idleMotion(frame, 0.1, 0.6);
  const cam = breathe(
    camAt(frame, [
      [0, { x: 940, y: 540, zoom: 1.0 }],
      [c.lock, { x: 1000, y: 530, zoom: 1.05 }],
      [c.lock + 6, { x: 1180, y: 520, zoom: 1.14 }],
      [slot.durationInFrames, { x: 1160, y: 530, zoom: 1.12 }],
    ]),
    frame,
  );
  const onPhone = frame < c.lock - 4;
  let pose: Pose = onPhone ? withIdle(POSES.phoneTalk, m) : withIdle(POSES.clipboard, m);
  if (frame >= c.lock) pose = lerpPose(pose, withIdle({ ...POSES.point, rArm: [104, -6] }, m), easeInOut(clamp01((frame - c.lock) / 6)));
  // Ali and Hussein rush through the background on "Let's go, team!"
  const rushT = clamp01((frame - c.rush) / (slot.durationInFrames - c.rush));

  return (
    <AbsoluteFill>
      <Stage cam={cam} variant="meeting">
        <W>
          <Gantt frame={frame} c={c} />
          {/* client call card */}
          {frame >= c.call && onPhone && (
            <g transform={`translate(1215 250) scale(${popIn(frame, c.call, 300, 16)})`}>
              <rect x={-10} y={-50} width={270} height={100} rx={22} fill={INK} />
              <circle cx={44} cy={0} r={28} fill="#3FBF6F" />
              <path d="M 32 -10 q 0 24 24 24 l 6 -8 l -8 -6 l -5 4 q -8 -4 -11 -11 l 4 -5 l -6 -8 Z" fill={PAPER} />
              <text x={90} y={-6} fontFamily={FONT} fontWeight={800} fontSize={24} fill={PAPER}>
                CLIENT CALL
              </text>
              <text x={90} y={26} fontFamily={FONT} fontWeight={700} fontSize={22} fill={frame >= c.client ? "#3FBF6F" : "#9AA3B2"}>
                {frame >= c.client ? "approved ✓" : `0${Math.floor(frame / 30)}:${String(frame % 30 * 2).padStart(2, "0")}`}
              </text>
            </g>
          )}
        </W>
        {frame >= c.rush &&
          (["ali", "hussein"] as const).map((id, i) => {
            const x = -300 + rushT * 2600 - i * 260;
            return (
              <Character key={id} id={id} x={x} y={G - 80} scale={1.1} pose={walkPose(POSES.relaxed, beatClock(frame) + i * 0.5, 120, 1, 26)} expression="happy" left={id === "hussein" ? "laptop" : "none"} frame={frame} />
            );
          })}
        <Character id="amr" x={AX} y={G} scale={1.55} pose={pose} expression={frame >= c.client ? "happy" : "neutral"} right={onPhone ? "phone" : "none"} left={onPhone ? "none" : "clipboard"} headTilt={m.headTilt} frame={frame} />
        {frame >= c.rush && frame < c.rush + 12 && (
          <W>
            <SpeedLines frame={frame} n={12} dir={1} y0={600} y1={960} opacity={1 - (frame - c.rush) / 12} />
          </W>
        )}
      </Stage>
      <Chapter frame={frame} title="AMR" sub="THE PLAN" />
      <Subtitle frame={frame} at={c.go} frames={voiceFrames("amr_lead")} speaker="Amr" text={lineText("amr_lead")} />
    </AbsoluteFill>
  );
};
