// One component per scene + its cue sheet (beat-snapped hits, SFX, voice, debug labels).
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
import { S09Amr, amrCues } from "./S09Amr";
import { S10Ali, aliCues } from "./S10Ali";
import { S11Hussein, husseinCues } from "./S11Hussein";
import { S12Events, eventsCues } from "./S12Events";
import { S13Finale, finaleCues } from "./S13Finale";
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
  amr: { Component: S09Amr, cues: amrCues },
  ali: { Component: S10Ali, cues: aliCues },
  hussein: { Component: S11Hussein, cues: husseinCues },
  events: { Component: S12Events, cues: eventsCues },
  finale: { Component: S13Finale, cues: finaleCues },
};
