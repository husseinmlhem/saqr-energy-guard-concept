import type { SceneSlot } from "../sync/timeline";

export type SfxName = "pop" | "whoosh" | "bonk" | "stamp" | "ding" | "slam" | "sparkle" | "tick" | "boing" | "sip" | "puff" | "scratch" | "whistle";

/** frames are relative to the scene start */
export type Sfx = { f: number; name: SfxName; volume?: number };
export type Mark = { f: number; name: string };
/** a spoken line (config/voices.json id) starting at a beat */
/** sub: show it as a subtitle from the shared subtitle layer (lines a scene does not caption itself) */
export type VoiceCue = { f: number; id: string; sub?: boolean };
export type Cues = { marks: Mark[]; sfx: Sfx[]; voice?: VoiceCue[] };

export type SceneProps = { slot: SceneSlot };
