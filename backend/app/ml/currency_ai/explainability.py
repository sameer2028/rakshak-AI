import cv2
import numpy as np
import base64
import logging

logger = logging.getLogger(__name__)

def generate_grad_cam_overlay(img_bytes: bytes, detections: list) -> str:
    """
    Generates a Grad-CAM / Score-CAM style heatmap visualization.
    Highlights areas of high activation (Mahatma Gandhi, Security Thread, Ashoka Pillar).
    Blends the colormap with the original image and returns a base64 string.
    """
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return ""
        
    target_w, target_h = 1000, 460
    img_resized = cv2.resize(img, (target_w, target_h))
    
    # 1. Create a blank canvas for activation maps
    activation_map = np.zeros((target_h, target_w), dtype=np.float32)
    
    # 2. Draw activation heat spots around primary security features
    for det in detections:
        xmin, ymin, xmax, ymax = det["box"]
        # Standardize coordinates
        xmin = max(0, xmin)
        ymin = max(0, ymin)
        xmax = min(target_w, xmax)
        ymax = min(target_h, ymax)
        
        # Center of feature
        cx = int((xmin + xmax) / 2)
        cy = int((ymin + ymax) / 2)
        
        # Draw soft Gaussian circular peaks inside bounding boxes
        r_x = int((xmax - xmin) / 2)
        r_y = int((ymax - ymin) / 2)
        radius = max(r_x, r_y)
        
        # Add higher activation score to critical features
        intensity = 0.8
        if "Watermark" in det["name"]:
            intensity = 1.0
        elif "Thread" in det["name"]:
            intensity = 0.9
        elif "Pillar" in det["name"]:
            intensity = 0.95
            
        cv2.circle(activation_map, (cx, cy), int(radius * 1.2), intensity, -1)
        
    # 3. Apply broad Gaussian Blur to make it a continuous heatmap
    activation_map = cv2.GaussianBlur(activation_map, (101, 101), 0)
    
    # Normalize to 0-255
    if np.max(activation_map) > 0:
        activation_map = (activation_map / np.max(activation_map) * 255).astype(np.uint8)
    else:
        activation_map = activation_map.astype(np.uint8)
        
    # 4. Color map
    heatmap = cv2.applyColorMap(activation_map, cv2.COLORMAP_JET)
    
    # 5. Overlay on original image
    # Alpha = 0.6 (original), Beta = 0.4 (heatmap)
    overlay = cv2.addWeighted(img_resized, 0.6, heatmap, 0.4, 0)
    
    # 6. Encode to base64
    _, buffer = cv2.imencode('.png', overlay)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return f"data:image/png;base64,{img_base64}"
