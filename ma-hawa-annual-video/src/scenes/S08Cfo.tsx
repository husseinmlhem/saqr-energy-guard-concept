// Scene 8 — The CFO: Saeed is laughing at his phone (shaking on the eighth-notes).
// The team walks in — "WE NEED A BUDGET…" — and he stops laughing. Instantly. Snap zoom. Silence.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos } from "../characters/Character";
import { charCfg } from "../characters/config";
import { POSES, Pose, walkPose, withIdle } from "../characters/rig";
import { clamp01, easeOut, rand } from "../fx/anim";
import { NameTag } from "../fx/Fx";
import { BEAT_FRAMES, beatClock, beatPhase, idleMotion } from "../sync/beats";
import { SceneSlot, VIDEO, beatOf } from "../sync/timeline";
import { ACCENT, FONT, INK, STROKE } from "../theme";
import { CAST } from "./S01Pump";
import { Shout, Stage, W, camAt } from "./kit";
import { Cues, SceneProps } from "./types";

const X = { ali: 300, amr: 560, hussein: 820 } as const;
const G = 1000;
const SX = 1440;

export const cfoCues = (slot: SceneSlot) => {
  const arrive = beatOf(slot, 2);
  const has = [0, 1, 2, 3, 4].map((i) => beatOf(slot, i));
  const ask = [beatOf(slot, 4), beatOf(slot, 5)];
  const stop = beatOf(slot, 5);
  const cues: Cues = {
    marks: [...has.map((f, i) => ({ f, name: `Saeed: HA! (${i + 1})` })), { f: arrive, name: "team arrives" }, { f: ask[0], name: "WE NEED…" }, { f: stop, name: "…A BUDGET — he stops laughing" }],
    sfx: [...has.map((f) => ({ f, name: "boing" as const, volume: 0.25 })), { f: ask[0], name: "tick" as const, volume: 0.4 }, { f: stop, name: "scratch" as const, volume: 1 }],
  };
  return { arrive, has, ask, stop, cues };
};

export const S08Cfo: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => cfoCues(slot), [slot]);
  const stopped = frame >= c.stop;
  const head = headScreenPos("saeed", SX, G, 1.45, POSES.stand);
  const snap = easeOut(clamp01((frame - c.stop) / 4));
  const cam = camAt(frame, [
    [0, { x: 900, y: 540, zoom: 1.0 }],
    [c.stop, { x: 980, y: 530, zoom: 1.04 }],
  ]);
  const cam2 = stopped ? { x: cam.x + (head.x - cam.x) * snap, y: cam.y + (head.y + 60 - cam.y) * snap, zoom: cam.zoom + 0.9 * snap } : cam;
  // laughing: shoulders bounce on the eighth-notes, head thrown back
  const ph = beatPhase(frame);
  const laugh: Pose = {
    ...POSES.laugh,
    hipY: 4 + 6 * Math.abs(Math.sin(2 * Math.PI * ph)),
    lean: -6 + 3 * Math.sin(4 * Math.PI * ph),
    head: -10 + 6 * Math.sin(4 * Math.PI * ph),
  };
  const straight: Pose = { ...POSES.stand, lHand: { x: -70, y: -200 }, rHand: { x: 70, y: -200 } };

  return (
    <AbsoluteFill>
      <Stage cam={cam2} variant="cfo">
        <Character id="saeed" x={SX} y={G} scale={1.45} pose={stopped ? straight : laugh} expression="neutral" right={stopped ? "none" : "phone"} headTilt={0} frame={frame} />
        <W>
          {/* the desk in front of him */}
          <rect x={SX - 300} y={760} width={600} height={26} rx={6} fill="#8C6A4A" stroke={INK} strokeWidth={STROKE} />
          <rect x={SX - 280} y={786} width={560} height={230} fill="#A47E58" stroke={INK} strokeWidth={STROKE} />
          <rect x={SX - 250} y={810} width={500} height={6} fill="#8C6A4A" />
          <rect x={SX + 150} y={712} width={80} height={48} rx={6} fill="#F4EEE3" stroke={INK} strokeWidth={STROKE * 0.6} />
          <path d={`M ${SX - 230} 760 l 20 -46 l 50 0 l 10 46 Z`} fill="#3B4A63" stroke={INK} strokeWidth={STROKE * 0.6} />
          {/* HA HA HA */}
          {c.has.map((f, i) => {
            if (frame < f) return null;
            const t = (frame - f) / BEAT_FRAMES;
            const fall = stopped ? Math.max(0, frame - c.stop) : 0;
            const x = head.x + (i % 2 ? 1 : -1) * (120 + rand(i) * 80);
            const y = head.y - 60 - t * 30 + fall * fall * 1.2 + fall * 8;
            const s = Math.min(1, t * 5) * (1 + 0.1 * Math.sin(frame / 2));
            return (
              <text key={i} x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70 * s} fill={ACCENT} stroke={INK} strokeWidth={STROKE} paintOrder="stroke" transform={`rotate(${(rand(i * 3) - 0.5) * 30 + fall * 6} ${x} ${y})`} opacity={y > 1150 ? 0 : 1}>
                HA!
              </text>
            );
          })}
        </W>
        {CAST.map((id, i) => {
          const m = idleMotion(frame, i * 0.3, 0.5);
          const t = clamp01(frame / c.arrive);
          const startX = X[id] - 760;
          const x = startX + (X[id] - startX) * t;
          const stride = ((X[id] - startX) / Math.max(1, c.arrive)) * BEAT_FRAMES / 1.35;
          let pose: Pose = frame < c.arrive ? walkPose(POSES.relaxed, beatClock(frame) / 2 + i * 0.5, stride) : withIdle(POSES.relaxed, m);
          if (id === "amr" && frame >= c.ask[0]) pose = withIdle({ ...POSES.point, rArm: [100, -10] }, m);
          if (stopped) pose = { ...POSES.stand, hipY: 2 };
          return <Character key={id} id={id} x={x} y={G} scale={1.35} pose={pose} expression={stopped ? "shocked" : "happy"} left="none" frame={frame} />;
        })}
      </Stage>
      <Shout frame={frame} x={620} y={230} size={124} speaker="THE TEAM" lines={[[{ text: "WE NEED", at: c.ask[0] }], [{ text: VIDEO.lines.budget.replace(/^WE NEED\s*/i, ""), at: c.ask[1] }]]} hideAt={c.stop - 1} />
      <NameTag frame={frame} at={2} x={SX} y={140} text={charCfg("saeed").tag ?? "Saeed"} />
      {stopped && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 90 }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 90, letterSpacing: 26, color: "#FFFFFF", textShadow: `5px 5px 0 ${INK}`, opacity: clamp01((frame - c.stop - 6) / 6) }}>
            {".".repeat(1 + Math.min(2, Math.floor((frame - c.stop - 6) / 6)))}
          </div>
        </AbsoluteFill>
      )}
      {stopped && <AbsoluteFill style={{ boxShadow: "inset 0 0 0 26px #111", opacity: snap * 0.85, pointerEvents: "none" }} />}
    </AbsoluteFill>
  );
};
