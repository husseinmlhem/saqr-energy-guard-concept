// Scene 8 — Finance: "we need a budget"… and Saeed just doesn't hear it.
// Saeed is laughing at his phone. The team walks in; Amr: "Saeed… we need a budget."
// The laugh stops dead (record scratch, snap zoom). "Hmm…" — a little storm cloud of displeasure.
// Then he turns away, eyes up to the corner, sips his coffee and whistles. A tumbleweed rolls by.
// The team shrugs: "Okay… no budget. We'll make it work!" — and heads off to do it anyway.
// The second they're gone, Saeed is back to laughing at his phone.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, headScreenPos, jointScreenPos } from "../characters/Character";
import { charCfg } from "../characters/config";
import { POSES, Pose, lerpPose, walkPose, withIdle } from "../characters/rig";
import { clamp01, easeIn, easeInOut, easeOut, popIn, shake } from "../fx/anim";
import { NameTag } from "../fx/Fx";
import { BEAT_FRAMES, beatClock, beatPhase, idleMotion } from "../sync/beats";
import { SceneSlot, beatOf } from "../sync/timeline";
import { lineText, voiceFrames } from "../voice";
import { ACCENT, FONT, INK, PAPER, STROKE } from "../theme";
import { CAST } from "./S01Play";
import { Chapter, Notes, Shout, Stage, Subtitle, W, camAt, faceCam } from "./kit";
import { Cues, SceneProps } from "./types";
import { hipShakePose } from "./playtime";

const X = { ali: 300, amr: 590, hussein: 860 } as const;
const G = 1000;
const SX = 1440;

export const cfoCues = (slot: SceneSlot) => {
  const b = (n: number) => beatOf(slot, Math.min(n, slot.beats.length - 1));
  const arrive = b(1);
  const ask = b(2); // the word "budget" lands right on the freeze (b4)
  const freeze = b(4); // the laugh stops dead — right on the word "budget"
  const hmm = b(5);
  const away = b(6); // turns away, eyes to the corner, whistling
  const weed = b(7);
  const shrug = b(7);
  const accept = b(8); // "Okay… no budget. We'll make it work!"
  const go = b(10);
  const back = b(11); // they're gone — he's laughing again
  const cues: Cues = {
    marks: [
      { f: 0, name: "Saeed laughing at his phone; team walks in" },
      { f: ask, name: "Amr: Saeed… we need a budget." },
      { f: freeze, name: "laugh stops dead (scratch)" },
      { f: hmm, name: "Saeed: Hmm… (annoyed)" },
      { f: away, name: "turns away, eyes up to the corner, whistles" },
      { f: weed, name: "tumbleweed" },
      { f: shrug, name: "team shrugs" },
      { f: accept, name: "Amr: Okay… no budget. We'll make it work!" },
      { f: go, name: "team heads off to work" },
      { f: back, name: "Saeed back to his phone, laughing" },
    ],
    sfx: [
      { f: freeze, name: "scratch", volume: 0.8 },
      { f: away, name: "whistle", volume: 0.55 },
      { f: weed, name: "whoosh", volume: 0.25 },
      { f: shrug, name: "tick", volume: 0.35 },
      { f: accept, name: "slam", volume: 0.45 },
      { f: go, name: "whoosh", volume: 0.5 },
    ],
    voice: [
      { f: ask, id: "amr_budget" },
      { f: hmm, id: "saeed_hmm" },
      { f: accept, id: "amr_nobudget" },
    ],
  };
  return { arrive, ask, freeze, hmm, away, weed, shrug, accept, go, back, cues };
};

/** a scribbly storm cloud of displeasure over someone's head */
const Grumble: React.FC<{ x: number; y: number; frame: number; k: number }> = ({ x, y, frame, k }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp01(k * 2)}>
    {[-46, -14, 20, 50].map((cx, i) => (
      <circle key={i} cx={cx} cy={i % 2 ? -10 : 0} r={30 + (i % 2) * 6} fill="#5A6170" stroke={INK} strokeWidth={4} />
    ))}
    <rect x={-60} y={-4} width={120} height={30} fill="#5A6170" />
    <path d="M -76 26 L 76 26" stroke={INK} strokeWidth={4} />
    <path d={`M ${-30 + Math.sin(frame) * 3} -6 l 14 -12 l 8 14 l 14 -14 l 8 12 l 14 -10`} fill="none" stroke="#FFD447" strokeWidth={5} strokeLinejoin="round" />
    <path d="M -10 30 l -10 24 l 14 -4 l -8 24" fill="none" stroke="#FFD447" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
  </g>
);

const Tumbleweed: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1.45)`}>
    <circle r={44} fill="rgba(176,138,85,0.18)" stroke="#7A5A30" strokeWidth={5} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <path key={i} d={`M ${Math.cos(i) * 40} ${Math.sin(i) * 40} Q ${Math.cos(i + 2) * 10} ${Math.sin(i + 3) * 10} ${Math.cos(i + 3.4) * 42} ${Math.sin(i + 3.4) * 42}`} fill="none" stroke="#6A4A22" strokeWidth={5} />
    ))}
  </g>
);

export const S08Cfo: React.FC<SceneProps> = ({ slot }) => {
  const frame = useCurrentFrame();
  const c = useMemo(() => cfoCues(slot), [slot]);
  const laughing = frame < c.freeze || frame >= c.back;
  const turned = frame >= c.away && frame < c.back;
  const gone = frame >= c.go;

  // camera: wide → snap zoom on Saeed when the laugh stops → back out for the awkward silence → follow the team out
  const sh = shake(frame, [c.freeze], 10);
  const cam = camAt(frame, [
    [0, { x: 960, y: 540, zoom: 1.0 }],
    [c.freeze - 1, { x: 1000, y: 540, zoom: 1.02 }],
    [c.freeze + 3, { x: 1430, y: 470, zoom: 1.7 }],
    [c.away + 4, { x: 1420, y: 480, zoom: 1.6 }],
    [c.weed + 4, { x: 1060, y: 540, zoom: 1.06 }],
    // close-up: Amr — "Okay… no budget? No problem!"
    [c.accept + 4, faceCam(headScreenPos("amr", X.amr, G, 1.35, POSES.pointUp), 1.9, 240, 170)],
    [c.go - 2, faceCam(headScreenPos("amr", X.amr, G, 1.35, POSES.pointUp), 1.95, 240, 170)],
    [c.back, { x: 1000, y: 540, zoom: 1.02 }],
    [slot.durationInFrames, { x: 1200, y: 520, zoom: 1.12 }],
  ]);
  cam.x += sh.x;
  cam.y += sh.y;

  // ---- Saeed
  const ph = beatPhase(frame);
  const sIdle = idleMotion(frame, 0.4, 0.4);
  const laughPose: Pose = withIdle({ ...POSES.phoneTalk, rArm: [24, 128], hipY: 3 + 4 * Math.abs(Math.sin(2 * Math.PI * ph)), head: -6 + 3 * Math.sin(2 * Math.PI * ph) }, sIdle);
  const frozen: Pose = { ...POSES.phoneTalk, rArm: [24, 128], hipY: 2, head: 0 };
  const grumpy: Pose = withIdle({ ...POSES.armsCrossed, lean: -3, head: -2 }, sIdle);
  const ignore: Pose = withIdle({ ...POSES.sip, lean: -4, head: -8 }, sIdle);
  let sPose: Pose = laughPose;
  if (!laughing) {
    if (frame < c.hmm) sPose = frozen;
    else if (frame < c.away) sPose = lerpPose(frozen, grumpy, easeInOut(clamp01((frame - c.hmm) / 6)));
    else sPose = lerpPose(grumpy, ignore, easeInOut(clamp01((frame - c.away) / 6)));
  }
  const sRight = laughing || frame < c.hmm ? "phone" : turned && frame >= c.away + 3 ? "coffee" : "none";
  const sHead = headScreenPos("saeed", SX, G, 1.45, sPose, turned);

  // ---- the team
  const team = CAST.map((id, i) => {
    const m = idleMotion(frame, i * 0.3, 0.5);
    const tIn = clamp01(frame / c.arrive);
    const startX = X[id] - 600;
    let x = startX + (X[id] - startX) * tIn;
    let pose: Pose = frame < c.arrive ? walkPose(POSES.relaxed, beatClock(frame) / 2 + i * 0.5, ((X[id] - startX) / Math.max(1, c.arrive)) * BEAT_FRAMES / 1.35) : withIdle(POSES.relaxed, m);
    let flip = false;
    let tilt = m.headTilt;
    if (id === "amr" && frame >= c.ask - 4 && frame < c.weed) pose = withIdle(POSES.holdSign, m);
    if (frame >= c.weed && frame < c.shrug) tilt = (i === 0 ? 8 : i === 2 ? -8 : 0) + m.headTilt; // look at each other
    if (frame >= c.shrug && frame < c.accept) pose = lerpPose(pose, withIdle(POSES.shrug, m), easeOut(clamp01((frame - c.shrug) / 5)));
    if (frame >= c.accept && frame < c.go) pose = lerpPose(withIdle(POSES.shrug, m), id === "ali" ? hipShakePose("ali", frame) : withIdle(id === "amr" ? POSES.pointUp : POSES.thumbsUp, m), easeOut(clamp01((frame - c.accept) / 6)));
    if (gone) {
      const t = (frame - c.go) / BEAT_FRAMES;
      x = X[id] - easeIn(clamp01(t / 1.6)) * 1400;
      pose = walkPose(POSES.relaxed, beatClock(frame) + i * 0.5, 70, -1, 22);
      flip = true;
    }
    return { id, x, pose, flip, tilt };
  });
  const amr = team[1];
  const hl = jointScreenPos("amr", amr.x, G, 1.35, amr.pose, "handL", amr.flip);
  const hr = jointScreenPos("amr", amr.x, G, 1.35, amr.pose, "handR", amr.flip);
  const folderAt = { x: (hl.x + hr.x) / 2, y: (hl.y + hr.y) / 2 };
  const weedT = clamp01((frame - c.weed + 6) / (c.accept - c.weed + 6));

  return (
    <AbsoluteFill>
      <Stage cam={cam} variant="cfo">
        <Character id="saeed" x={SX} y={G} scale={1.45} pose={sPose} flip={turned} expression={turned ? "away" : "neutral"} right={sRight} left="none" headTilt={turned ? -6 : 0} frame={frame} />
        <W>
          {/* desk */}
          <rect x={SX - 300} y={760} width={600} height={26} rx={6} fill="#8C6A4A" stroke={INK} strokeWidth={STROKE} />
          <rect x={SX - 280} y={786} width={560} height={230} fill="#A47E58" stroke={INK} strokeWidth={STROKE} />
          <rect x={SX - 250} y={810} width={500} height={6} fill="#8C6A4A" />
          <path d={`M ${SX - 230} 760 l 20 -46 l 50 0 l 10 46 Z`} fill="#3B4A63" stroke={INK} strokeWidth={STROKE * 0.6} />
          {/* "haha" while laughing; it pops when the laugh stops */}
          {laughing && frame > 4 && (
            <g transform={`translate(${SX + 170} ${350 + Math.sin(frame / 4) * 4}) scale(${popIn(frame, frame < c.freeze ? 4 : c.back, 300, 16)})`}>
              <rect x={-70} y={-36} width={140} height={60} rx={22} fill={PAPER} stroke={INK} strokeWidth={4} />
              <path d="M -24 24 L -36 44 L -6 24" fill={PAPER} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={INK}>
                {Math.floor(frame / 5) % 2 ? "HAHA" : "haha"}
              </text>
            </g>
          )}
          {!laughing && frame < c.hmm + 4 && (
            <g opacity={1 - clamp01((frame - c.freeze) / 8)}>
              {[0, 1, 2, 3, 4].map((k) => (
                <circle key={k} cx={SX + 170 + Math.cos(k * 1.3) * (20 + (frame - c.freeze) * 6)} cy={350 + Math.sin(k * 1.3) * (20 + (frame - c.freeze) * 6)} r={6} fill={PAPER} stroke={INK} strokeWidth={3} />
              ))}
            </g>
          )}
          {/* displeasure: a little storm cloud */}
          {frame >= c.hmm && frame < c.away + 6 && <Grumble x={sHead.x} y={sHead.y - sHead.r - 70} frame={frame} k={popIn(frame, c.hmm, 380, 13) * (1 - clamp01((frame - c.away - 2) / 4))} />}
          {/* ignoring: whistling, eyes on the corner */}
          {turned && <Notes frame={frame} at={c.away + 2} x={sHead.x + sHead.r * 0.7} y={sHead.y - sHead.r * 0.3} />}
          {/* the folder in Amr's hand */}
          {!gone && frame >= c.ask - 4 && frame < c.shrug && (
            <g transform={`translate(${folderAt.x} ${folderAt.y - 8}) rotate(${-4})`}>
              <rect x={-60} y={-42} width={120} height={84} rx={6} fill="#F4D58A" stroke={INK} strokeWidth={STROKE * 0.8} />
              <rect x={-60} y={-42} width={48} height={12} rx={4} fill="#E9C266" stroke={INK} strokeWidth={STROKE * 0.5} />
              <text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={16} fill={INK}>
                BUDGET
              </text>
            </g>
          )}
          {/* awkward silence */}
          {frame >= c.weed - 6 && frame < c.accept + 10 && <Tumbleweed x={1900 - weedT * 1700} y={G - 60 - Math.abs(Math.sin(weedT * 9)) * 50} rot={-weedT * 900} />}
        </W>
        {team.map(({ id, x, pose, flip, tilt }) => (
          <Character key={id} id={id} x={x} y={G} scale={1.35} pose={pose} flip={flip} expression={frame >= c.accept ? "happy" : frame >= c.freeze ? "neutral" : "happy"} left="none" right="none" headTilt={tilt} frame={frame} />
        ))}
        {frame >= c.weed && frame < c.accept && (
          <W>
            <g transform={`translate(${X.amr + 40} ${G - 600}) scale(${popIn(frame, c.weed + 2, 380, 14)})`}>
              <rect x={-62} y={-40} width={124} height={64} rx={24} fill={PAPER} stroke={INK} strokeWidth={4} />
              <path d="M -10 24 L -20 46 L 10 24" fill={PAPER} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>
                …
              </text>
            </g>
          </W>
        )}
      </Stage>
      <Shout frame={frame} x={700} y={300} size={110} speaker="AMR" lines={[[{ text: "NO BUDGET?", at: c.accept }], [{ text: "NO PROBLEM!", at: c.accept + 6 }]]} hideAt={c.go + 4} />
      <Chapter frame={frame} title="FINANCE" sub="SAEED'S OFFICE" />
      <NameTag frame={frame} at={6} x={SX} y={150} text={charCfg("saeed").tag ?? "Saeed"} />
      <Subtitle frame={frame} at={c.ask} frames={Math.min(voiceFrames("amr_budget"), c.hmm - c.ask - 2)} speaker="Amr" text={lineText("amr_budget")} />
      <Subtitle frame={frame} at={c.hmm} frames={Math.max(voiceFrames("saeed_hmm"), Math.round(BEAT_FRAMES * 1.6))} speaker="Saeed" text={lineText("saeed_hmm")} />
      <Subtitle frame={frame} at={c.accept} frames={voiceFrames("amr_nobudget")} speaker="Amr" text={lineText("amr_nobudget")} />
      {/* a little accent flash on the record scratch */}
      <AbsoluteFill style={{ background: ACCENT, opacity: frame >= c.freeze ? Math.exp(-(frame - c.freeze) / 2) * 0.25 : 0, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
