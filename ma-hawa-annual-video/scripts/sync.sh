#!/usr/bin/env bash
# Re-sync the whole video to a new song.
#   npm run sync -- path/to/song.mp3 [--start 42.5] [--bpm 128] [--duration 60]
set -euo pipefail
cd "$(dirname "$0")/.."
if [ $# -lt 1 ]; then echo "usage: npm run sync -- <audio file> [--start sec] [--bpm n]"; exit 1; fi
PY=.venv/bin/python
[ -x "$PY" ] || PY=python3
"$PY" scripts/analyze_beats.py "$@"
npx tsx scripts/print-plan.ts
