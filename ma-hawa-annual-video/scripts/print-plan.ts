// Prints the solved timeline: `npm run plan`
import { BEATS, BPM, FPS } from "../src/sync/beats";
import { PLAN } from "../src/sync/timeline";

const s = (f: number) => (f / FPS).toFixed(2).padStart(6);
console.log(`track: ${BEATS.audio.file}  segment ${BEATS.audio.segmentStart}s → ${BEATS.audio.segmentEnd}s  ${BPM} BPM`);
for (const r of PLAN.reasons) console.log(`  · ${r}`);
console.log("\n scene        start    end   len  bars beats");
for (const sc of PLAN.scenes) {
  console.log(
    ` ${sc.id.padEnd(10)} ${s(sc.from)} ${s(sc.from + sc.durationInFrames)} ${s(sc.durationInFrames)}  ${String(sc.downbeats.length).padStart(4)} ${String(sc.beats.length).padStart(5)}` +
      (Object.keys(sc.anchors).length ? `   ${Object.entries(sc.anchors).map(([k, v]) => `${k}@${s(sc.from + v).trim()}s`).join(" ")}` : ""),
  );
}
