// The 60-second video: scenes on downbeat-snapped slots, music, beat-locked SFX, optional debug overlay.
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, prefetch, staticFile, useCurrentFrame } from "remotion";
import { allFacePaths } from "./characters/config";
import { BeatDebug } from "./debug/BeatDebug";
import { SCENES } from "./scenes";
import { BEATS, DURATION_IN_FRAMES, FPS } from "./sync/beats";
import { PLAN, VIDEO } from "./sync/timeline";
import { PAPER } from "./theme";
import { voiceFile, voiceFrames } from "./voice";

export type MaHawaProps = { debug: boolean; sfx?: boolean };

/** every cut lands on a downbeat: give it a little zoom-punch and a flash so it hits like the music */
const CutPunch: React.FC<{ children: React.ReactNode; enabled: boolean }> = ({ children, enabled }) => {
  const f = useCurrentFrame();
  const k = enabled ? Math.exp(-f / 4) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.035 * k})` }}>{children}</AbsoluteFill>
      {enabled && f < 8 && <AbsoluteFill style={{ background: "#FFFFFF", opacity: 0.35 * Math.exp(-f / 2), pointerEvents: "none" }} />}
    </AbsoluteFill>
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
          return file ? [{ at: slot.from + v.f, id: v.id, file, len: voiceFrames(v.id) }] : [];
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
      {PLAN.scenes.map((slot) => {
        const { Component } = SCENES[slot.id];
        return (
          <Sequence key={slot.id} from={slot.from} durationInFrames={slot.durationInFrames} name={`${slot.title}`}>
            <CutPunch enabled={slot.from > 0 && slot.id !== "events"}>
              <Component slot={slot} />
            </CutPunch>
          </Sequence>
        );
      })}

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
