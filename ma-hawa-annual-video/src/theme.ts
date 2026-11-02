import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { VIDEO } from "./sync/timeline";

export const INK = VIDEO.brand.ink;
export const ACCENT = VIDEO.brand.accent;
export const PAPER = VIDEO.brand.paper;
export const GOLD = VIDEO.brand.gold;
export const ACCENT_SOFT = "rgba(118,173,222,0.28)";
export const STROKE = 6;
export const FONT = "Poppins, Inter, 'Helvetica Neue', Arial, sans-serif";
export const W = 1920;
export const H = 1080;

let fontsPromise: Promise<unknown> | null = null;
export const loadFonts = () => {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      [500, 700, 800, 900].map((w) =>
        loadFont({ family: "Poppins", url: staticFile(`fonts/Poppins-${w}.woff2`), weight: String(w) }),
      ),
    );
  }
  return fontsPromise;
};
