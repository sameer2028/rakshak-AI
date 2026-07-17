import cv2
import numpy as np

def assess_image_quality(image_bytes: bytes) -> dict:
    """
    Performs image quality validation on the uploaded binary image.
    Checks:
    1. Resolution (Minimum size)
    2. Brightness (Mean pixel value)
    3. Sharpness / Blur (Laplacian variance)
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return {
            "is_valid": False,
            "sharpness_score": 0.0,
            "brightness_score": 0.0,
            "resolution": "0x0",
            "checks": {
                "format_valid": False,
                "not_blurry": False,
                "good_lighting": False,
                "sufficient_resolution": False
            }
        }
    
    h, w, _ = img.shape
    resolution_str = f"{w}x{h}"
    
    # Gray conversion for processing
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Brightness check
    mean_brightness = float(np.mean(gray))
    good_lighting = 50.0 <= mean_brightness <= 240.0
    
    # Sharpness / Blur check
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    not_blurry = laplacian_var >= 60.0  # Threshold of 60 is standard for banknote details
    
    # Resolution check
    sufficient_resolution = w >= 600 and h >= 400
    
    # Aggregate validity
    is_valid = bool(good_lighting and not_blurry and sufficient_resolution)
    
    return {
        "is_valid": is_valid,
        "sharpness_score": round(laplacian_var, 2),
        "brightness_score": round(mean_brightness, 2),
        "resolution": resolution_str,
        "checks": {
            "format_valid": True,
            "not_blurry": not_blurry,
            "good_lighting": good_lighting,
            "sufficient_resolution": sufficient_resolution
        }
    }
