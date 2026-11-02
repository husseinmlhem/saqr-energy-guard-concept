# Ma Hawa — Annual Meeting Video (~91 s, beat-synced, with voices)

A 1920×1080, 30 fps animated film built in **Remotion (React)**. It has real-photo heads on clothed bodies (outfit colours taken from each photo) and is set in a Ma Hawa office with depth, camera moves, and day/night lighting. It has spoken dialogue (ElevenLabs), with the music ducking under every line. Every cut, hit, caption and line comes from the music analysis in `config/beats.json`.

### Storyline (one React component per scene, `src/scenes/S00…S13`)

| # | Scene | Music moment |
|---|---|---|
| 0 | **Title**: the camera glides across the office, MA HAWA slams in on the beats | 1 bar |
| 1 | **Pump party**: Ali, Amr (centre) and Hussein inflate balloons with floor pumps. The handle goes down on every beat. Then they dance | 4 bars |
| 2 | **"STOP PLAYING!"** (voiced): Michael leans in from the edge of the screen. Balloons go behind backs. He leaves and the party resumes | **first hard break** (bass drops out) |
| 3 | **BONK**: the bat swings in from the edge. "I WANT IDEAS!" | 1 bar |
| 4 | **Lots of ideas**: a sticky note flies onto the board on every beat, then goes to Michael | 2 bars |
| 5 | **"I WANT MORE CREATIVE IDEAS!"** | 1 bar |
| 6 | **Creative huddle** (top-down), EUREKA | 2 bars |
| 7 | **The pitch**: Hussein drives the deck. "EXCELLENT! MAKE IT HAPPEN!" | the song's accent bar |
| 8 | **Finance**: Saeed is relaxed with his coffee. "Saeed… we need a budget." He becomes focused and reviews the request; each line checks out on the beat. "Approved. Spend it wisely." | 3 bars |
| 9 | **AMR · The plan**: client call, the project timeline locks in row by row on the beat. "Timeline's locked. Let's go, team!" | 2 bars |
| 10 | **ALI · The build**: at the exhibition hall he lifts the LED-wall crate ("Leave the heavy lifting to me!"), the booth walls slam in on the beat, and the lights come on in the quiet bar | 2 bars (2nd = breakdown) |
| 11 | **HUSSEIN · The night shift**: everyone heads home, he stays. Exports fill on every beat of the build-up. "And… done!", then a dive into his screen | quiet bar + build-up |
| 12 | **Events**: the wall bursts out of his screen, one stamp per beat, gold badge, 45+ | **the biggest drop** |
| 13 | **Finale**: they walk back, "GREAT WORK, GUYS!" in the song's second break, then the **hero shot as the beat returns**, then the logo | 6 bars |

It is synced to *7mama — Sheshtawy* (95 BPM), song window **27.9 s → 118.8 s** (`musicWindow` in `config/video.json`).

### Voices
- **Lines and speakers:** `config/voices.json`. Each speaker has a fixed ElevenLabs voice; the `prompt` is what was generated, including v4 tags like `[shouting]`.
- **Audio files:** `assets/voice/raw/<line>.mp3`. Running `npm run voices` trims silence, levels loudness to -16 LUFS, and measures durations into `assets/voice/durations.json`.
- **Missing lines:** a line with no audio file still shows its caption or subtitle, so the video always renders.
- **Real recordings:** to use real recordings of the actual people, record the line, save it as `assets/voice/raw/<line>.wav`, run `npm run voices` and re-render.
- **Ducking:** the music drops to `audio.duckTo` (45%) under each line. Voice level is set by `audio.voiceVolume`.

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
npm run sync -- song.mp3 --start 42.5       # force where the window starts (snapped to a downbeat)
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
| `audio.segmentStart/End` | if the song is longer than `musicWindow.duration`, the best window (break early → build-up → biggest drop near the end), with `fadeOut` |

How the video locks to it (`src/sync/timeline.ts`):

- **Scene cuts** land on downbeats. Dynamic programming over the downbeats picks the cuts closest to the target lengths in `config/video.json`.
- **"STOP PLAYING!"** lands on a hard break (also a bass drop-out) or a quiet part, near `anchors.breakTarget`.
- **Events** start on the biggest drop. The **hero shot** lands where the beat returns after the last break, and "GREAT WORK, GUYS!" is spoken in that break.
- **Action hits** are on beats. Each scene builds a cue sheet from its own beats: pump strokes, the STOP/PLAYING words, the bat hit, sticky notes, bulbs, slides, the HA!s and the scratch, hammer/ticks/exports, stamps (one per beat), badge, counter, and the hero pose.
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

## Characters and motion

- **Bodies** (`src/characters/Character.tsx`) are outlined "tubes": a dark under-stroke plus a coloured over-stroke, so joints are seamless. They have hands, shoes, a neck, and a torso cut to each outfit: Amr's gingham shirt and tie, Ali's knit tee, Hussein's navy tee, Michael's blazer, Saeed's kandura with his ghutra falling onto the shoulders.
- **Heads** are the photo cut-outs (no circle frame), outlined and faded into the drawn neck. `headScale` in `config/characters.json` sets head size: 1.0 is realistic, 1.45 is used now.
- **Outfit colours** live in `config/characters.json → outfit` (`top`, `bottom`, `shoes`, `skin`, `accent`, `sleeves: long|short`).
- **Rig** (`src/characters/rig.ts`): two-bone IK keeps feet planted. Bounces bend the knees instead of sliding the body, and hands can be placed at the mouth or chest (`lHand` / `rHand` / `hold`).
  - Walk cycle: the stance foot stays put, the swing foot lifts, and the hips bob.
  - Pose changes ease naturally, and the arms lag a few frames behind the body (follow-through).
- **Idle groove** (`idleMotion`): the knees dip exactly on every beat, weight shifts once per bar, and the head sways every two beats. Each person is slightly offset so the group never moves like one robot.
- **No drawn goggles:** Hussein's own glasses are in his photo.
- **Amr is always in the centre:** Ali | Amr | Hussein in every group shot. He's at the head of the huddle, in the middle panel of the split screen, and front and centre (larger) in the hero shot.

## Edit the content

| What | Where |
|---|---|
| Scene lengths, CEO/hero anchors | `config/video.json` → `scenes`, `anchors` |
| Event names, award, "45+" count | `config/video.json` → `events`, `award`, `eventCount` |
| Spoken lines (STOP PLAYING!, I WANT IDEAS!, …) | `config/video.json` → `lines` |
| Sticky-note ideas, pitch slides, title | `config/video.json` → `ideas`, `pitchSlides`, `title` |
| Video length + where the break/drop should sit when re-syncing | `config/video.json` → `musicWindow` |
| Office set (walls, windows, brand wall, CFO office) | `src/world/Office.tsx` |
| Realistic screens (3D, edit, code, dashboard, export) | `src/world/Screens.tsx` |
| Logo | put the file in `assets/logo/` and set `brand.logo` (e.g. `"logo/ma-hawa.png"`) — until then a wordmark placeholder is shown |
| Colours | `config/video.json` → `brand` (accent `#76ADDE`) |
| Music / SFX volume, SFX on/off | `config/video.json` → `audio` |
| A scene's animation | `src/scenes/S00Title.tsx` … `S11Finale.tsx` (one component per scene; shared pieces in `kit.tsx`) |
| Poses | `src/characters/rig.ts` → `POSES` (angles, or IK targets `lHand`/`rHand`/`lFoot`/`rFoot`) |
| Outfit colours, head size | `config/characters.json` → `outfit`, `headScale` |
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
