import torch
import cv2
import numpy as np
import logging
from app.config.settings import settings

logger = logging.getLogger(__name__)

# Try to load PyTorch classifier
classifier_available = False
classifier_model = None

try:
    # Optional PyTorch loading
    import torchvision.models as models
    # We would define the model architecture here (e.g. EfficientNetV2)
    # class CurrencyEfficientNet(torch.nn.Module): ...
    classifier_available = False  # Keep false until weights exist
except Exception as e:
    logger.warning(f"PyTorch classifier setup skipped ({e}). Fallback classification active.")

def classify_note(img_bytes: bytes, yolo_detections: list, ocr_results: dict) -> dict:
    """
    Classifies the banknote image as Real or Fake.
    Returns:
    - real_probability: float
    - fake_probability: float
    
    The classification is computed using the DL model if present.
    In Fallback Mode, it dynamically combines OCR validation,
    YOLO feature statuses, and image histogram metrics.
    """
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return {"real_probability": 0.0, "fake_probability": 1.0}
        
    # Default base probabilities
    real_prob = 0.95
    
    # Penalize based on YOLO security feature failures
    failed_yolo_count = sum(1 for d in yolo_detections if not d["status"])
    total_yolo_features = len(yolo_detections)
    
    if total_yolo_features > 0:
        yolo_penalty = (failed_yolo_count / total_yolo_features) * 0.50
        real_prob -= yolo_penalty
        
    # Penalize based on OCR validation failures
    if not ocr_results["serial_number_valid"]:
        real_prob -= 0.15
    if not ocr_results["rbi_text_detected"]:
        real_prob -= 0.15
    if not ocr_results["denomination_match"]:
        real_prob -= 0.10
        
    # Add a bit of image quality penalty if image is slightly out of focus
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.QNPlaplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if laplacian_var < 80.0:
        real_prob -= 0.05
        
    # Ensure bounds
    real_prob = max(0.01, min(0.99, real_prob))
    fake_prob = 1.0 - real_prob
    
    # Round for clean representation
    return {
        "real_probability": round(real_prob, 3),
        "fake_probability": round(fake_prob, 3)
    }
