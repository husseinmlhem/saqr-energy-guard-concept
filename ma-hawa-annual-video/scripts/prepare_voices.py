#!/usr/bin/env python3
"""
Prepare spoken lines for the video.

assets/voice/raw/<id>.(mp3|wav|m4a)  →  assets/voice/<id>.wav
  * leading/trailing silence trimmed (so a line starts exactly on its beat)
  * broadcast-style voice chain: high-pass, presence lift, gentle compression
  * loudness measured and levelled to TARGET_LUFS (louder than the ducked music), true-peak limited
  * duration written to assets/voice/durations.json (used to duck the music and time the subtitles)

A line may declare "clipFrom": {"raw": "<other id>", "start": s, "end": s} in config/voices.json:
until it has its own take, that slice of another recording is used.

Usage: .venv/bin/python scripts/prepare_voices.py
"""
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "assets" / "voice" / "raw"
OUT = ROOT / "assets" / "voice"
TARGET_LUFS = -14.0
lines = json.loads((ROOT / "config" / "voices.json").read_text())["lines"]


def find_raw(lid: str):
    return next((p for ext in ("wav", "mp3", "m4a", "aac", "ogg") for p in [RAW / f"{lid}.{ext}"] if p.exists()), None)


def ff(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def loudness(path: Path) -> float:
    r = subprocess.run(["ffmpeg", "-v", "info", "-i", str(path), "-af", "ebur128=framelog=quiet", "-f", "null", "-"], capture_output=True, text=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])


durations = {}
for lid, line in lines.items():
    src, clip = find_raw(lid), None
    if not src and line.get("clipFrom"):
        clip = line["clipFrom"]
        src = find_raw(clip["raw"])
    if not src:
        print(f"  ·  {lid:16s} (no recording yet — subtitle only)")
        continue
    dst = OUT / f"{lid}.wav"
    trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02"
    chain = "highpass=f=85,equalizer=f=3200:t=q:w=1.2:g=3,equalizer=f=220:t=q:w=1:g=-2,acompressor=threshold=-22dB:ratio=3:attack=6:release=90:makeup=2"
    cut = ["-ss", str(clip["start"]), "-to", str(clip["end"])] if clip else []
    fade = f",afade=t=out:st={max(0.0, clip['end'] - clip['start'] - 0.12):.3f}:d=0.12" if clip else ""
    with tempfile.TemporaryDirectory() as td:
        mid = Path(td) / "mid.wav"
        ff(*cut, "-i", str(src), "-af", f"aformat=channel_layouts=mono{fade},{trim},areverse,{trim},areverse,{chain}", "-ar", "44100", "-ac", "1", str(mid))
        gain = TARGET_LUFS - loudness(mid)
        ff("-i", str(mid), "-af", f"volume={gain:.2f}dB,alimiter=limit=0.89:attack=2:release=40,apad=pad_dur=0.05", "-ar", "44100", "-ac", "1", str(dst))
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(dst)], capture_output=True, text=True, check=True).stdout)
    durations[lid] = round(d, 3)
    print(f"  ✓  {lid:16s} {d:.2f}s  {loudness(dst):6.1f} LUFS{'  (clip of ' + clip['raw'] + ')' if clip else ''}")
for stale in OUT.glob("*.wav"):
    if stale.stem not in durations:
        stale.unlink()
(OUT / "durations.json").write_text(json.dumps(durations, indent=2) + "\n")
print(f"{len(durations)}/{len(lines)} lines ready → assets/voice/durations.json")
