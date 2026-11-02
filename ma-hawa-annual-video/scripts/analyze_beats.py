#!/usr/bin/env python3
"""
Analyse a music track and write config/beats.json — the single source of truth
for every cut, hit and bounce in the video.

What it finds
  * BPM, every beat (gaps filled, grid extended over quiet intros/outros)
  * downbeats + bars (4/4, phase picked from kick weight + chord changes)
  * energy curve (one value per video frame), energy peaks
  * drops (big energy jumps on a downbeat), the biggest drop
  * quiet sections and hard breaks
  * if the track is longer than the target: the best window
    (build-up -> drop near the end -> strong ending), snapped to a downbeat,
    with a fade-out

Usage
  .venv/bin/python scripts/analyze_beats.py assets/audio/song.mp3
  .venv/bin/python scripts/analyze_beats.py song.mp3 --duration 60 --start 42.5 --bpm 128
    --start   force the segment start (seconds, snapped to the nearest downbeat)
    --bpm     tempo hint if the tracker picks half/double time
"""
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

import librosa
import numpy as np
from scipy.ndimage import uniform_filter1d
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUT_JSON = ROOT / "config" / "beats.json"
SR = 22050
HOP = 512
FPS = 30


def r3(x):
    return round(float(x), 3)


# --------------------------------------------------------------------------- beats
def track_beats(y, bpm_hint=None):
    onset = librosa.onset.onset_strength(y=y, sr=SR, hop_length=HOP, aggregate=np.median)
    kw = dict(onset_envelope=onset, sr=SR, hop_length=HOP, units="time", tightness=120)
    if bpm_hint:
        kw["start_bpm"] = bpm_hint
    tempo, beats = librosa.beat.beat_track(**kw)
    tempo = float(np.atleast_1d(tempo)[0])
    if len(beats) < 8:
        raise SystemExit("could not find a beat in this track")
    beats = refine_to_attacks(y, np.asarray(beats, float))
    # least-squares fit over the beat grid: immune to the 23 ms hop quantisation
    idx = np.arange(len(beats))
    period = float(np.polyfit(idx, beats, 1)[0])
    # fold into a musically sensible range (80–175 BPM) unless the user forced one
    bpm = 60.0 / period
    if not bpm_hint:
        while bpm < 80:
            bpm *= 2
        while bpm > 175:
            bpm /= 2
    else:
        bpm = min([bpm / 2, bpm, bpm * 2], key=lambda b: abs(b - bpm_hint))
    if abs(60.0 / bpm - period) > 0.01:
        # tracker locked to half/double time: rebuild the grid at the folded period
        period = 60.0 / bpm
        beats = np.arange(beats[0], beats[-1] + 1e-6, period)
    return onset, bpm, period, np.asarray(beats, float)


def refine_to_attacks(y, beats, fine_hop=128):
    """Nudge each tracked beat onto the actual transient (hi-res onset envelope).

    The coarse onset envelope (hop 512) reports attacks ~1 hop late; a frame-accurate
    beat matters because every cut and hit in the video lands on these times.
    """
    env = librosa.onset.onset_strength(y=y, sr=SR, hop_length=fine_hop, aggregate=np.median)
    t = librosa.frames_to_time(np.arange(len(env)), sr=SR, hop_length=fine_hop)
    out = beats.copy()
    for k, b in enumerate(beats):
        m = (t >= b - 0.07) & (t <= b + 0.03)
        if not m.any():
            continue
        seg, ts = env[m], t[m]
        if seg.max() > 1.5 * np.median(env):
            # onset flux peaks just after the attack starts; step back one fine hop
            out[k] = max(0.0, ts[int(np.argmax(seg))] - fine_hop / SR)
    return out


def regularise(beats, period, duration):
    """Fill gaps (> 1.5 periods) and extend the grid to cover the whole track."""
    out, inferred = [beats[0]], [False]
    for b in beats[1:]:
        gap = b - out[-1]
        if gap > 1.5 * period:
            n = int(round(gap / period))
            for _ in range(1, n):
                out.append(out[-1] + gap / n)
                inferred.append(True)
        out.append(b)
        inferred.append(False)
    # extend backwards / forwards
    while out[0] - period > -0.02:
        out.insert(0, max(0.0, out[0] - period))
        inferred.insert(0, True)
    while out[-1] + period < duration - 0.05:
        out.append(out[-1] + period)
        inferred.append(True)
    return np.array(out), np.array(inferred)


def downbeat_phase(y, beats, onset):
    """Pick which of the 4 beat positions is beat 1 (kick weight + chord change)."""
    S = np.abs(librosa.stft(y, hop_length=HOP))
    freqs = librosa.fft_frequencies(sr=SR)
    low = librosa.onset.onset_strength(S=librosa.amplitude_to_db(S[freqs < 160]), sr=SR, hop_length=HOP)
    chroma = librosa.feature.chroma_stft(S=S ** 2, sr=SR, hop_length=HOP)
    frames = librosa.time_to_frames(beats, sr=SR, hop_length=HOP)
    frames = np.clip(frames, 0, chroma.shape[1] - 1)
    # chroma novelty at each beat: harmony in [beat k, k+1) vs [beat k-1, k)
    # (computed by hand: librosa.util.sync silently drops/prepends edge segments)
    edges = np.r_[frames, chroma.shape[1]]
    seg = np.stack([np.median(chroma[:, a:max(b, a + 1)], axis=1) for a, b in zip(edges[:-1], edges[1:])], axis=1)
    seg = seg / (np.linalg.norm(seg, axis=0, keepdims=True) + 1e-9)
    nov = np.r_[0.0, np.linalg.norm(np.diff(seg, axis=1), axis=0)]
    lo = low[np.clip(frames, 0, len(low) - 1)]
    on = onset[np.clip(frames, 0, len(onset) - 1)]

    def z(x):
        return (x - x.mean()) / (x.std() + 1e-9)

    score = 1.2 * z(nov) + 1.0 * z(lo) + 0.4 * z(on)
    phase_scores = [float(np.mean(score[p::4])) for p in range(4)]
    return int(np.argmax(phase_scores)), phase_scores


# --------------------------------------------------------------------------- energy
def energy_features(y):
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=HOP)[0]
    db = librosa.amplitude_to_db(rms + 1e-6, ref=np.max)
    S = np.abs(librosa.stft(y, hop_length=HOP))
    freqs = librosa.fft_frequencies(sr=SR)
    low_db = librosa.amplitude_to_db(S[freqs < 150].mean(0) + 1e-6, ref=np.max)
    t = librosa.frames_to_time(np.arange(len(db)), sr=SR, hop_length=HOP)
    smooth = uniform_filter1d(db, size=int(0.4 * SR / HOP))
    lo, hi = np.percentile(smooth, 5), np.percentile(smooth, 99.5)
    norm = np.clip((smooth - lo) / (hi - lo + 1e-9), 0, 1)
    return t, db, low_db, norm


def mean_between(t, x, a, b):
    m = (t >= a) & (t < b)
    return float(x[m].mean()) if m.any() else float("nan")


def analyse_bars(downbeats, duration, t, db, low_db, norm):
    bars = []
    edges = list(downbeats) + [min(duration, downbeats[-1] + np.median(np.diff(downbeats)))]
    for i in range(len(downbeats)):
        a, b = edges[i], edges[i + 1]
        bars.append(dict(t=a, end=b, db=mean_between(t, db, a, b), low=mean_between(t, low_db, a, b),
                         energy=mean_between(t, norm, a, b)))
    return bars


def find_drops(bars):
    """A drop = big jump in loudness + bass on a downbeat, INTO the loudest part of the song.

    A comeback after a short break also jumps, so the jump is weighted by how loud the
    following 4 bars are compared with the song's typical bar (the real drop is the peak).
    """
    dbs = np.array([b["db"] for b in bars])
    median_db = float(np.nanmedian(dbs))
    drops = []
    for i in range(2, len(bars) - 1):
        nxt = range(i, min(i + 2, len(bars)))
        post = np.nanmean([bars[j]["db"] for j in nxt])
        post4 = np.nanmean([bars[j]["db"] for j in range(i, min(i + 4, len(bars)))])
        pre = np.nanmean([bars[i - 2]["db"], bars[i - 1]["db"]])
        pre_min = max(min(bars[i - 2]["db"], bars[i - 1]["db"]), post - 15)
        lpost = np.nanmean([bars[j]["low"] for j in nxt])
        lpre = max(np.nanmean([bars[i - 2]["low"], bars[i - 1]["low"]]), lpost - 25)
        jump = 0.45 * (post - pre) + 0.25 * (post - pre_min) + 0.3 * (lpost - lpre)
        level = np.clip((post4 - median_db) / 3.0, 0, 1.5)
        if jump > 1.5 and bars[i]["energy"] > 0.5:
            drops.append(dict(t=bars[i]["t"], bar=i, strength=jump * (0.4 + level), jump=jump, level=level))
    # non-maximum suppression: one drop per 2-bar neighbourhood
    drops.sort(key=lambda d: -d["strength"])
    kept = []
    for d in drops:
        if all(abs(d["bar"] - k["bar"]) > 2 for k in kept):
            kept.append(d)
    drops = sorted(kept, key=lambda d: d["t"])
    if drops:
        mx = max(d["strength"] for d in drops)
        for d in drops:
            d["strength"] = d["strength"] / mx
    return drops


def find_quiet(bars, t, norm, period):
    quiet, breaks = [], []
    energies = np.array([b["energy"] for b in bars])
    thr = min(0.4, np.percentile(energies, 25) + 0.05)
    run = None
    for i, b in enumerate(bars):
        if b["energy"] < thr:
            run = run or dict(start=b["t"], startBar=i)
            run.update(end=b["end"], endBar=i)
        elif run:
            quiet.append(run)
            run = None
    if run:
        quiet.append(run)
    # hard breaks: energy falls off a cliff right at a downbeat (within one beat)
    for i in range(1, len(bars)):
        a = bars[i]["t"]
        before = mean_between(t, norm, a - 2 * period, a)
        after = mean_between(t, norm, a + 0.5 * period, a + 2.5 * period)
        if before - after > 0.25:
            breaks.append(dict(t=a, bar=i, strength=before - after))
        # also a cliff half way into a bar (stab then silence)
        a2 = a + period
        after2 = mean_between(t, norm, a2, a2 + 2 * period)
        if before - after2 > 0.3 and not any(abs(x["t"] - a) < 1e-3 for x in breaks):
            breaks.append(dict(t=a, bar=i, strength=(before - after2) * 0.9))
    return quiet, breaks


# --------------------------------------------------------------------------- segment
def pick_segment(duration, target, bars, drops, quiet, breaks, t, norm, force_start=None):
    starts = [b["t"] for b in bars]
    if duration <= target + 0.5:
        return 0.0, duration, {"reason": "track shorter than target – using all of it"}
    if force_start is not None:
        s = min(starts, key=lambda x: abs(x - force_start))
        return s, min(duration, s + target), {"reason": f"forced start {force_start}s -> downbeat {s:.2f}s"}

    best = None
    for i, s in enumerate(starts):
        e = s + target
        if e > duration + 0.01:
            break
        # 1) biggest drop late in the window (hero shot ~85 %)
        drop_score = 0.0
        for d in drops:
            rel = (d["t"] - s) / target
            if 0.6 <= rel <= 0.93:
                drop_score = max(drop_score, d["strength"] * np.exp(-((rel - 0.84) ** 2) / (2 * 0.07 ** 2)))
        # 2) a quiet part / hard break early (CEO entrance ~13 %)
        q_score = 0.0
        for q in breaks:
            rel = (q["t"] - s) / target
            if 0.06 <= rel <= 0.26:
                q_score = max(q_score, min(1, q["strength"] * 2.5) * np.exp(-((rel - 0.13) ** 2) / (2 * 0.06 ** 2)))
        for q in quiet:
            rel = (q["start"] - s) / target
            if 0.06 <= rel <= 0.26:
                q_score = max(q_score, 0.7 * np.exp(-((rel - 0.13) ** 2) / (2 * 0.06 ** 2)))
        # 3) strong ending (energy in the last 8 s), or a natural ending close to the window end
        end_e = mean_between(t, norm, e - 8, e)
        natural = 1.0 if duration - e < 1.5 else 0.0
        end_score = max(end_e, 0.8 * natural)
        # 4) build-up: energy rises through the middle of the window
        mid = mean_between(t, norm, s + 0.45 * target, s + 0.75 * target)
        early = mean_between(t, norm, s, s + 0.3 * target)
        build_score = np.clip(mid - early + 0.5, 0, 1)
        # 5) start on a phrase boundary (every 4 bars from the first loud bar)
        phrase = 1.0 if i % 4 == 0 else 0.0
        score = 3.0 * drop_score + 1.2 * q_score + 1.0 * end_score + 0.6 * build_score + 0.3 * phrase
        if best is None or score > best[0]:
            best = (score, s, e, dict(drop=r3(drop_score), quiet=r3(q_score), ending=r3(end_score),
                                      build=r3(build_score), phrase=phrase, total=r3(score)))
    _, s, e, why = best
    why["reason"] = "best window: build-up -> drop near the end -> strong ending"
    return s, e, why


# --------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--duration", type=float, default=60.0)
    ap.add_argument("--start", type=float, default=None)
    ap.add_argument("--bpm", type=float, default=None)
    ap.add_argument("--fade-out", type=float, default=None)
    ap.add_argument("--out", default=str(OUT_JSON), help="where to write beats.json")
    args = ap.parse_args()

    src = Path(args.audio).resolve()
    audio_dir = ASSETS / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    if audio_dir not in src.parents:
        dst = audio_dir / src.name
        shutil.copy2(src, dst)
        src = dst
        print(f"copied track -> {dst.relative_to(ROOT)}")

    y, _ = librosa.load(src, sr=SR, mono=True)
    duration = len(y) / SR
    onset, bpm, period, raw_beats = track_beats(y, args.bpm)
    beats, inferred = regularise(raw_beats, period, duration)
    phase, phase_scores = downbeat_phase(y, beats, onset)
    t, db, low_db, norm = energy_features(y)

    downbeat_idx = np.arange(phase, len(beats), 4)
    downbeats = beats[downbeat_idx]
    bars = analyse_bars(downbeats, duration, t, db, low_db, norm)
    drops = find_drops(bars)
    quiet, breaks = find_quiet(bars, t, norm, period)
    peaks_idx, props = find_peaks(norm, prominence=0.12, distance=int(1.0 * SR / HOP))
    peaks = sorted(([float(t[i]), float(props["prominences"][k])] for k, i in enumerate(peaks_idx)),
                   key=lambda p: -p[1])[:24]

    seg_start, seg_end, why = pick_segment(duration, args.duration, bars, drops, quiet, breaks, t, norm,
                                           args.start)
    # snap the window to whole video frames so Remotion's trimBefore (in frames) is exact
    seg_start = round(seg_start * FPS) / FPS
    seg_end = min(duration, seg_start + round((seg_end - seg_start) * FPS) / FPS)
    seg_dur = seg_end - seg_start
    end_energy = mean_between(t, norm, seg_end - 3, seg_end)
    natural_end = duration - seg_end < 1.0
    fade_out = args.fade_out if args.fade_out is not None else (0.6 if natural_end else (2.5 if end_energy > 0.3 else 1.2))
    start_energy = mean_between(t, norm, seg_start, seg_start + 0.5)
    fade_in = 0.0 if seg_start < 0.05 else (0.08 if start_energy > 0.3 else 0.03)

    half_frame = 0.5 / FPS

    def rel(x):
        return max(0.0, x - seg_start)

    def inseg(x, pad=0.0):
        # half-frame tolerance: the window start is snapped to a video frame
        return seg_start - half_frame <= x <= seg_end + pad

    # beat list for the segment, with bar/beat numbering relative to the segment
    first_db = next(i for i in downbeat_idx if beats[i] >= seg_start - half_frame)
    beat_rows = []
    for i, b in enumerate(beats):
        if not inseg(b):
            continue
        pos = (i - phase) % 4
        bar_no = (i - first_db) // 4
        e = mean_between(t, norm, b - 0.05, b + 0.15)
        beat_rows.append(dict(t=r3(rel(b)), f=int(round(rel(b) * FPS)), bar=int(bar_no), beat=int(pos),
                              downbeat=bool(pos == 0), energy=r3(e), inferred=bool(inferred[i])))
    bar_rows = [dict(index=k, t=r3(rel(b["t"])), f=int(round(rel(b["t"]) * FPS)), energy=r3(b["energy"]),
                     loudnessDb=r3(b["db"]), bassDb=r3(b["low"]))
                for k, b in enumerate([b for b in bars if inseg(b["t"])])]
    seg_drops = sorted([dict(t=r3(rel(d["t"])), f=int(round(rel(d["t"]) * FPS)), strength=r3(d["strength"]))
                        for d in drops if inseg(d["t"])], key=lambda d: -d["strength"])
    seg_breaks = sorted([dict(t=r3(rel(b["t"])), f=int(round(rel(b["t"]) * FPS)), strength=r3(b["strength"]))
                         for b in breaks if inseg(b["t"])], key=lambda d: -d["strength"])
    seg_quiet = [dict(start=r3(max(0, rel(q["start"]))), end=r3(min(seg_dur, rel(q["end"]))),
                      f=int(round(max(0, rel(q["start"])) * FPS)))
                 for q in quiet if q["end"] > seg_start and q["start"] < seg_end]
    seg_peaks = [dict(t=r3(rel(p)), f=int(round(rel(p) * FPS)), prominence=r3(pr)) for p, pr in peaks if inseg(p)]
    # one energy value per video frame
    n_frames = int(round(seg_dur * FPS))
    ft = seg_start + np.arange(n_frames) / FPS
    energy_per_frame = np.interp(ft, t, norm)

    biggest = seg_drops[0] if seg_drops else None
    data = {
        "_comment": "Generated by scripts/analyze_beats.py — do not edit by hand; re-run `npm run sync -- <song>`.",
        "fps": FPS,
        "audio": {
            "file": str(src.relative_to(ASSETS)),
            "trackDuration": r3(duration),
            "segmentStart": r3(seg_start),
            "segmentEnd": r3(seg_end),
            "duration": r3(seg_dur),
            "durationInFrames": n_frames,
            "fadeIn": fade_in,
            "fadeOut": fade_out,
            "segmentChoice": why,
        },
        "tempo": {"bpm": r3(bpm), "beatPeriod": r3(period), "beatsPerBar": 4,
                  "downbeatPhaseScores": [r3(s) for s in phase_scores]},
        "beats": beat_rows,
        "bars": bar_rows,
        "drops": seg_drops,
        "biggestDrop": biggest,
        "breaks": seg_breaks,
        "quiet": seg_quiet,
        "peaks": seg_peaks,
        "energy": [round(float(v), 3) for v in energy_per_frame],
        "fullTrack": {
            "downbeats": [r3(x) for x in downbeats],
            "drops": [dict(t=r3(d["t"]), strength=r3(d["strength"])) for d in drops],
            "breaks": [dict(t=r3(b["t"]), strength=r3(b["strength"])) for b in breaks],
            "quiet": [dict(start=r3(q["start"]), end=r3(q["end"])) for q in quiet],
        },
    }
    out_json = Path(args.out).resolve()
    out_json.parent.mkdir(parents=True, exist_ok=True)
    txt = json.dumps(data, indent=1)
    # keep the long per-frame energy array on one line so the file stays readable
    import re
    txt = re.sub(r'"energy": \[\n([\s\S]*?)\n \]', lambda m: '"energy": [' + ",".join(
        x.strip() for x in m.group(1).split(",")) + "]", txt)
    out_json.write_text(txt + "\n")

    print(f"track      {duration:.2f}s   {bpm:.2f} BPM   beat {period:.3f}s   downbeat phase {phase}")
    print(f"segment    {seg_start:.2f}s -> {seg_end:.2f}s  ({seg_dur:.2f}s)  fade-in {fade_in}s fade-out {fade_out}s")
    print(f"           {why}")
    print(f"beats      {len(beat_rows)}   bars {len(bar_rows)}")
    print(f"drops      {[(d['t'], d['strength']) for d in seg_drops[:5]]}")
    print(f"breaks     {[(d['t'], d['strength']) for d in seg_breaks[:5]]}")
    print(f"quiet      {[(q['start'], q['end']) for q in seg_quiet]}")
    print(f"-> {out_json}")


if __name__ == "__main__":
    main()
