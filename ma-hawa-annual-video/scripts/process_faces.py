#!/usr/bin/env python3
"""
Turn raw face photos into matching circular bobblehead heads.

Input : assets/faces/raw/<characterId>_<expression>.jpg   (e.g. ali_happy.jpg)
Output: assets/faces/<characterId>_<expression>.png        (640x640, transparent, circle-masked)
        assets/faces/faces.meta.json                       (eye positions etc. per face)

Pipeline per photo
  1. EXIF-rotate, downscale.
  2. Face landmarks (MediaPipe FaceLandmarker) -> eye centres, forehead, chin.
  3. Roll-correct so the eye line is level; scale so every face has the same size
     and the eyes sit at the same spot in the output (heads swap without jumps).
  4. Background removal (rembg, BiRefNet-portrait).
  5. Circle mask.
  6. Brightness / white-balance matching against the group average, so the car
     selfies and the street photos look like they were shot together.

Usage
  .venv/bin/python scripts/process_faces.py            # process everything in raw/
  .venv/bin/python scripts/process_faces.py michael    # only files starting with "michael"
"""
from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "assets" / "faces" / "raw"
OUT = ROOT / "assets" / "faces"
MODEL_DIR = Path.home() / ".cache" / "mahawa-models"
LANDMARKER_URL = (
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/"
    "face_landmarker/float16/1/face_landmarker.task"
)

SIZE = 640                 # output square
EYE_Y = 0.47               # eye line position (fraction of SIZE)
FACE_H = 0.56              # forehead(lm10) -> chin(lm152) distance (fraction of SIZE)
BRIGHTNESS_STRENGTH = 0.8  # 0 = keep original exposure, 1 = force the group average
WB_STRENGTH = 0.6          # same for white balance (LAB a/b)

# MediaPipe face-mesh landmark indices
LM_FOREHEAD = 10
LM_CHIN = 152
LEFT_EYE = [33, 133, 159, 145]     # subject's right eye (image left)
RIGHT_EYE = [362, 263, 386, 374]
FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
             378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
             162, 21, 54, 103, 67, 109]
# cheeks + forehead patch used for skin-tone statistics (avoids beard/eyes/mouth)
SKIN_PATCH = [10, 109, 67, 103, 54, 21, 162, 127, 234, 93, 132, 123, 117, 118, 101, 36,
              205, 425, 266, 330, 347, 346, 352, 361, 323, 454, 356, 389, 251, 284, 332, 297, 338]


def ensure_landmarker():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    path = MODEL_DIR / "face_landmarker.task"
    if not path.exists():
        print("downloading face landmarker model…")
        urllib.request.urlretrieve(LANDMARKER_URL, path)
    from mediapipe.tasks.python import BaseOptions, vision

    opts = vision.FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(path)), num_faces=4
    )
    return vision.FaceLandmarker.create_from_options(opts)


def load_rgb(path: Path, max_side=2000) -> np.ndarray:
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    s = max_side / max(im.size)
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    return np.asarray(im)


def landmarks(detector, rgb: np.ndarray) -> np.ndarray:
    import mediapipe as mp

    res = detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb)))
    if not res.face_landmarks:
        raise RuntimeError("no face found")
    h, w = rgb.shape[:2]
    # biggest face = the main subject (people walking behind are smaller)
    faces = [np.array([[p.x * w, p.y * h] for p in f]) for f in res.face_landmarks]
    faces.sort(key=lambda pts: -np.ptp(pts[:, 1]))
    return faces[0]


def align(rgb: np.ndarray, pts: np.ndarray):
    """Similarity transform: level eyes, normalised face height, eyes at fixed point."""
    le = pts[LEFT_EYE].mean(0)
    re = pts[RIGHT_EYE].mean(0)
    eye_mid = (le + re) / 2
    angle = np.degrees(np.arctan2(re[1] - le[1], re[0] - le[0]))
    face_h = np.linalg.norm(pts[LM_CHIN] - pts[LM_FOREHEAD])
    scale = (FACE_H * SIZE) / face_h
    M = cv2.getRotationMatrix2D(tuple(eye_mid), angle, scale)
    M[0, 2] += SIZE / 2 - eye_mid[0]
    M[1, 2] += EYE_Y * SIZE - eye_mid[1]
    return M


def warp(img: np.ndarray, M, border=0):
    return cv2.warpAffine(img, M, (SIZE, SIZE), flags=cv2.INTER_LANCZOS4,
                          borderMode=cv2.BORDER_CONSTANT, borderValue=border)


def tf_pts(pts: np.ndarray, M) -> np.ndarray:
    return np.c_[pts, np.ones(len(pts))] @ M.T


def matte_worker(src: str, dst: str):
    """Runs in its own process: BiRefNet is ~1 GB and leaks memory between calls."""
    from rembg import new_session, remove

    session = new_session("birefnet-portrait")
    out = remove(Image.open(src).convert("RGB"), session=session, post_process_mask=True)
    Image.fromarray(np.asarray(out)[:, :, 3]).save(dst)


def remove_bg(rgb_crop: np.ndarray, tmp_dir: Path, name: str) -> np.ndarray:
    import subprocess

    src = tmp_dir / f"{name}_in.png"
    dst = tmp_dir / f"{name}_matte.png"
    Image.fromarray(rgb_crop).save(src)
    subprocess.run([sys.executable, __file__, "--matte", str(src), str(dst)], check=True,
                   stderr=subprocess.DEVNULL)
    return np.asarray(Image.open(dst)).astype(np.float32) / 255.0


def skin_stats(rgb: np.ndarray, pts: np.ndarray):
    mask = np.zeros(rgb.shape[:2], np.uint8)
    cv2.fillConvexPoly(mask, cv2.convexHull(pts[SKIN_PATCH].astype(np.int32)), 1)
    # drop eyes / brows / mouth / beard area (lower third of the face)
    chin_y, fh_y = pts[LM_CHIN][1], pts[LM_FOREHEAD][1]
    mask[int(fh_y + 0.62 * (chin_y - fh_y)):, :] = 0
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    sel = lab[mask > 0]
    return sel.mean(0), sel.std(0)


def match_tone(rgb: np.ndarray, mean, std, target_mean, target_std) -> np.ndarray:
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    # luminance: gentle mean/contrast match
    gain = np.clip(target_std[0] / max(std[0], 1e-3), 0.85, 1.2)
    L = (lab[..., 0] - mean[0]) * (1 + (gain - 1) * BRIGHTNESS_STRENGTH) + mean[0]
    L += (target_mean[0] - mean[0]) * BRIGHTNESS_STRENGTH
    lab[..., 0] = L
    # white balance: shift a/b toward the group average
    lab[..., 1] += (target_mean[1] - mean[1]) * WB_STRENGTH
    lab[..., 2] += (target_mean[2] - mean[2]) * WB_STRENGTH
    lab = np.clip(lab, 0, 255).astype(np.uint8)
    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)


def circle_alpha(feather=2.0) -> np.ndarray:
    yy, xx = np.mgrid[0:SIZE, 0:SIZE].astype(np.float32)
    r = SIZE / 2 - 1
    d = np.sqrt((xx - SIZE / 2 + 0.5) ** 2 + (yy - SIZE / 2 + 0.5) ** 2)
    return np.clip((r - d) / feather + 0.5, 0, 1)


def main(prefix: str | None):
    import tempfile

    all_files = sorted(p for p in RAW.glob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".heic"})
    files = [f for f in all_files if f.stem.startswith(prefix)] if prefix else all_files
    if not files:
        sys.exit(f"no photos found in {RAW}")

    detector = ensure_landmarker()
    tmp_dir = Path(tempfile.mkdtemp(prefix="faces-"))

    staged = []
    group_stats = []
    for f in all_files:
        rgb = load_rgb(f)
        pts = landmarks(detector, rgb)
        M = align(rgb, pts)
        aligned = warp(rgb, M, border=(255, 255, 255))
        apts = tf_pts(pts, M)
        # tone target is always the whole cast, even when only one person is re-processed
        group_stats.append(skin_stats(aligned, apts))
        if f in files:
            staged.append((f, aligned, apts))
            print(f"  landmarks ok  {f.name}")

    t_mean = np.mean([s[0] for s in group_stats], axis=0)
    t_std = np.mean([s[1] for s in group_stats], axis=0)
    stats = [skin_stats(a, p) for _, a, p in staged]

    meta_path = OUT / "faces.meta.json"
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    circ = circle_alpha()
    for (f, aligned, apts), (m, s) in zip(staged, stats):
        toned = match_tone(aligned, m, s, t_mean, t_std)
        # background removal on the aligned square (subject already centred)
        alpha = remove_bg(aligned, tmp_dir, f.stem)
        # keep everything inside the head oval even if the matte is unsure (glasses, beard edges)
        oval = np.zeros((SIZE, SIZE), np.uint8)
        cv2.fillConvexPoly(oval, cv2.convexHull(apts[FACE_OVAL].astype(np.int32)), 1)
        oval = cv2.erode(oval, np.ones((9, 9), np.uint8)).astype(np.float32)
        alpha = np.maximum(alpha, oval)
        alpha = cv2.GaussianBlur(alpha, (3, 3), 0) * circ
        # mild unsharp mask after resampling
        blur = cv2.GaussianBlur(toned, (0, 0), 1.2)
        sharp = cv2.addWeighted(toned, 1.35, blur, -0.35, 0)
        rgba = np.dstack([sharp, (alpha * 255).astype(np.uint8)])
        out = OUT / f"{f.stem}.png"
        Image.fromarray(rgba, "RGBA").save(out, optimize=True)
        le = apts[LEFT_EYE].mean(0) / SIZE
        re = apts[RIGHT_EYE].mean(0) / SIZE
        meta[f.stem] = {
            "file": f"faces/{out.name}",
            "size": SIZE,
            "leftEye": [round(float(le[0]), 4), round(float(le[1]), 4)],
            "rightEye": [round(float(re[0]), 4), round(float(re[1]), 4)],
            "chin": [round(float(apts[LM_CHIN][0] / SIZE), 4), round(float(apts[LM_CHIN][1] / SIZE), 4)],
            "forehead": [round(float(apts[LM_FOREHEAD][0] / SIZE), 4), round(float(apts[LM_FOREHEAD][1] / SIZE), 4)],
            "source": f"faces/raw/{f.name}",
        }
        print(f"  wrote {out.relative_to(ROOT)}")
    meta_path.write_text(json.dumps(meta, indent=2) + "\n")
    print(f"meta -> {meta_path.relative_to(ROOT)}")


if __name__ == "__main__":
    if len(sys.argv) == 4 and sys.argv[1] == "--matte":
        matte_worker(sys.argv[2], sys.argv[3])
    else:
        main(sys.argv[1] if len(sys.argv) > 1 else None)
        import os
        os._exit(0)  # skip MediaPipe's noisy interpreter-shutdown destructor
