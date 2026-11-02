#!/usr/bin/env python3
"""
Voice the lines that have no studio take, locally and for free, with Kokoro TTS (Apache-2.0).

For every line in config/voices.json with a "kokoro" block {voice, speed, pitch}:
  * synthesise kokoroText (or text) with that Kokoro voice
  * optional pitch shift in semitones (ffmpeg rubberband) to sit closer to the character's other takes
  * write assets/voice/raw/<id>.wav  (a .wav take wins over an older .mp3 of the same line)
Lines that already have a recording of their own are skipped unless --force.
Then run `npm run voices` (scripts/prepare_voices.py) to trim/level them like every other line.

Model files (downloaded once): ~/.cache/mahawa-models/kokoro/{kokoro-v1.0.onnx, voices-v1.0.bin}
  https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0

Usage: .venv/bin/python scripts/tts_kokoro.py [--force] [line ids…]
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "assets" / "voice" / "raw"
MODELS = Path.home() / ".cache" / "mahawa-models" / "kokoro"

args = [a for a in sys.argv[1:] if not a.startswith("--")]
force = "--force" in sys.argv
lines = json.loads((ROOT / "config" / "voices.json").read_text())["lines"]
k = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
RAW.mkdir(parents=True, exist_ok=True)

for lid, line in lines.items():
    cfg = line.get("kokoro")
    if not cfg or (args and lid not in args):
        continue
    dst = RAW / f"{lid}.wav"
    if dst.exists() and not force:
        print(f"  ·  {lid:16s} already has a take ({dst.name})")
        continue
    text = line.get("kokoroText") or line["text"]
    y, sr = k.create(text, voice=cfg["voice"], speed=float(cfg.get("speed", 1.0)), lang="en-us")
    pitch = float(cfg.get("pitch", 0))
    if pitch:
        with tempfile.TemporaryDirectory() as td:
            src = Path(td) / "src.wav"
            sf.write(src, y, sr)
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", f"rubberband=pitch={2 ** (pitch / 12):.4f}:transients=crisp", str(dst)], check=True)
    else:
        sf.write(dst, y, sr)
    print(f"  ✓  {lid:16s} kokoro:{cfg['voice']}{f' {pitch:+.0f}st' if pitch else ''}  \"{text}\"")
