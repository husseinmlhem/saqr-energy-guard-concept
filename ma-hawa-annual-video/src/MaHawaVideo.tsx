// The video: scenes on downbeat-snapped slots, music, beat-locked SFX, optional debug overlay.
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, prefetch, staticFile, useCurrentFrame } from "remotion";
import { allFacePaths } from "./characters/config";
import { BeatDebug } from "./debug/BeatDebug";
import { SCENES } from "./scenes";
import { BEATS, DURATION_IN_FRAMES, FPS } from "./sync/beats";
import { PLAN, SceneId, VIDEO } from "./sync/timeline";
import { PAPER } from "./theme";
import { lineText, speakerName, voiceFile, voiceFrames } from "./voice";
import { Subtitle } from "./scenes/kit";
import { useBrandLogo } from "./brand/Logo";

export type MaHawaProps = { debug: boolean; sfx?: boolean };

type Cut = "none" | "punch" | "whip" | "zoom";
/** how each scene comes in. Every cut still lands exactly on its downbeat: the incoming move resolves in a few frames. */
const CUT_IN: Record<SceneId, Cut> = {
  title: "none",
  play: "none", // the panels slam in on their own
  stop: "punch", // the hard break
  bonk: "whip",
  brainstorm: "zoom",
  moreCreative: "punch",
  creative: "zoom",
  pitch: "whip",
  cfo: "whip",
  amr: "zoom",
  ali: "whip",
  hussein: "zoom",
  events: "none", // opens out of Hussein's monitor
  finale: "punch",
};

const Streaks: React.FC<{ k: number; dir: 1 | -1 }> = ({ k, dir }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: k, pointerEvents: "none" }}>
    {Array.from({ length: 14 }, (_, i) => {
      const y = 40 + ((i * 397) % 1000);
      const len = 380 + ((i * 211) % 700);
      const x = ((i * 523) % 1920) - len / 2 + dir * (1 - k) * 600;
      return <rect key={i} x={x} y={y} width={len} height={3 + (i % 3) * 3} rx={3} fill="#FFFFFF" opacity={0.55} />;
    })}
  </svg>
);

/** cut styles: punch (zoom-kick + flash), whip (fast pan with motion streaks), zoom (zoom-through with blur) */
const SceneCut: React.FC<{ children: React.ReactNode; cutIn: Cut; cutOut: Cut; dur: number }> = ({ children, cutIn, cutOut, dur }) => {
  const f = useCurrentFrame();
  let transform = "";
  let filter = "";
  let flash = 0;
  let streak = 0;
  // ---- in
  if (cutIn === "punch") {
    const k = Math.exp(-f / 4);
    transform = `scale(${1 + 0.035 * k})`;
    flash = f < 8 ? 0.35 * Math.exp(-f / 2) : 0;
  } else if (cutIn === "whip" && f < 6) {
    const k = 1 - easeOutCubic(f / 6);
    transform = `translateX(${-k * 170}px) scale(${1 + k * 0.2})`;
    filter = `blur(${k * 9}px)`;
    streak = k;
  } else if (cutIn === "zoom" && f < 8) {
    const k = 1 - easeOutCubic(f / 8);
    transform = `scale(${1 + k * 0.28})`;
    filter = `blur(${k * 8}px)`;
    flash = 0.18 * k;
  }
  // ---- out (only the last 3 frames, so nothing on a beat is lost)
  const left = dur - 1 - f;
  if (left < 3) {
    const k = (3 - left) / 3;
    if (cutOut === "whip") {
      transform = `translateX(${k * 150}px) scale(${1 + k * 0.18})`;
      filter = `blur(${k * 8}px)`;
      streak = Math.max(streak, k);
    } else if (cutOut === "zoom") {
      transform = `scale(${1 + k * 0.16})`;
      filter = `blur(${k * 5}px)`;
      flash = Math.max(flash, 0.14 * k);
    }
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: transform || undefined, filter: filter || undefined }}>{children}</AbsoluteFill>
      {streak > 0.02 && <Streaks k={streak} dir={left < 3 ? 1 : -1} />}
      {flash > 0.01 && <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash, pointerEvents: "none" }} />}
    </AbsoluteFill>
  );
};

/** subtitles for the lines a scene doesn't caption itself */
const SubtitleLayer: React.FC<{ cues: { at: number; id: string; len: number }[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {cues.map((v) => (
        <Subtitle key={`${v.id}-${v.at}`} frame={f} at={v.at} frames={v.len} speaker={speakerName(v.id)} text={lineText(v.id)} />
      ))}
    </AbsoluteFill>
  );
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/** fine film grain over everything: six noise tiles, cycled and offset every frame */
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const i = f % 6;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`fx/grain_${i}.png`)})`,
        backgroundSize: "384px 384px",
        backgroundPosition: `${(f * 137) % 384}px ${(f * 89) % 384}px`,
        mixBlendMode: "overlay",
        opacity: 0.09,
        pointerEvents: "none",
      }}
    />
  );
};

/** decode every face before the first frame so heads never pop in blank */
const usePreloadedFaces = () => {
  const [handle] = useState(() => delayRender("Preloading faces"));
  useEffect(() => {
    const items = allFacePaths().map((p) => prefetch(staticFile(p)));
    Promise.all(items.map((i) => i.waitUntilDone()))
      .catch((e) => console.warn("face preload failed", e))
      .finally(() => continueRender(handle));
    return () => items.forEach((i) => i.free());
  }, [handle]);
};

export const MaHawaVideo: React.FC<MaHawaProps> = ({ debug, sfx }) => {
  usePreloadedFaces();
  useBrandLogo();
  const D = DURATION_IN_FRAMES;
  const a = BEATS.audio;
  const fadeIn = Math.max(1, a.fadeIn * FPS);
  const fadeOut = Math.max(1, a.fadeOut * FPS);
  const sfxOn = sfx ?? VIDEO.audio.sfx;

  const voiceCues = useMemo(
    () =>
      PLAN.scenes.flatMap((slot) =>
        (SCENES[slot.id].cues(slot).cues.voice ?? []).flatMap((v) => {
          const file = voiceFile(v.id);
          return file ? [{ at: slot.from + v.f, id: v.id, file, len: voiceFrames(v.id), sub: !!v.sub }] : [];
        }),
      ),
    [],
  );
  // music ducks smoothly under each spoken line
  const duck = (f: number) => {
    let g = 1;
    for (const v of voiceCues) {
      const a = v.at - 4;
      const b = v.at + v.len + 6;
      const k = f < a - 6 || f > b + 10 ? 0 : f < a ? (f - (a - 6)) / 6 : f > b ? 1 - (f - b) / 10 : 1;
      g = Math.min(g, 1 - (1 - (VIDEO.audio.duckTo ?? 0.45)) * Math.max(0, Math.min(1, k)));
    }
    return g;
  };

  const cueSheets = useMemo(
    () => PLAN.scenes.map((slot) => ({ slot, cues: SCENES[slot.id].cues(slot).cues })),
    [],
  );

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {PLAN.scenes.map((slot, i) => {
        const { Component } = SCENES[slot.id];
        return (
          <Sequence key={slot.id} from={slot.from} durationInFrames={slot.durationInFrames} name={`${slot.title}`}>
            <SceneCut cutIn={CUT_IN[slot.id]} cutOut={CUT_IN[PLAN.scenes[i + 1]?.id] ?? "none"} dur={slot.durationInFrames}>
              <Component slot={slot} />
            </SceneCut>
          </Sequence>
        );
      })}

      <SubtitleLayer cues={voiceCues.filter((v) => v.sub)} />
      <Grain />

      {/* dialogue: each line on its beat cue */}
      {voiceCues.map((v, i) => (
        <Sequence key={`voice-${i}`} from={v.at} durationInFrames={Math.min(v.len + 20, D - v.at)} name={`voice ${v.id}`} layout="none">
          <Audio src={staticFile(v.file)} volume={VIDEO.audio.voiceVolume ?? 1} />
        </Sequence>
      ))}

      {/* music: the analysed segment of the track, faded in/out, ducked under dialogue */}
      <Audio
        src={staticFile(a.file)}
        trimBefore={Math.round(a.segmentStart * FPS)}
        volume={(f) => VIDEO.audio.musicVolume * Math.min(1, f / fadeIn) * Math.min(1, Math.max(0, (D - f) / fadeOut)) * duck(f)}
      />

      {/* SFX layer: every sound sits on a beat cue */}
      {sfxOn &&
        cueSheets.flatMap(({ slot, cues }) =>
          cues.sfx
            .filter((s) => slot.from + s.f < D)
            .map((s, i) => (
              <Sequence key={`${slot.id}-sfx-${i}`} from={slot.from + s.f} durationInFrames={Math.min(60, D - slot.from - s.f)} name={`sfx ${s.name}`} layout="none">
                <Audio src={staticFile(`sfx/${s.name}.wav`)} volume={VIDEO.audio.sfxVolume * (s.volume ?? 1)} />
              </Sequence>
            )),
        )}

      {debug && <BeatDebug cueSheets={cueSheets} />}
    </AbsoluteFill>
  );
};
