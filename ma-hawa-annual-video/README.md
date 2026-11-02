# Ma Hawa — Annual Meeting Video (~86 s, beat-synced, with voices)

A 1920×1080, 30 fps animated film built in **Remotion (React)**. It has real-photo heads on clothed bodies (outfit colours taken from each photo) and is set in a Ma Hawa office with depth, camera moves, and day/night lighting. It has spoken dialogue (ElevenLabs), with the music ducking under every line. The real Ma Hawa logo (`brand.logo`, drawn as live SVG) is on the title, the office wall, the booth, the hologram and the end card; the team (Ali, Amr, Hussein) wears Ma Hawa-blue tees (#76ADDE) with the logo small in white, Michael a logo pin. Cuts alternate punch / whip-pan / zoom-through, with face close-ups on the key lines and a fine film grain on top. Every cut, hit, caption and line comes from the music analysis in `config/beats.json`.

### Storyline (one React component per scene, `src/scenes/S00…S13`)

| # | Scene | Music moment |
|---|---|---|
| 0 | **Title**: the camera glides across the office, MARKETING TEAM slams in on the beats | 1 bar |
| 1 | **Playtime** (split screen, three angled panels slam in): Ali curls dumbbells (a rep on every beat), Amr on a sun lounger at the beach blowing up a balloon (a breath on every beat), Hussein with a shisha, blowing the smoke into his balloon | 2 bars |
| 2 | **"STOP PLAYING!"** (voiced): back in the office, caught mid-curl / mid-balloon / mid-shisha. Michael leans in from the edge; dumbbells, balloons and the hose go behind backs (the shisha keeps smoking). He leaves, they carry on | **first hard break** (bass drops out) |
| 3 | **BONK**: the bat swings in from the edge; balloons pop, dumbbells clatter, the umbrella keels over. "I WANT IDEAS!" | 1 bar |
| 4 | **Lots of ideas**: a sticky note flies onto the board on every beat (Ali scratches his bald head while he thinks), then goes to Michael | 2 bars |
| 5 | **"I WANT MORE CREATIVE IDEAS!"** | 1 bar |
| 6 | **Planning · the war room**: a hologram of the booth builds itself on the beat (grid, floor, walls, LED wall + logo, stage, lights, VR zone / drone show / LED tunnel); Hussein drives it from his laptop, Amr directs. EUREKA in gold | 2 bars |
| 7 | **The pitch**: Hussein drives the deck. "EXCELLENT! MAKE IT HAPPEN!" | 2 bars |
| 8 | **Finance**: Saeed is laughing at his phone. "Saeed… we need a budget." The laugh stops dead (record scratch, snap zoom), "Hmm…", a storm cloud; then he turns away, eyes up to the corner, sips his coffee and whistles. Tumbleweed. "Okay… no budget. We'll make it work!" (NO BUDGET? NO PROBLEM!) — they leave, he goes back to laughing | 3 bars |
| 9 | **AMR · The plan**: Amr thinks it through while the timeline fills on the beat; Hussein and Ali sprint back and forth around him (in front, behind, out of frame and back) until they collide — BONK, "Ow! Watch it, Ali!" — "Timeline's locked. Let's go, team!", Amr heads off and they race past him | 2 bars |
| 10 | **ALI · The build**: at the exhibition hall he lifts the LED-wall crate ("Leave the heavy lifting to me!"), the booth walls slam in on the beat, and the lights come on in the quiet bar | 2 bars (2nd = breakdown) |
| 11 | **HUSSEIN · The night shift**: everyone heads home, he stays. Exports fill on every beat of the build-up. "And… done!", then a dive into his screen | quiet bar + build-up |
| 12 | **Events**, fast: out of his screen, 45 event tiles blitz onto a full-screen wall at 8 per beat while the camera pulls back and a counter races to 45; "45+ EVENTS" slams on the next downbeat, then a **Guinness World Records · RECORD HOLDER** seal lands (`record` in `config/video.json`; set `record.logo` to the official logo file to show it instead of the drawn seal), event names race past | **the biggest drop** |
| 13 | **Finale**: they limp back, beaten up (torn shoes with toes poking out, ripped tees, band-aids, scratches with little blood drips, a black eye) — the camera tracks their faces — "GREAT WORK, GUYS!" in the song's second break, then the **hero shot as the beat returns**, then the logo | 6 bars |

It is synced to *7mama — Sheshtawy* (95 BPM), song window **32.9 s → 118.8 s** (a 3-bar intro before the break) (`musicWindow` in `config/video.json`).

### Voices
- **Lines and speakers:** `config/voices.json` — 30 lines, every one spoken, every character with several. One voice per character: Michael = ElevenLabs takes; Amr, Ali, Hussein (and Saeed's closing line) = Kokoro. Lines a scene doesn't caption itself carry `sub: true` and get a subtitle from the shared layer. Ali's signature move (hands on his head, hips shaking on the beat) is `hipShakePose` in `src/scenes/playtime.tsx`. Michael's lines, Ali's and Saeed's are ElevenLabs takes (the `prompt` is what was generated, including v4 tags like `[shouting]`). Lines with a `kokoro` block (Amr, Hussein, and Michael's "MORE creative ideas") are voiced locally and for free with Kokoro TTS: `npm run tts` (`scripts/tts_kokoro.py`, Apache-2.0 model in `~/.cache/mahawa-models/kokoro`), with an optional pitch shift to sit close to the character's other takes.
- **Audio files:** `assets/voice/raw/<line>.mp3`. Running `npm run voices` trims silence, runs a voice chain (high-pass, presence lift, gentle compression), levels every line to -14 LUFS with a true-peak limiter, and measures durations into `assets/voice/durations.json`. A line can borrow a slice of another take via `clipFrom` until it has its own.
- **Missing lines:** a line with no audio file still shows its caption or subtitle, so the video always renders.
- **Real recordings:** to use real recordings of the actual people, record the line, save it as `assets/voice/raw/<line>.wav`, run `npm run voices` and re-render.
- **Mix:** the music plays at `audio.musicVolume` (72%) and drops to `audio.duckTo` (28%, about -11 dB) under each line, so the voices sit well above it. Voice level is set by `audio.voiceVolume`.

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
   Ids: `amr`, `ali`, `hussein`, `michael`, `saeed`. Expressions: `neutral`, `happy`, `shocked`, `tired`, `away` (looking off to the side — used for Saeed ignoring the budget).
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
| Logo | put the file in `assets/logo/` and set `brand.logo` (e.g. `"logo/ma-hawa.png"`) — it then replaces the wordmark on the end card **and on everyone's clothes**; until then the MA HAWA wordmark is used |
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
