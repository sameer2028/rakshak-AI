import cv2
import numpy as np
import base64

def encode_image_to_base64(img: np.ndarray) -> str:
    """Encodes an OpenCV image to base64 PNG string."""
    _, buffer = cv2.imencode('.png', img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"

def apply_preprocessing_filters(img_bytes: bytes) -> dict:
    """
    Applies a chain of computer vision filters to the banknote image:
    1. Grayscale conversion
    2. CLAHE (Contrast Limited Adaptive Histogram Equalization)
    3. Gaussian Blur (for noise filtering)
    4. Adaptive Thresholding (for micro-text and emblem details)
    5. Canny Edge Detection (for watermark and thread bounds)
    Returns base64 encoded images of each state for the UI preview.
    """
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return {}
        
    # Resize to standard width of 1000px keeping aspect ratio for uniform processing
    h, w, _ = img.shape
    new_w = 1000
    new_h = int((new_w / w) * h)
    img_resized = cv2.resize(img, (new_w, new_h))
    
    # 1. Grayscale
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    
    # 2. CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    clahe_img = clahe.apply(gray)
    
    # 3. Gaussian Blur
    blur_img = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 4. Adaptive Thresholding
    thresh_img = cv2.adaptiveThreshold(
        blur_img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # 5. Canny Edge Detection
    canny_img = cv2.Canny(blur_img, 50, 150)
    
    return {
        "original": encode_image_to_base64(img_resized),
        "grayscale": encode_image_to_base64(gray),
        "clahe": encode_image_to_base64(clahe_img),
        "threshold": encode_image_to_base64(thresh_img),
        "edges": encode_image_to_base64(canny_img)
    }
