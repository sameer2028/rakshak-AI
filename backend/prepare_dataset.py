"""
Rakshak AI — Prepare real currency dataset from uploads.
"""

import os
import shutil
import cv2
import numpy as np
from pathlib import Path
from loguru import logger

UPLOADS_DIR = Path("uploads")
DATASET_DIR = Path("dataset")

def detect_red_stamp(img_bgr) -> bool:
    try:
        h, w = img_bgr.shape[:2]
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        mask1 = cv2.inRange(hsv, (0, 100, 100), (10, 255, 255))
        mask2 = cv2.inRange(hsv, (170, 100, 100), (180, 255, 255))
        red_mask = mask1 | mask2

        contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        matches = 0
        for c in contours:
            area = cv2.contourArea(c)
            if 20 < area < 10000:
                x, y, w_box, h_box = cv2.boundingRect(c)
                if 0.1 < (w_box / h_box) < 5.0 and x > (w * 0.4):
                    matches += 1
        return matches >= 1
    except Exception:
        return False

def prepare():
    real_dir = DATASET_DIR / "real" / "500"
    fake_dir = DATASET_DIR / "fake" / "500"

    real_dir.mkdir(parents=True, exist_ok=True)
    fake_dir.mkdir(parents=True, exist_ok=True)

    if not UPLOADS_DIR.exists():
        logger.error(f"Uploads directory {UPLOADS_DIR} does not exist.")
        return

    files = list(UPLOADS_DIR.glob("*"))
    logger.info(f"Scanning {len(files)} files in uploads...")

    real_count = 0
    fake_count = 0

    for file_path in files:
        if file_path.suffix.lower() not in [".png", ".jpg", ".jpeg", ".bmp", ".webp"]:
            continue

        img = cv2.imread(str(file_path))
        if img is None:
            continue

        is_fake = detect_red_stamp(img)
        
        if is_fake:
            dest = fake_dir / file_path.name
            shutil.copy2(file_path, dest)
            fake_count += 1
        else:
            dest = real_dir / file_path.name
            shutil.copy2(file_path, dest)
            real_count += 1

    logger.info(f"Dataset preparation complete:")
    logger.info(f"  - Real images copied: {real_count} → {real_dir}")
    logger.info(f"  - Fake images copied: {fake_count} → {fake_dir}")

if __name__ == "__main__":
    prepare()
