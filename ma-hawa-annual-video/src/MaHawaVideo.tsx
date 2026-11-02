// The 60-second video: scenes on downbeat-snapped slots, music, beat-locked SFX, optional debug overlay.
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, prefetch, staticFile, useCurrentFrame } from "remotion";
import { allFacePaths } from "./characters/config";
import { BeatDebug } from "./debug/BeatDebug";
import { SCENES } from "./scenes";
import { BEATS, DURATION_IN_FRAMES, FPS } from "./sync/beats";
import { PLAN, VIDEO } from "./sync/timeline";
import { PAPER } from "./theme";

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

      {/* music: the analysed segment of the track, faded in/out */}
      <Audio
        src={staticFile(a.file)}
        trimBefore={Math.round(a.segmentStart * FPS)}
        volume={(f) => VIDEO.audio.musicVolume * Math.min(1, f / fadeIn) * Math.min(1, Math.max(0, (D - f) / fadeOut))}
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
