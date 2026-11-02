// Scene 8 — Finance. Balanced and clear:
// Saeed is in a good mood at his desk (coffee, a light chuckle at his phone). The team comes in;
// Amr: "Saeed… we need a budget." and puts the BUDGET REQUEST on the desk. Saeed sets the phone down,
// becomes focused, reviews it ("Hmm… let me see the numbers.") — every line checks out on the beat —
// and approves it with a calm stamp: "Approved. Spend it wisely."
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, jointScreenPos } from "../characters/Character";
import { charCfg } from "../characters/config";
import { POSES, Pose, lerpPose, walkPose, withIdle } from "../characters/rig";
import { clamp01, easeInOut, easeOut, popIn } from "../fx/anim";
import { NameTag } from "../fx/Fx";
import { BEAT_FRAMES, beatClock, beatPhase, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { lineText, voiceFrames } from "../voice";
import { ACCENT, FONT, INK, PAPER, STROKE } from "../theme";
import { CAST } from "./S01Pump";
import { Chapter, Stage, Subtitle, W, camAt } from "./kit";
import { Cues, SceneProps } from "./types";

const X = { ali: 300, amr: 590, hussein: 860 } as const;
const G = 1000;
const SX = 1440;
const ITEMS = ["Booth build", "Production", "Media & content", "Staffing"];

export const cfoCues = (slot: SceneSlot) => {
  const arrive = beatOf(slot, 1);
  const ask = beatOf(slot, 1);
  const folder = beatOf(slot, 3);
  const focus = beatOf(slot, 4);
  const review = beatOf(slot, 5);
  const checks = [5, 6, 7, 8].map((i) => beatOf(slot, i));
  const approve = beatOf(slot, Math.min(slot.beats.length - 3, 9));
  const cues: Cues = {
    marks: [
      { f: 0, name: "Saeed relaxed, team walks in" },
      { f: ask, name: "Amr: Saeed… we need a budget." },
      { f: folder, name: "BUDGET REQUEST on the desk" },
      { f: focus, name: "Saeed sets the phone down — focused" },
      ...checks.map((f, i) => ({ f, name: `review: ${ITEMS[i]} ✓` })),
      { f: approve, name: "APPROVED (stamp)" },
    ],
    sfx: [
      { f: folder, name: "whoosh", volume: 0.4 },
      ...checks.map((f) => ({ f, name: "tick" as const, volume: 0.5 })),
      { f: approve, name: "stamp", volume: 0.9 },
      { f: approve, name: "ding", volume: 0.5 },
    ],
    voice: [
      { f: ask, id: "amr_budget" },
      { f: review, id: "saeed_numbers" },
      { f: approve, id: "saeed_ok" },
    ],
  };
  return { arrive, ask, folder, focus, review, checks, approve, cues };
};

/** the request document, shown as a clean insert card */
const RequestCard: React.FC<{ frame: number; c: ReturnType<typeof cfoCues> }> = ({ frame, c }) => {
  const k = popIn(frame, c.review - 2, 240, 18);
  const stamp = frame >= c.approve ? popIn(frame, c.approve - 1, 500, 12) : 0;
  const away = easeInOut(clamp01((frame - c.approve - BEAT_FRAMES * 1.5) / 10));
  return (
    <div style={{ position: "absolute", right: 90, top: 170, width: 560, transform: `translate(${away * 760}px, ${(1 - k) * 60}px) rotate(${2 - (1 - k) * 4}deg)`, opacity: clamp01(k * 2), fontFamily: FONT }}>
      <div style={{ background: PAPER, border: `${STROKE}px solid ${INK}`, borderRadius: 16, padding: "30px 34px", boxShadow: `14px 14px 0 rgba(118,173,222,0.55)` }}>
        <div style={{ fontWeight: 900, fontSize: 34, letterSpacing: 3, color: INK }}>BUDGET REQUEST</div>
        <div style={{ fontWeight: 700, fontSize: 20, color: "#7A8496", marginTop: 4, letterSpacing: 3 }}>MA HAWA · EVENTS SEASON</div>
        <div style={{ height: 4, background: ACCENT, margin: "18px 0 14px", borderRadius: 2 }} />
        {ITEMS.map((it, i) => {
          const ok = frame >= c.checks[i];
          const pk = popIn(frame, c.checks[i], 500, 12);
          return (
            <div key={it} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: "2px solid #E6EBF2" }}>
              <span style={{ width: 34, height: 34, borderRadius: 8, border: `4px solid ${INK}`, display: "inline-flex", alignItems: "center", justifyContent: "center", background: ok ? "#3FBF6F" : PAPER, color: PAPER, fontWeight: 900, fontSize: 24, transform: `scale(${ok ? 1 + (1 - pk) * 0.4 : 1})` }}>{ok ? "✓" : ""}</span>
              <span style={{ fontWeight: 700, fontSize: 30, color: INK, flex: 1 }}>{it}</span>
              <span style={{ width: 120, height: 14, borderRadius: 7, background: ok ? ACCENT : "#DDE3EA" }} />
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontWeight: 900, fontSize: 30, color: INK }}>
          <span>TOTAL</span>
          <span style={{ color: frame >= c.checks[3] ? "#3FBF6F" : "#9AA3B2" }}>{frame >= c.checks[3] ? "WITHIN PLAN ✓" : "…"}</span>
        </div>
      </div>
      {stamp > 0 && (
        <div style={{ position: "absolute", left: 0, top: 160, transform: `rotate(-12deg) scale(${1 + (1 - stamp) * 1.4})`, opacity: clamp01(stamp * 3), border: "10px solid #2E9E5B", color: "#2E9E5B", borderRadius: 16, padding: "6px 24px", fontWeight: 900, fontSize: 70, letterSpacing: 7, background: "rgba(255,255,255,0.75)" }}>
          APPROVED
        </div>
      )}
    </div>
  );
};

export const S08Cfo: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => cfoCues(slot), [slot]);
  const focused = frame >= c.focus;
  const approved = frame >= c.approve;
  // camera: wide on the office, then settle towards Saeed's desk for the review
  const cam = camAt(frame, [
    [0, { x: 900, y: 540, zoom: 1.0 }],
    [c.folder, { x: 980, y: 540, zoom: 1.02 }],
    [c.review + 4, { x: 1780, y: 500, zoom: 1.3 }],
    [c.approve + 6, { x: 1800, y: 505, zoom: 1.27 }],
    [Math.round(c.approve + BEAT_FRAMES * 1.6), { x: 960, y: 540, zoom: 1.0 }],
  ]);
  // Saeed: relaxed, a light chuckle at his phone (small shoulder bounce) → focused, reading → calm nod
  const ph = beatPhase(frame);
  const sIdle = idleMotion(frame, 0.4, 0.4);
  const relaxed: Pose = withIdle({ ...POSES.phoneTalk, rArm: [24, 128], hipY: 2 + 2 * Math.abs(Math.sin(2 * Math.PI * ph)), head: -3 }, sIdle);
  const reading: Pose = { ...POSES.stand, lHand: { x: -64, y: -212 }, rHand: { x: 64, y: -212 }, head: 6 };
  const nod = approved ? Math.sin(clamp01((frame - c.approve) / (BEAT_FRAMES * 2)) * Math.PI * 2) * 5 : 0;
  const sPose: Pose = focused ? lerpPose(relaxed, { ...reading, head: reading.head + nod }, easeInOut(clamp01((frame - c.focus) / 8))) : relaxed;
  // the folder travels from Amr's hand to the desk
  const amrHand = jointScreenPos("amr", X.amr, G, 1.35, POSES.point, "handR");
  const ft = easeOut(clamp01((frame - (c.folder - 8)) / 8));
  const fx = amrHand.x + (SX - 120 - amrHand.x) * ft;
  const fy = amrHand.y + (752 - amrHand.y) * ft - Math.sin(ft * Math.PI) * 60;

  return (
    <AbsoluteFill>
      <Stage cam={cam} variant="cfo">
        <Character id="saeed" x={SX} y={G} scale={1.45} pose={sPose} expression="neutral" right={focused ? "none" : "phone"} headTilt={0} frame={frame} />
        <W>
          <rect x={SX - 300} y={760} width={600} height={26} rx={6} fill="#8C6A4A" stroke={INK} strokeWidth={STROKE} />
          <rect x={SX - 280} y={786} width={560} height={230} fill="#A47E58" stroke={INK} strokeWidth={STROKE} />
          <rect x={SX - 250} y={810} width={500} height={6} fill="#8C6A4A" />
          <g transform={`translate(${SX + 190} 760)`}>
            <path d="M -16 -34 L 16 -34 L 12 0 L -12 0 Z" fill={PAPER} stroke={INK} strokeWidth={STROKE * 0.6} />
            <rect x={-16} y={-24} width={32} height={8} fill={ACCENT} />
            {!focused && <path d={`M -4 -42 q ${4 + Math.sin(frame / 6) * 4} -10 0 -20`} fill="none" stroke={INK} strokeWidth={3} opacity={0.6} />}
          </g>
          <path d={`M ${SX - 230} 760 l 20 -46 l 50 0 l 10 46 Z`} fill="#3B4A63" stroke={INK} strokeWidth={STROKE * 0.6} />
          {frame >= c.folder - 8 && (
            <g transform={`translate(${fx} ${fy}) rotate(${-8 + ft * 6})`}>
              <rect x={-70} y={-48} width={140} height={96} rx={6} fill="#F4D58A" stroke={INK} strokeWidth={STROKE * 0.8} />
              <rect x={-70} y={-48} width={56} height={14} rx={4} fill="#E9C266" stroke={INK} strokeWidth={STROKE * 0.5} />
              <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={17} fill={INK}>
                BUDGET
              </text>
            </g>
          )}
          {!focused && frame > 4 && (
            <g transform={`translate(${SX + 150} 360) scale(${popIn(frame, 4, 300, 16)})`} opacity={0.95}>
              <rect x={-58} y={-34} width={116} height={56} rx={20} fill={PAPER} stroke={INK} strokeWidth={4} />
              <path d="M -20 22 L -32 40 L -4 22" fill={PAPER} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <text y={6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={INK}>
                haha
              </text>
            </g>
          )}
        </W>
        {CAST.map((id, i) => {
          const m = idleMotion(frame, i * 0.3, 0.5);
          const t = clamp01(frame / c.arrive);
          const startX = X[id] - 600;
          const x = startX + (X[id] - startX) * t;
          const stride = ((X[id] - startX) / Math.max(1, c.arrive)) * BEAT_FRAMES / 1.35;
          let pose: Pose = frame < c.arrive ? walkPose(POSES.relaxed, beatClock(frame) / 2 + i * 0.5, stride) : withIdle(POSES.relaxed, m);
          if (id === "amr" && frame >= c.ask && frame < c.folder + 6) pose = withIdle(POSES.point, m);
          if (approved) pose = lerpPose(pose, withIdle(id === "ali" ? POSES.flex : POSES.thumbsUp, m), easeInOut(clamp01((frame - c.approve - 2) / 8)));
          return <Character key={id} id={id} x={x} y={G} scale={1.35} pose={pose} expression={approved ? "happy" : "neutral"} left="none" headTilt={m.headTilt} frame={frame} />;
        })}
      </Stage>
      {frame >= c.review - 2 && <RequestCard frame={frame} c={c} />}
      <Chapter frame={frame} title="FINANCE" sub="SAEED'S OFFICE" />
      <NameTag frame={frame} at={6} x={SX} y={150} text={charCfg("saeed").tag ?? "Saeed"} />
      <Subtitle frame={frame} at={c.ask} frames={voiceFrames("amr_budget")} speaker="Amr" text={lineText("amr_budget")} />
      <Subtitle frame={frame} at={c.review} frames={voiceFrames("saeed_numbers")} speaker="Saeed" text={lineText("saeed_numbers")} />
      <Subtitle frame={frame} at={c.approve} frames={voiceFrames("saeed_ok")} speaker="Saeed" text={lineText("saeed_ok")} />
    </AbsoluteFill>
  );
};
