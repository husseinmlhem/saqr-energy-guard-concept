import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/index.ts");
// Everything static (faces, audio, sfx, fonts, logo) lives in /assets
Config.setPublicDir("./assets");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setCrf(20);
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);

// Optional: use a locally installed Chrome Headless Shell instead of Remotion's download
if (process.env.REMOTION_CHROME) {
  Config.setBrowserExecutable(process.env.REMOTION_CHROME);
}
