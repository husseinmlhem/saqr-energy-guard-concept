// Spoken lines: which file plays, how long it lasts (for ducking + subtitles), who says it.
import { getStaticFiles } from "remotion";
import voicesJson from "../config/voices.json";
import durationsJson from "../assets/voice/durations.json";
import { FPS } from "./sync/beats";

type Line = { speaker: string; text: string; prompt?: string };
export const VOICES = voicesJson as unknown as { lines: Record<string, Line>; speakers: Record<string, { voiceId: string; voiceName: string }> };
const DUR = durationsJson as Record<string, number>;

let files: Set<string> | null = null;
const exists = (p: string) => {
  if (!files) {
    try {
      files = new Set(getStaticFiles().map((f) => f.name.replace(/^\/+/, "")));
    } catch {
      files = new Set();
    }
  }
  return files.size === 0 ? !!DUR[p.replace(/^voice\//, "").replace(/\.wav$/, "")] : files.has(p);
};

/** the audio file for a line, or null if it hasn't been generated / recorded yet */
export const voiceFile = (id: string): string | null => {
  const p = `voice/${id}.wav`;
  return DUR[id] && exists(p) ? p : null;
};

/** length of a line in frames (measured, or estimated from the words when there is no audio yet) */
export const voiceFrames = (id: string): number => {
  const d = DUR[id] ?? 0.4 + (VOICES.lines[id]?.text.split(" ").length ?? 3) * 0.32;
  return Math.round(d * FPS);
};

export const lineText = (id: string) => VOICES.lines[id]?.text ?? "";
export const lineSpeaker = (id: string) => VOICES.lines[id]?.speaker ?? "";
