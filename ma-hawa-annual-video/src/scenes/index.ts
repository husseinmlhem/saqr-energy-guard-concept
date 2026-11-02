// One component per scene + its cue sheet (beat-snapped hits, SFX, debug labels).
import React from "react";
import type { SceneId, SceneSlot } from "../sync/timeline";
import { S00Title, titleCues } from "./S00Title";
import { S01Pump, pumpCues } from "./S01Pump";
import { S02Stop, stopCues } from "./S02Stop";
import { S03Bonk, bonkCues } from "./S03Bonk";
import { S04Brainstorm, brainstormCues } from "./S04Brainstorm";
import { S05MoreCreative, moreCreativeCues } from "./S05MoreCreative";
import { S06Creative, creativeCues } from "./S06Creative";
import { S07Pitch, pitchCues } from "./S07Pitch";
import { S08Cfo, cfoCues } from "./S08Cfo";
import { S09Execute, executeCues } from "./S09Execute";
import { S10Events, eventsCues } from "./S10Events";
import { S11Finale, finaleCues } from "./S11Finale";
import { Cues, SceneProps } from "./types";

export const SCENES: Record<SceneId, { Component: React.FC<SceneProps>; cues: (slot: SceneSlot) => { cues: Cues } }> = {
  title: { Component: S00Title, cues: titleCues },
  pump: { Component: S01Pump, cues: pumpCues },
  stop: { Component: S02Stop, cues: stopCues },
  bonk: { Component: S03Bonk, cues: bonkCues },
  brainstorm: { Component: S04Brainstorm, cues: brainstormCues },
  moreCreative: { Component: S05MoreCreative, cues: moreCreativeCues },
  creative: { Component: S06Creative, cues: creativeCues },
  pitch: { Component: S07Pitch, cues: pitchCues },
  cfo: { Component: S08Cfo, cues: cfoCues },
  execute: { Component: S09Execute, cues: executeCues },
  events: { Component: S10Events, cues: eventsCues },
  finale: { Component: S11Finale, cues: finaleCues },
};
