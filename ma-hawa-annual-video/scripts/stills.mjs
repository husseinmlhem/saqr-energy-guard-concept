// Dev helper: render a list of frames to PNGs with one bundle.  node scripts/stills.mjs out/stills 0 100 200 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [outDir, ...frames] = process.argv.slice(2);
const comp = process.env.COMP || "MaHawa";
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("assets") });
const browserExecutable = process.env.REMOTION_CHROME || null;
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable });
for (const f of frames) {
  await renderStill({ serveUrl, composition, frame: Number(f), output: path.join(outDir, `f${String(f).padStart(4, "0")}.png`), browserExecutable, scale: 0.5 });
  process.stdout.write(`${f} `);
}
console.log("done");
