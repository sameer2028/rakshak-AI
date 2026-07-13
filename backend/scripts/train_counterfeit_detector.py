"""
Rakshak AI — Counterfeit Currency Detection Model Trainer

Generates synthetic Indian-currency-like images and trains a ResNet50-based
binary classifier (GENUINE vs COUNTERFEIT).

Usage:
    cd backend
    .\\venv\\Scripts\\python scripts/train_counterfeit_detector.py
"""

import os
import random
import math
import numpy as np
import cv2
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from pathlib import Path
from loguru import logger

# ──────────────────────────────────────────────────────────
# Config
# ──────────────────────────────────────────────────────────
NUM_SAMPLES_PER_CLASS = 600          # 600 real + 600 fake = 1200 total
IMG_SIZE = 224                       # ResNet input size
BATCH_SIZE = 32
EPOCHS = 12
LEARNING_RATE = 1e-4
DENOMINATIONS = [10, 20, 50, 100, 200, 500]

MODEL_DIR = Path(os.getenv("ML_MODELS_DIR", "app/ml/models"))
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / "counterfeit_model.pth"

DATASET_DIR = Path("scripts/_synthetic_currency_data")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Color palettes per denomination (BGR)
DENOMINATION_COLORS = {
    10:  {"bg": (130, 180, 210), "accent": (80, 120, 160)},    # brownish
    20:  {"bg": (100, 180, 140), "accent": (60, 130, 90)},     # greenish
    50:  {"bg": (180, 160, 200), "accent": (140, 110, 160)},   # blue-ish
    100: {"bg": (200, 170, 140), "accent": (160, 130, 100)},   # lavender
    200: {"bg": (140, 180, 200), "accent": (100, 140, 160)},   # yellow-ish
    500: {"bg": (140, 140, 180), "accent": (100, 100, 140)},   # stone grey
}

# ──────────────────────────────────────────────────────────
# 1. Synthetic Image Generator
# ──────────────────────────────────────────────────────────

def _add_watermark(img, genuine: bool):
    """Add a translucent oval watermark region on the left side."""
    h, w = img.shape[:2]
    overlay = img.copy()
    cx, cy = int(w * 0.18), int(h * 0.5)
    ax, ay = int(w * 0.08), int(h * 0.25)

    if genuine:
        # Smooth, semi-transparent oval with subtle gradient
        cv2.ellipse(overlay, (cx, cy), (ax, ay), 0, 0, 360, (255, 255, 255), -1)
        alpha = random.uniform(0.12, 0.22)
        cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)
        # Inner detail lines
        for i in range(3):
            y_off = int(ay * 0.4 * (i - 1))
            cv2.line(img, (cx - ax // 2, cy + y_off), (cx + ax // 2, cy + y_off),
                     (240, 240, 240), 1, cv2.LINE_AA)
    else:
        # Fake: either no watermark, or a harsh/printed one
        choice = random.random()
        if choice < 0.4:
            pass  # No watermark at all
        else:
            cv2.ellipse(overlay, (cx, cy), (ax, ay), 0, 0, 360, (255, 255, 255), -1)
            alpha = random.uniform(0.45, 0.7)  # Too opaque — looks printed
            cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)


def _add_security_thread(img, genuine: bool):
    """Add a vertical security thread in the centre band."""
    h, w = img.shape[:2]
    x = int(w * random.uniform(0.42, 0.52))

    if genuine:
        # Dashed metallic-looking thread
        segment = random.randint(6, 14)
        gap = random.randint(3, 6)
        y = 0
        color = (random.randint(180, 220),) * 3
        while y < h:
            cv2.line(img, (x, y), (x, min(y + segment, h)), color, 2, cv2.LINE_AA)
            y += segment + gap
    else:
        choice = random.random()
        if choice < 0.5:
            pass  # No thread
        else:
            # Solid thick line — printed, not embedded
            cv2.line(img, (x, 0), (x, h), (90, 90, 90), 4)


def _add_microtext(img, genuine: bool):
    """Simulate micro-text along a horizontal band."""
    h, w = img.shape[:2]
    y_band = int(h * random.uniform(0.75, 0.85))

    if genuine:
        text = "RBI " * 20
        font_scale = 0.25
        cv2.putText(img, text, (5, y_band), cv2.FONT_HERSHEY_SIMPLEX,
                    font_scale, (160, 160, 160), 1, cv2.LINE_AA)
    else:
        if random.random() < 0.5:
            pass  # No micro-text
        else:
            # Blurry / oversized text
            text = "RBI " * 10
            cv2.putText(img, text, (5, y_band), cv2.FONT_HERSHEY_SIMPLEX,
                        0.5, (120, 120, 120), 2)


def _add_serial_number(img, denomination):
    """Print a serial number in the top-right area."""
    h, w = img.shape[:2]
    serial = f"{random.randint(10,99)}{random.choice('ABCDEF')}{random.randint(100000,999999)}"
    cv2.putText(img, serial, (int(w * 0.55), int(h * 0.12)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (60, 60, 60), 1, cv2.LINE_AA)


def _add_denomination_text(img, denomination):
    """Large denomination number in bottom-right."""
    h, w = img.shape[:2]
    text = str(denomination)
    cv2.putText(img, text, (int(w * 0.72), int(h * 0.92)),
                cv2.FONT_HERSHEY_DUPLEX, 1.2, (50, 50, 50), 2, cv2.LINE_AA)


def _add_intaglio_texture(img, genuine: bool):
    """Simulate the raised-ink intaglio printing texture."""
    h, w = img.shape[:2]
    if genuine:
        # Add fine high-frequency noise to simulate textured printing
        noise = np.random.normal(0, 6, img.shape).astype(np.int16)
        img[:] = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    else:
        # Smoother — inkjet print
        img[:] = cv2.GaussianBlur(img, (3, 3), 1.5)


def _add_color_variation(img, genuine: bool):
    """Add realistic color shifting for genuine, or flat tones for fake."""
    h, w = img.shape[:2]
    if not genuine:
        # Slight colour cast — bad printing
        channel = random.choice([0, 1, 2])
        shift = random.randint(10, 30)
        img[:, :, channel] = np.clip(img[:, :, channel].astype(np.int16) + shift, 0, 255).astype(np.uint8)


def generate_currency_image(denomination: int, genuine: bool) -> np.ndarray:
    """Create one synthetic currency note image (224 × 224 BGR)."""
    colors = DENOMINATION_COLORS.get(denomination, DENOMINATION_COLORS[100])
    bg = colors["bg"]
    accent = colors["accent"]

    # Base canvas with slight gradient
    img = np.full((IMG_SIZE, IMG_SIZE, 3), bg, dtype=np.uint8)
    # Horizontal gradient overlay
    for x in range(IMG_SIZE):
        alpha = x / IMG_SIZE * 0.15
        img[:, x] = np.clip(
            img[:, x].astype(np.float32) * (1 - alpha) + np.array(accent, dtype=np.float32) * alpha,
            0, 255
        ).astype(np.uint8)

    # Decorative border
    border_thick = random.randint(3, 6)
    cv2.rectangle(img, (border_thick, border_thick),
                  (IMG_SIZE - border_thick, IMG_SIZE - border_thick), accent, border_thick)

    # Central Ashoka emblem placeholder (circle)
    cx, cy = IMG_SIZE // 2, IMG_SIZE // 2
    radius = random.randint(18, 28)
    if genuine:
        cv2.circle(img, (cx, cy), radius, accent, 2, cv2.LINE_AA)
        # Spokes
        for angle_deg in range(0, 360, 15):
            rad = math.radians(angle_deg)
            x2 = int(cx + radius * 0.7 * math.cos(rad))
            y2 = int(cy + radius * 0.7 * math.sin(rad))
            cv2.line(img, (cx, cy), (x2, y2), accent, 1, cv2.LINE_AA)
    else:
        if random.random() > 0.3:
            cv2.circle(img, (cx, cy), radius, accent, 2)
            # Fewer / no spokes

    # Security features
    _add_watermark(img, genuine)
    _add_security_thread(img, genuine)
    _add_microtext(img, genuine)
    _add_serial_number(img, denomination)
    _add_denomination_text(img, denomination)
    _add_intaglio_texture(img, genuine)
    _add_color_variation(img, genuine)

    # Random augmentation
    # Slight rotation
    angle = random.uniform(-5, 5)
    M = cv2.getRotationMatrix2D((IMG_SIZE / 2, IMG_SIZE / 2), angle, 1.0)
    img = cv2.warpAffine(img, M, (IMG_SIZE, IMG_SIZE), borderValue=bg)

    # Random brightness
    beta = random.randint(-15, 15)
    img = np.clip(img.astype(np.int16) + beta, 0, 255).astype(np.uint8)

    return img


def generate_dataset():
    """Generate full synthetic dataset on disk."""
    for label_name, genuine_flag in [("real", True), ("fake", False)]:
        for denom in DENOMINATIONS:
            out_dir = DATASET_DIR / label_name / str(denom)
            out_dir.mkdir(parents=True, exist_ok=True)

            samples_per_denom = NUM_SAMPLES_PER_CLASS // len(DENOMINATIONS)
            for i in range(samples_per_denom):
                img = generate_currency_image(denom, genuine_flag)
                cv2.imwrite(str(out_dir / f"{label_name}_{denom}_{i:04d}.png"), img)

    total = NUM_SAMPLES_PER_CLASS * 2
    logger.info(f"Generated {total} synthetic images → {DATASET_DIR}")


# ──────────────────────────────────────────────────────────
# 2. PyTorch Dataset
# ──────────────────────────────────────────────────────────

class CurrencyDataset(Dataset):
    """Loads real/fake currency images with labels (0=genuine, 1=counterfeit)."""

    def __init__(self, root_dir: Path, transform=None):
        self.samples = []   # (filepath, label)
        self.transform = transform

        real_dir = root_dir / "real"
        fake_dir = root_dir / "fake"
        extensions = ["*.png", "*.jpg", "*.jpeg", "*.bmp", "*.webp"]

        if real_dir.exists():
            for ext in extensions:
                for img_path in real_dir.rglob(ext):
                    self.samples.append((str(img_path), 0))
        if fake_dir.exists():
            for ext in extensions:
                for img_path in fake_dir.rglob(ext):
                    self.samples.append((str(img_path), 1))

        random.shuffle(self.samples)
        logger.info(f"CurrencyDataset: {len(self.samples)} samples loaded "
                    f"(genuine={sum(1 for _, l in self.samples if l == 0)}, "
                    f"counterfeit={sum(1 for _, l in self.samples if l == 1)})")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = cv2.imread(path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))

        if self.transform:
            img = self.transform(img)
        else:
            img = torch.from_numpy(img).permute(2, 0, 1).float() / 255.0

        return img, label


# ──────────────────────────────────────────────────────────
# 3. Model Definition
# ──────────────────────────────────────────────────────────

def build_model() -> nn.Module:
    """ResNet50 with a custom binary classification head."""
    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)

    # Freeze early layers — only fine-tune layer4 + fc
    for name, param in model.named_parameters():
        if "layer4" not in name and "fc" not in name:
            param.requires_grad = False

    # Replace classifier head
    in_features = model.fc.in_features   # 2048
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(inplace=True),
        nn.Dropout(0.2),
        nn.Linear(256, 2),
    )

    return model


# ──────────────────────────────────────────────────────────
# 4. Training Loop
# ──────────────────────────────────────────────────────────

def train(dataset_dir: Path):
    # Data transforms
    train_transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225]),
    ])

    dataset = CurrencyDataset(dataset_dir, transform=train_transform)

    # 80/20 train-val split
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_ds, val_ds = torch.utils.data.random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # Model
    model = build_model().to(DEVICE)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()),
                           lr=LEARNING_RATE)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.5)

    logger.info(f"Training on {DEVICE} — {train_size} train / {val_size} val samples")
    logger.info(f"Model: ResNet50 (fine-tune layer4 + fc), Epochs: {EPOCHS}, LR: {LEARNING_RATE}")

    best_val_acc = 0.0

    for epoch in range(1, EPOCHS + 1):
        # — Train —
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images = images.to(DEVICE)
            labels = torch.tensor(labels, dtype=torch.long).to(DEVICE)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

        train_loss = running_loss / total
        train_acc = correct / total

        # — Validate —
        model.eval()
        val_correct = 0
        val_total = 0
        val_loss = 0.0

        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(DEVICE)
                labels = torch.tensor(labels, dtype=torch.long).to(DEVICE)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)

        val_loss /= val_total
        val_acc = val_correct / val_total
        scheduler.step()

        logger.info(
            f"Epoch {epoch:02d}/{EPOCHS} │ "
            f"Train Loss: {train_loss:.4f}  Acc: {train_acc:.4f} │ "
            f"Val Loss: {val_loss:.4f}  Acc: {val_acc:.4f}"
        )

        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                "model_state_dict": model.state_dict(),
                "classes": ["GENUINE", "COUNTERFEIT"],
                "img_size": IMG_SIZE,
                "model_version": "v2.0-resnet50-synthetic",
                "best_val_acc": best_val_acc,
            }, MODEL_PATH)
            logger.info(f"  ✅ New best model saved → {MODEL_PATH}  (val_acc={best_val_acc:.4f})")

    logger.info(f"\n🏁 Training complete!  Best val accuracy: {best_val_acc:.4f}")
    logger.info(f"   Model saved to: {MODEL_PATH}")


# ──────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("Rakshak AI — Counterfeit Currency Detector Training")
    logger.info("=" * 60)

    # Check for user-provided real dataset directory
    REAL_DATASET_DIR = Path("dataset")
    has_real_dataset = False
    
    if REAL_DATASET_DIR.exists():
        # Count files of supported extensions
        real_files_count = 0
        for ext in ["*.png", "*.jpg", "*.jpeg", "*.bmp", "*.webp"]:
            real_files_count += len(list(REAL_DATASET_DIR.rglob(ext)))
            
        if real_files_count > 5:
            has_real_dataset = True

    if has_real_dataset:
        logger.info(f"🎯 Found real dataset at {REAL_DATASET_DIR} ({real_files_count} images).")
        logger.info("Skipping synthetic data generation and training on real dataset...")
        current_dataset_dir = REAL_DATASET_DIR
    else:
        logger.info(f"💡 No real dataset found at {REAL_DATASET_DIR} (or too few images). Using synthetic dataset pipeline.")
        # Step 1: Generate synthetic data
        if not DATASET_DIR.exists() or len(list(DATASET_DIR.rglob("*.png"))) < 100:
            logger.info("Step 1/2: Generating synthetic currency dataset...")
            generate_dataset()
        else:
            count = len(list(DATASET_DIR.rglob("*.png")))
            logger.info(f"Step 1/2: Synthetic dataset already exists ({count} images). Skipping generation.")
        current_dataset_dir = DATASET_DIR

    # Step 2: Train
    logger.info("Step 2/2: Training ResNet50 classifier...")
    train(current_dataset_dir)
