import React from "react";
import { Composition, continueRender, delayRender } from "remotion";
import { CharacterSheet } from "./CharacterSheet";
import { MaHawaVideo } from "./MaHawaVideo";
import { DURATION_IN_FRAMES, FPS } from "./sync/beats";
import { H, W, loadFonts } from "./theme";

const fontHandle = delayRender("Loading Poppins");
loadFonts()
  .then(() => continueRender(fontHandle))
  .catch((e) => {
    console.error(e);
    continueRender(fontHandle);
  });

export const RemotionRoot: React.FC = () => (
  <>
    {/* Final video */}
    <Composition
      id="MaHawa"
      component={MaHawaVideo}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ debug: false }}
    />
    {/* Same video with beat markers / cue labels for checking sync */}
    <Composition
      id="MaHawaDebug"
      component={MaHawaVideo}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ debug: true }}
    />
    {/* Check faces after editing config/characters.json */}
    <Composition id="CharacterSheet" component={CharacterSheet} durationInFrames={120} fps={FPS} width={W} height={H} />
  </>
);
