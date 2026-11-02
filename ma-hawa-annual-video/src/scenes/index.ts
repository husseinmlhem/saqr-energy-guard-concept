// One component per scene + its cue sheet (beat-snapped hits, SFX, debug labels).
import React from "react";
import type { SceneId, SceneSlot } from "../sync/timeline";
import { S1Playtime, playtimeCues } from "./S1Playtime";
import { S2Ceo, ceoCues } from "./S2Ceo";
import { S3Huddle, huddleCues } from "./S3Huddle";
import { S4Cfo, cfoCues } from "./S4Cfo";
import { S5HardWork, hardworkCues } from "./S5HardWork";
import { S6Events, eventsCues } from "./S6Events";
import { S7Finale, finaleCues } from "./S7Finale";
import { Cues, SceneProps } from "./types";

export const SCENES: Record<SceneId, { Component: React.FC<SceneProps>; cues: (slot: SceneSlot) => { cues: Cues } }> = {
  playtime: { Component: S1Playtime, cues: playtimeCues },
  ceo: { Component: S2Ceo, cues: ceoCues },
  huddle: { Component: S3Huddle, cues: huddleCues },
  cfo: { Component: S4Cfo, cues: cfoCues },
  hardwork: { Component: S5HardWork, cues: hardworkCues },
  events: { Component: S6Events, cues: eventsCues },
  finale: { Component: S7Finale, cues: finaleCues },
};
