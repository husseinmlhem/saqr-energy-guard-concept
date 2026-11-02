import type { SceneSlot } from "../sync/timeline";

export type SfxName = "pop" | "whoosh" | "bonk" | "stamp" | "ding" | "slam" | "sparkle" | "tick" | "boing" | "sip";

/** frames are relative to the scene start */
export type Sfx = { f: number; name: SfxName; volume?: number };
export type Mark = { f: number; name: string };
export type Cues = { marks: Mark[]; sfx: Sfx[] };

export type SceneProps = { slot: SceneSlot };
