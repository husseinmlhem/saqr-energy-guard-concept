// Scene 4 — Lots of ideas: the three think hard; on every beat a sticky note flies onto the board.
// On the last beat Amr gathers them into a stack and hands it to Michael (reaching in from the edge).
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos, jointScreenPos } from "../characters/Character";
import { POSES, Pose, lerpPose, withIdle } from "../characters/rig";
import { arc, clamp01, easeInOut, easeOut, rand } from "../fx/anim";
import { BEAT_FRAMES, beatPulse, idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { CAST } from "./S01Play";
import { CAST_S, GROUND } from "./S00Title";
import { STICKY_COLORS, Stage, Sticky, W, breathe, camAt } from "./kit";
import { Cues, SceneProps } from "./types";
import { ScratchMarks, scratchHeadPose } from "./playtime";

const X = { ali: 520, amr: 960, hussein: 1400 } as const;
const THINKERS: ("ali" | "amr" | "hussein")[] = ["amr", "hussein", "ali", "hussein", "amr", "ali", "hussein"];
const slot = (i: number) => ({ x: 720 + (i % 4) * 165, y: 250 + Math.floor(i / 4) * 200 });

export const brainstormCues = (s: SceneSlot) => {
  const n = Math.min(VIDEO.ideas.length, Math.max(3, s.beats.length - 1), THINKERS.length);
  const notes = Array.from({ length: n }, (_, i) => beatOf(s, i));
  const handoff = beatOf(s, n);
  const cues: Cues = {
    marks: [...notes.map((f, i) => ({ f, name: `idea: ${VIDEO.ideas[i]}` })), { f: handoff, name: "stack handed to Michael" }],
    sfx: [...notes.map((f) => ({ f, name: "tick" as const, volume: 0.6 })), { f: handoff, name: "whoosh" as const, volume: 0.5 }],
    voice: [
      { f: beatOf(s, 1), id: "amr_go", sub: true },
      { f: beatOf(s, 4), id: "ali_hmm", sub: true },
      { f: beatOf(s, 6), id: "hussein_photo", sub: true },
    ],
  };
  return { notes, handoff, n, cues };
};

export const S04Brainstorm: React.FC<SceneProps> = ({ slot: sl }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => brainstormCues(sl), [sl]);
  const cam = breathe(
    camAt(frame, [
      [0, { x: 960, y: 520, zoom: 1.0 }],
      [c.handoff, { x: 1000, y: 540, zoom: 1.08 }],
      [sl.durationInFrames, { x: 1080, y: 560, zoom: 1.12 }],
    ]),
    frame,
  );
  const gather = easeInOut(clamp01((frame - c.handoff + 4) / 8));
  const amrHand = jointScreenPos("amr", X.amr, GROUND, CAST_S, POSES.point, "handR");
  const reach = easeOut(clamp01((frame - c.handoff) / 8));

  return (
    <AbsoluteFill>
      <Stage cam={cam} variant="board">
        {CAST.map((id, i) => {
          const m = idleMotion(frame, i * 0.3, 0.6);
          // the one with the idea right now pops up
          const mine = c.notes.map((f, k) => ({ f, k })).filter(({ k }) => THINKERS[k] === id);
          const active = mine.some(({ f }) => frame >= f - 8 && frame < f + 6);
          let pose: Pose = withIdle(active ? POSES.pointUp : POSES.think, m);
          // Ali, thinking hard: scratching his bald head whenever he isn't the one with the idea
          if (id === "ali" && !active) pose = scratchHeadPose("ali", frame, withIdle(POSES.stand, m));
          if (id === "amr" && frame >= c.handoff - 4) pose = lerpPose(pose, POSES.point, gather);
          return (
            <React.Fragment key={id}>
              <Character id={id} x={X[id]} y={GROUND} scale={CAST_S} pose={pose} expression={active ? "happy" : "neutral"} headTilt={active ? 0 : m.headTilt + 6} left="none" frame={frame} />
              {id === "ali" && !active && (
                <W>
                  <ScratchMarks {...headScreenPos("ali", X.ali, GROUND, CAST_S, pose)} frame={frame} />
                </W>
              )}
            </React.Fragment>
          );
        })}
        <W>
          {c.notes.map((f, i) => {
            const who = THINKERS[i];
            const head = headScreenPos(who, X[who], GROUND, CAST_S, POSES.think);
            const t = clamp01((frame - (f - 9)) / 9);
            if (frame < f - 9) return null;
            const target = slot(i);
            let p = arc({ x: head.x, y: head.y - head.r }, target, easeOut(t), 140);
            let rot = (rand(i) - 0.5) * 10;
            let s = 0.6 + 0.4 * t;
            if (gather > 0) {
              p = { x: p.x + (amrHand.x + 40 - p.x) * gather, y: p.y + (amrHand.y - 40 - i * 6 - p.y) * gather };
              rot = rot * (1 - gather);
              s = s * (1 - 0.45 * gather);
            }
            const land = frame >= f && frame < f + 5 ? 1 + 0.15 * Math.exp(-(frame - f) / 2) : 1;
            return <Sticky key={i} x={p.x} y={p.y} text={VIDEO.ideas[i]} color={STICKY_COLORS[i % STICKY_COLORS.length]} rot={rot} s={s * land} />;
          })}
          {/* think marks */}
          {CAST.map((id, i) => {
            const head = headScreenPos(id, X[id], GROUND, CAST_S, POSES.think);
            const p = beatPulse(frame + i * 6, 4);
            return (
              <g key={id} opacity={frame < c.handoff ? 0.8 : 0}>
                {[0, 1, 2].map((k) => (
                  <circle key={k} cx={head.x + head.r * 0.9 + k * 18} cy={head.y - head.r * 0.9 - k * 22} r={6 + k * 4 + p * 2} fill="#FFFFFF" stroke="#111" strokeWidth={3} />
                ))}
              </g>
            );
          })}
        </W>
        {/* Michael's arm reaching in from the edge to take the stack */}
        {frame >= c.handoff - 2 && (
          <Character id="michael" x={2080 - reach * 160} y={GROUND} scale={1.5} rotate={-12} pose={{ ...POSES.point, rArm: [96, -8] }} expression="happy" flip right="none" shadow={false} frame={frame} />
        )}
      </Stage>
      <div style={{ position: "absolute", left: 60, top: 50, fontFamily: "Poppins", fontWeight: 900, fontSize: 46, letterSpacing: 6, color: "#111", opacity: clamp01(frame / BEAT_FRAMES) * (1 - gather) }}>
        {`${c.notes.filter((f) => frame >= f).length} IDEAS`}
      </div>
    </AbsoluteFill>
  );
};
