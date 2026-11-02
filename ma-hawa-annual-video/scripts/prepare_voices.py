#!/usr/bin/env python3
"""
Prepare spoken lines for the video.

assets/voice/raw/<id>.(mp3|wav|m4a)  →  assets/voice/<id>.wav
  * leading/trailing silence trimmed (so a line starts exactly on its beat)
  * loudness levelled to -16 LUFS (all speakers sit at the same level)
  * duration written to assets/voice/durations.json (used to duck the music)

Usage: .venv/bin/python scripts/prepare_voices.py
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "assets" / "voice" / "raw"
OUT = ROOT / "assets" / "voice"
lines = json.loads((ROOT / "config" / "voices.json").read_text())["lines"]

durations = {}
for lid in lines:
    src = next((p for ext in ("wav", "mp3", "m4a", "aac", "ogg") for p in [RAW / f"{lid}.{ext}"] if p.exists()), None)
    if not src:
        print(f"  ·  {lid:16s} (no recording yet — caption only)")
        continue
    dst = OUT / f"{lid}.wav"
    trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02"
    af = f"{trim},areverse,{trim},areverse,loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=0.05"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", af, "-ar", "44100", "-ac", "1", str(dst)], check=True)
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(dst)], capture_output=True, text=True, check=True).stdout)
    durations[lid] = round(d, 3)
    print(f"  ✓  {lid:16s} {d:.2f}s")
(OUT / "durations.json").write_text(json.dumps(durations, indent=2) + "\n")
print(f"{len(durations)}/{len(lines)} lines ready → assets/voice/durations.json")
