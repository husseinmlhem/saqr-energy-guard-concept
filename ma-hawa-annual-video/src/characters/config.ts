// Reads config/characters.json and resolves which face image (or placeholder) to use.
import { getStaticFiles } from "remotion";
import charactersJson from "../../config/characters.json";

export type CharId = "amr" | "ali" | "hussein" | "michael" | "saeed";
export type Expression = "neutral" | "happy" | "shocked" | "tired" | "away";
export type BodyType = "leader" | "muscle" | "genius" | "boss" | "money";

export type Outfit = {
  id: CharId;
  top: string;
  bottom: string;
  shoes: string;
  skin: string;
  accent: string;
  sleeves: "long" | "short";
  cuff?: string;
  sandals?: boolean;
  /** team tee: plain Ma Hawa blue with a small white logo on the chest */
  tee?: boolean;
};

type CharCfg = {
  name: string;
  tag: string | null;
  body: BodyType;
  faces: Partial<Record<Expression, string>>;
  placeholder: { initials: string; hair?: string };
  outfit?: Partial<Omit<Outfit, "id">>;
};

type CharactersFile = {
  headScale: number;
  expressionFallbacks: Record<Expression, Expression[]>;
  faceGeometry: { leftEye: [number, number]; rightEye: [number, number] };
  characters: Record<CharId, CharCfg>;
};

export const CHARS = charactersJson as unknown as CharactersFile;
export const HEAD_SCALE = CHARS.headScale;
/** head radius at scale 1: a "normal" stick-figure head (47px) × headScale */
export const HEAD_R = 47 * HEAD_SCALE;

let existing: Set<string> | null = null;
const fileExists = (p: string) => {
  if (!existing) {
    try {
      const files = getStaticFiles();
      existing = new Set(files.map((f) => f.name.replace(/^\/+/, "")));
    } catch {
      existing = new Set();
    }
  }
  // if the static file list is unavailable, trust the config
  return existing.size === 0 || existing.has(p.replace(/^\/+/, ""));
};

/** Face image path for a character + expression, or null → draw the placeholder. */
export const facePath = (id: CharId, expression: Expression = "neutral"): string | null => {
  const c = CHARS.characters[id];
  if (!c) return null;
  const order: Expression[] = [expression, ...(CHARS.expressionFallbacks[expression] ?? []), "neutral", "happy", "shocked", "tired"];
  for (const e of order) {
    const p = c.faces?.[e];
    if (p && fileExists(p)) return p;
  }
  return null;
};

export const charCfg = (id: CharId) => CHARS.characters[id];

export const outfitOf = (id: CharId): Outfit => ({
  id,
  top: "#FFFFFF",
  bottom: "#2E3440",
  shoes: "#222222",
  skin: "#B98E78",
  accent: "#76ADDE",
  sleeves: "long",
  ...(CHARS.characters[id]?.outfit ?? {}),
});

/** every face file referenced — preloaded so no frame ever shows a blank head */
export const allFacePaths = (): string[] =>
  (Object.keys(CHARS.characters) as CharId[]).flatMap((id) =>
    Object.values(CHARS.characters[id].faces ?? {}).filter((p): p is string => !!p && fileExists(p)),
  );
