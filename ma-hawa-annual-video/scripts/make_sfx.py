#!/usr/bin/env python3
"""
Generate the cartoon SFX kit (pop, whoosh, bonk, stamp, ding, slam, sparkle,
tick, boing, sip). All synthesised, so there are no licensing questions.
Every sound has its transient at t=0 so it lands exactly on the beat it is
scheduled on.

Usage: .venv/bin/python scripts/make_sfx.py assets/sfx
"""
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 44100
rng = np.random.default_rng(3)


def t_arr(d):
    return np.arange(int(d * SR)) / SR


def filt(x, kind, hz):
    return sosfilt(butter(2, hz, kind, fs=SR, output="sos"), x)


def chirp(f0, f1, d, curve=4.0):
    t = t_arr(d)
    f = f1 + (f0 - f1) * np.exp(-t * curve)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def norm(x, peak=0.9):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def pop():
    t = t_arr(0.35)
    burst = filt(rng.standard_normal(len(t)), "high", 1200) * np.exp(-t * 60)
    thump = chirp(260, 90, 0.35, 30) * np.exp(-t * 18) * 0.7
    return norm(burst + thump)


def whoosh():
    d = 0.6
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(n)
    step = 1024
    for i in range(0, len(n), step):
        p = i / len(n)
        f = 300 + 3500 * np.sin(np.pi * p) ** 2
        out[i:i + step] = sosfilt(butter(2, [f * 0.6, min(f * 1.6, 20000)], "band", fs=SR, output="sos"), n[i:i + step])
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    # transient at 0: the whoosh peaks right at the start so it lands on the beat
    env = np.exp(-t * 5) * 0.4 + env * 0.6
    return norm(out * env, 0.7)


def bonk():
    t = t_arr(0.5)
    tone = chirp(900, 420, 0.5, 18) * np.exp(-t * 10)
    wood = filt(rng.standard_normal(len(t)), "band", [600, 2500]) * np.exp(-t * 80)
    over = np.sin(2 * np.pi * 1350 * t) * np.exp(-t * 25) * 0.3
    return norm(tone + wood * 0.8 + over)


def stamp():
    t = t_arr(0.4)
    thud = chirp(180, 55, 0.4, 25) * np.exp(-t * 14)
    slap = filt(rng.standard_normal(len(t)), "band", [800, 6000]) * np.exp(-t * 70) * 0.9
    return norm(thud + slap)


def ding():
    t = t_arr(1.2)
    out = sum(np.sin(2 * np.pi * f * t) * a * np.exp(-t * dcy)
              for f, a, dcy in [(1318.5, 1, 4), (2637, 0.4, 6), (3955, 0.15, 9)])
    return norm(out * np.minimum(1, t / 0.002), 0.6)


def slam():
    t = t_arr(0.7)
    boom = chirp(120, 40, 0.7, 12) * np.exp(-t * 7)
    crack = filt(rng.standard_normal(len(t)), "band", [300, 4000]) * np.exp(-t * 35)
    return norm(boom + crack * 0.8)


def sparkle():
    t = t_arr(1.4)
    out = np.zeros_like(t)
    for i, f in enumerate([1568, 2093, 2637, 3136, 4186, 3520, 2637]):
        st = int(i * 0.06 * SR)
        tt = t[: len(t) - st]
        out[st:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 5) * 0.5
    return norm(out, 0.55)


def tick():
    t = t_arr(0.06)
    return norm(np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 120), 0.5)


def boing():
    t = t_arr(0.6)
    f = 220 + 120 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4) + 160 * t
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5), 0.6)


def sip():
    t = t_arr(0.5)
    n = filt(rng.standard_normal(len(t)), "band", [2500, 8000])
    env = np.exp(-((t - 0.18) ** 2) / 0.006)
    return norm(n * env, 0.35)


def puff():
    # one breath into a balloon: airy, rubbery, attack on the beat
    t = t_arr(0.32)
    n = filt(rng.standard_normal(len(t)), "band", [300, 2200])
    env = np.minimum(1, t / 0.012) * np.exp(-t * 9)
    rub = np.sin(2 * np.pi * (180 + 60 * t) * t) * np.exp(-t * 14) * 0.25
    return norm(n * env + rub, 0.5)


def scratch():
    # record scratch: a fast pitch dive on filtered noise + a squeaky tone
    t = t_arr(0.45)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(t)
    step = 512
    for i in range(0, len(t), step):
        p = i / len(t)
        f = 3500 * (1 - p) ** 2 + 300
        out[i:i + step] = sosfilt(butter(2, [f * 0.7, min(f * 1.3, 20000)], "band", fs=SR, output="sos"), n[i:i + step])
    tone = np.sin(2 * np.pi * np.cumsum(1400 * (1 - t / 0.45) ** 1.5 + 200) / SR) * 0.4
    env = np.minimum(1, t / 0.005) * np.exp(-t * 6)
    return norm((out + tone) * env, 0.8)


def write_all(dest: Path):
    dest.mkdir(parents=True, exist_ok=True)
    for name, fn in [("pop", pop), ("whoosh", whoosh), ("bonk", bonk), ("stamp", stamp), ("ding", ding),
                     ("slam", slam), ("sparkle", sparkle), ("tick", tick), ("boing", boing), ("sip", sip), ("puff", puff), ("scratch", scratch)]:
        x = fn()
        fade = int(0.01 * SR)
        x[-fade:] *= np.linspace(1, 0, fade)
        sf.write(dest / f"{name}.wav", x.astype(np.float32), SR)
        print(f"  {name}.wav")


if __name__ == "__main__":
    write_all(Path(sys.argv[1] if len(sys.argv) > 1 else "assets/sfx"))
