# Ma Hawa — Annual Meeting Video (60 s, beat-synced)

A 1920×1080, 30 fps "Bobblehead Line Art" animation built in **Remotion (React)**.
Every scene is a React component, and every cut, hit and bounce comes from the music analysis in `config/beats.json`.

```
Playtime → CEO enters → The huddle → The CFO → Hard work → Events → Finale (hero shot + logo)
```

> **About the music in this version:** no audio file came through with the original request, so the
> preview uses a **synthesised stand-in track** (`assets/audio/placeholder.wav`, 124 BPM, with a quiet intro, a hard
> break, a build-up and a drop). Drop in the real song with one command (see *Re-sync to a new song*) and the
> whole video re-times itself.

---

## Quick start

```bash
cd ma-hawa-annual-video
npm run setup           # npm install + Python venv (librosa, MediaPipe, rembg…)
npm run placeholder     # regenerate the stand-in track (or: npm run sync -- your-song.mp3)
npm run faces           # build the heads from assets/faces/raw/ (photos are kept out of git)

npm run studio          # live editor in the browser (pick MaHawa, MaHawaDebug or CharacterSheet)
npm run render          # → out/ma-hawa-preview.mp4
npm run render:debug    # → out/ma-hawa-debug.mp4 (beat markers on screen)
npm run plan            # print the solved scene timeline in the terminal
```

Remotion downloads its own headless Chrome on first render. To use one you already have:
`REMOTION_CHROME=/path/to/chrome-headless-shell npm run render`.

---

## Swap a face

1. Put the photo(s) in `assets/faces/raw/` named `<id>_<expression>.jpg`.
   Ids: `amr`, `ali`, `hussein`, `michael`, `saeed`. Expressions: `neutral`, `happy`, `shocked`, `tired`.
   Example: `michael_neutral.jpg`, `michael_happy.jpg`.
2. Run `npm run faces` (or `npm run faces -- michael` to process only Michael).
   This removes the background, finds the face landmarks, levels the eyes, crops and scales every face to the
   same size and eye position, applies the circle mask, and matches brightness and white balance to the rest of the cast.
   Output: `assets/faces/michael_neutral.png` …
3. Edit **only** `config/characters.json`:
   ```json
   "michael": {
     "faces": { "neutral": "faces/michael_neutral.png", "happy": "faces/michael_happy.png" },
     ...
   }
   ```
4. Check it in the Studio → **CharacterSheet** composition, then re-render.

The rules:
- A missing expression falls back through `expressionFallbacks`, so `shocked` falls back to `tired`, then to `neutral`.
- A character with no faces, or whose files are missing, is drawn as a **line-art placeholder**. The placeholder has a simple face, an initials badge, and the character's outfit and prop (Michael: suit and bat; Saeed: kandura, ghutra and coffee).
- `tag` is the small "Name — Role" label shown for 1.5 s on first appearance. It is set only for Michael and Saeed.

Already-cut transparent PNGs can skip step 2. Make them 640×640 with the eyes at 47% height and about 19% apart, or adjust `faceGeometry`.

## Re-sync to a new song

```bash
npm run sync -- ~/Music/song.mp3            # copies it into assets/audio/, analyses it, prints the new plan
npm run sync -- song.mp3 --start 42.5       # force where the 60 s window starts (snapped to a downbeat)
npm run sync -- song.mp3 --bpm 128          # tempo hint if it locks to half/double time
npm run render && npm run render:debug
```

`scripts/analyze_beats.py` (librosa) writes `config/beats.json`, which contains:

| key | what |
|---|---|
| `tempo.bpm`, `beats[]` | every beat (time, frame, bar, beat-in-bar, energy), with gaps filled and refined onto the actual transients |
| `bars[]` / downbeats | 4/4 bar grid; beat 1 is chosen from kick weight and chord changes |
| `energy[]` | loudness, one value per video frame (drives the hero-shot light rays) |
| `peaks[]` | energy peaks |
| `drops[]`, `biggestDrop` | big jumps in loudness and bass on a downbeat into the loudest part of the song |
| `breaks[]`, `quiet[]` | hard breaks (energy falls off a cliff) and quiet sections |
| `audio.segmentStart/End` | if the song is longer than 60 s, the best window (build-up → drop near the end → strong ending), with `fadeOut` |

How the video locks to it (`src/sync/timeline.ts`):

- **Scene cuts** land on downbeats. A brute-force search picks the downbeats closest to the target lengths in `config/video.json`.
- **CEO entrance** lands on a hard break or quiet part near 8 s.
- **Hero shot** lands on the biggest drop, in the last 45% of the video. The finale starts a few bars before it; the logo comes on a downbeat about 4 s before the end.
- **Action hits** are on beats. Each scene builds a cue sheet from its own beats: balloon taps and pop, door slam, bat hit, light bulbs, sign, sip, stamps (one per beat), badge, counter, and the hero pose.
- **Idle motion** follows the beat grid: characters dip and squash on every beat, and heads bobble once every two beats.
- **SFX** (pop, whoosh, bonk, stamp, ding, slam, sparkle, tick, boing, sip) play at those same cue frames, under the music.

### Beats debug mode
Render `MaHawaDebug`, or open it in the Studio. It shows:
- a border that flashes on every beat (red on downbeats)
- a bar / beat counter
- the current scene
- each cue's label at the frame it fires
- a timeline strip with scenes, beat ticks, energy, quiet parts, the break and the DROP

If any cue is off-beat, the panel flags it.

## Edit the content

| What | Where |
|---|---|
| Scene lengths, CEO/hero anchors | `config/video.json` → `scenes`, `anchors` |
| Event names, award, "45+" count | `config/video.json` → `events`, `award`, `eventCount` |
| Speech lines ("We need creative ideas!", "BUDGET?", "Great work, guys!") | `config/video.json` → `lines` |
| Logo | put the file in `assets/logo/` and set `brand.logo` (e.g. `"logo/ma-hawa.png"`) — until then a wordmark placeholder is shown |
| Colours | `config/video.json` → `brand` (accent `#76ADDE`) |
| Music / SFX volume, SFX on/off | `config/video.json` → `audio` |
| A scene's animation | `src/scenes/S1Playtime.tsx` … `S7Finale.tsx` (one component per scene) |
| Poses | `src/characters/rig.ts` → `POSES` |
| Bodies / outfits / props | `src/characters/Character.tsx`, `src/characters/props.tsx` |

## Project layout

```
assets/            Remotion public dir
  audio/           music (placeholder.wav until the real song is synced)
  faces/           processed heads (+ raw/ originals) — not committed, see below
  sfx/             generated cartoon SFX (npm run sfx to regenerate)
  fonts/           Poppins (OFL)
  logo/            put the real logo here
config/
  beats.json       music analysis (generated)
  characters.json  faces / placeholders / tags
  video.json       scene targets, events, lines, brand, audio
scripts/
  analyze_beats.py      librosa beat/bar/drop/quiet analysis + segment pick
  process_faces.py      bg removal, landmark crop, circle mask, tone match
  make_sfx.py           synthesised SFX kit
  make_placeholder_track.py  stand-in music
  sync.sh               analyse + print plan
  print-plan.ts         timeline table
src/
  sync/            beats.ts (beat clock helpers) · timeline.ts (scene solver)
  characters/      rig, bobblehead component, props, config loader
  fx/              bursts, speed lines, dizzy stars, rays, bubbles, tags, balloons, bulbs
  scenes/          S1…S7 + cue sheets
  debug/           beats debug overlay
  MaHawaVideo.tsx  sequences + music + SFX
```

## Notes

- **Photos and music are not in git.** This repository is public, so `.gitignore` excludes `assets/faces/raw/`, the processed PNGs and `assets/audio/`. Keep them locally, or move the project to a private repo and remove those lines. `config/beats.json` is committed, so the timeline is reproducible. It belongs to whatever track was synced last.
- **Remotion licence:** free for individuals and companies with up to 3 people. Larger companies need a company licence; see remotion.dev/license.
- Face processing downloads two models on first run: the MediaPipe face landmarker (~4 MB) and BiRefNet-portrait for background removal (~1 GB).
