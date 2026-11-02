#!/usr/bin/env python3
"""
Synthesise a ~74 s STAND-IN track so the whole pipeline can run before the real
song is supplied. It has the shape the video wants (quiet intro, groove, a hard
break, long groove, build-up, big drop, strong ending) so the analyzer and the
timeline solver get exercised end to end.

Replace it with the real song:  npm run sync -- path/to/song.mp3

Usage: .venv/bin/python scripts/make_placeholder_track.py assets/audio/placeholder.wav
"""
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 44100
BPM = 124.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)

# bar layout ---------------------------------------------------------------
# 0-1 intro | 2-5 groove A | 6 hard break | 7-14 groove B | 15-24 groove C (+lead)
# 25-28 build-up | 29-36 DROP | 37 final hit + tail
N_BARS = 38
TAIL = 3.0
total = N_BARS * BAR + TAIL
mix = np.zeros(int(total * SR) + SR)

# Am  F  C  G   (one chord per bar)
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 55, 60], [55, 59, 62]]
ROOTS = [45, 41, 48, 43]


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def t_arr(dur):
    return np.arange(int(dur * SR)) / SR


def add(sig, at, gain=1.0):
    i = int(at * SR)
    j = min(len(mix), i + len(sig))
    mix[i:j] += sig[: j - i] * gain


def lp(x, hz):
    return sosfilt(butter(2, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz):
    return sosfilt(butter(2, hz, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


def kick(g=1.0):
    t = t_arr(0.45)
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7)
    click = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 300) * 0.3
    return (body + click) * g


def clap(g=1.0):
    t = t_arr(0.25)
    n = bp(rng.standard_normal(len(t)), 900, 5000)
    env = np.exp(-t * 18) * (1 + 0.6 * np.exp(-((t - 0.012) ** 2) / 1e-5))
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.4
    return (n * env * 0.7 + tone) * g


def hat(g=1.0, open_=False):
    t = t_arr(0.25 if open_ else 0.05)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (14 if open_ else 90)) * g


def crash(g=1.0):
    t = t_arr(2.5)
    return hp(rng.standard_normal(len(t)), 4000) * np.exp(-t * 1.6) * g


def saw(freq, dur, detune=0.0):
    t = t_arr(dur)
    out = np.zeros_like(t)
    for d in (-detune, 0, detune) if detune else (0,):
        out += 2 * ((t * freq * (1 + d)) % 1) - 1
    return out / (3 if detune else 1)


def pad(chord, dur, g=0.12, cutoff=1800):
    sig = sum(saw(midi(n), dur, 0.004) for n in chord) / len(chord)
    t = t_arr(dur)
    env = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.3).clip(0)
    return lp(sig, cutoff) * env * g


def bass_note(n, dur, g=0.35):
    t = t_arr(dur)
    sig = saw(midi(n), dur) * 0.6 + np.sin(2 * np.pi * midi(n) * t)
    return lp(sig, 420) * np.exp(-t * 3.5) * np.minimum(1, t / 0.005) * g


def pluck(n, dur, g=0.12):
    t = t_arr(dur)
    sig = np.sign(np.sin(2 * np.pi * midi(n) * t)) * 0.5 + saw(midi(n + 12), dur) * 0.3
    return lp(sig, 3200) * np.exp(-t * 9) * g


def section(bar):
    if bar < 2: return "intro"
    if bar < 6: return "grooveA"
    if bar == 6: return "break"
    if bar < 15: return "grooveB"
    if bar < 25: return "grooveC"
    if bar < 29: return "build"
    if bar < 37: return "drop"
    return "end"


for bar in range(N_BARS):
    s = section(bar)
    t0 = bar * BAR
    ci = bar % 4
    chord, root = CHORDS[ci], ROOTS[ci]

    if s == "end":
        add(kick(1.2), t0); add(crash(0.5), t0)
        add(pad([n + 12 for n in CHORDS[0]], BAR + TAIL, 0.16, 2500), t0)
        add(bass_note(ROOTS[0], 2.0, 0.5), t0)
        continue

    if s == "break":
        # one stab, then (almost) silence – a hard break
        add(kick(1.0), t0); add(crash(0.25), t0)
        add(pad(chord, BEAT * 1.5, 0.08, 900), t0)
        add(clap(0.6), t0 + 3.5 * BEAT); add(clap(0.8), t0 + 3.75 * BEAT)
        continue

    # pads
    pad_gain = {"intro": 0.10, "grooveA": 0.07, "grooveB": 0.08, "grooveC": 0.09, "build": 0.11, "drop": 0.16}[s]
    cutoff = {"intro": 900, "build": 900 + 3000 * ((bar - 25) / 4), "drop": 3200}.get(s, 1600)
    add(pad(chord, BAR, pad_gain, cutoff), t0)

    for b in range(4):
        tb = t0 + b * BEAT
        if s == "intro":
            add(hat(0.08), tb + BEAT / 2)
            continue
        last_build_bar = s == "build" and bar == 28
        if not last_build_bar:
            add(kick(1.25 if s == "drop" else 0.75), tb)
        if b in (1, 3) and s != "build":
            add(clap(0.75 if s == "drop" else 0.55), tb)
        add(hat(0.12 if s == "drop" else 0.09), tb + BEAT / 2)
        if s in ("grooveB", "grooveC", "drop"):
            add(hat(0.05), tb + BEAT / 4); add(hat(0.05), tb + 3 * BEAT / 4)
        if s == "drop" and b == 0 and bar % 2 == 1:
            add(hat(0.12, True), tb + BEAT / 2)
        # off-beat bass
        if s != "build" or bar < 27:
            add(bass_note(root, BEAT / 2, 0.42 if s == "drop" else 0.3), tb + BEAT / 2)
        if s == "drop":
            add(bass_note(root, BEAT / 2, 0.3), tb)
            add(pad([n + 12 for n in chord], BEAT * 0.35, 0.1, 4000), tb + BEAT / 2)

    # crash on phrase starts
    if s in ("grooveB", "grooveC", "drop") and bar in (7, 15, 29, 33):
        add(crash(0.45 if s == "drop" else 0.3), t0)
    if bar == 2:
        add(crash(0.25), t0)

    # lead arpeggio
    if s in ("grooveC", "drop"):
        notes = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 24]
        for k in range(16 if s == "drop" else 8):
            step = BEAT / (4 if s == "drop" else 2)
            add(pluck(notes[k % 4], step * 1.4, 0.11 if s == "drop" else 0.08), t0 + k * step)

    # build-up: snare roll + riser
    if s == "build":
        k = bar - 25
        div = [2, 4, 8, 16][k]
        for i in range(div):
            add(clap(0.25 + 0.35 * (k * div + i) / (4 * div)), t0 + i * BAR / div)

build_start, build_end = 25 * BAR, 29 * BAR
t = t_arr(build_end - build_start)
noise = rng.standard_normal(len(t))
sweep = np.zeros_like(noise)
for i, (a, b) in enumerate(zip(range(0, len(t), 4410), range(4410, len(t) + 4410, 4410))):
    f = 400 + 7000 * (i * 0.1 / (build_end - build_start)) ** 2
    seg = noise[a:b]
    sweep[a:a + len(seg)] = bp(seg, f, min(f * 1.6, 18000))
add(sweep * np.linspace(0, 0.35, len(t)) ** 1.5, build_start)
# pre-drop silence gap for impact
gap = int((build_end - BEAT * 0.5) * SR)
mix[gap:int(build_end * SR)] *= np.linspace(1, 0.05, int(build_end * SR) - gap)
add(crash(0.6), build_end)

# gentle soft-clip only on peaks, keeps the section dynamics (groove < drop)
out = mix / np.percentile(np.abs(mix), 99.95)
out = np.tanh(out * 0.9) / np.tanh(0.9) * 0.89
out = out[: int(total * SR)]
stereo = np.stack([out, np.roll(out, 9)], axis=1)
dest = Path(sys.argv[1] if len(sys.argv) > 1 else "assets/audio/placeholder.wav")
dest.parent.mkdir(parents=True, exist_ok=True)
sf.write(dest, stereo, SR)
print(f"wrote {dest}  ({total:.1f}s, {BPM} BPM)")
