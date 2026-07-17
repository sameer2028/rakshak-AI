import logging

logger = logging.getLogger(__name__)

def evaluate_verdict(quality_report: dict, yolo_detections: list, ocr_results: dict, classification: dict) -> dict:
    """
    Evaluates the final security verdict by checking all conditions:
    1. Watermark validation.
    2. Security thread presence and color test.
    3. Ashoka emblem verification.
    4. RBI Seal structure.
    5. Serial number pattern correctness.
    6. Denomination matches OCR text.
    7. Classifier probability.
    
    Returns:
    - is_genuine: bool
    - confidence: float (0-100)
    - verdict_summary: str
    - checklist: dict
    """
    
    # If image quality check is invalid, immediately flag verification as failed
    if not quality_report.get("is_valid", False):
        return {
            "is_genuine": False,
            "confidence": 0.0,
            "verdict_summary": "Verification suspended: Uploaded image failed quality checks (excessive blur, size too small, or poor illumination). Please re-capture in good lighting.",
            "checklist": {
                "Image Quality Check": False,
                "Mahatma Gandhi Watermark": False,
                "Security Thread": False,
                "RBI Seal": False,
                "Ashoka Pillar": False,
                "Serial Number Format": False,
                "Denomination Alignment": False
            }
        }
        
    # Map detections for quick check status
    features_status = {d["name"]: d["status"] for d in yolo_detections}
    
    # Build Checklist
    watermark_ok = features_status.get("Mahatma Gandhi Watermark", False)
    thread_ok = features_status.get("Security Thread", False)
    seal_ok = features_status.get("RBI Seal", False)
    pillar_ok = features_status.get("Ashoka Pillar", False)
    serial_format_ok = ocr_results.get("serial_number_valid", False)
    denom_match_ok = ocr_results.get("denomination_match", False)
    
    checklist = {
        "Image Quality Check": True,
        "Mahatma Gandhi Watermark": watermark_ok,
        "Security Thread": thread_ok,
        "RBI Seal": seal_ok,
        "Ashoka Pillar": pillar_ok,
        "Serial Number Format": serial_format_ok,
        "Denomination Alignment": denom_match_ok
    }
    
    # Weights for calculation (out of 100)
    # Watermark = 20, Thread = 25, Seal = 10, Pillar = 15, Serial OCR = 15, Classifier = 15
    score = 0.0
    if watermark_ok: score += 20.0
    if thread_ok: score += 25.0
    if seal_ok: score += 10.0
    if pillar_ok: score += 15.0
    if serial_format_ok: score += 15.0
    
    # Add classification weight adjusted by classifier confidence
    classifier_weight = 15.0
    real_prob = classification.get("real_probability", 0.5)
    score += real_prob * classifier_weight
    
    # Cap score
    score = min(100.0, max(0.0, score))
    
    # Verdict assignment
    # Genuine: score >= 80 and critical features (watermark, thread, serial) must be true
    critical_features_passed = watermark_ok and thread_ok and serial_format_ok
    
    is_genuine = False
    if score >= 80.0 and critical_features_passed:
        is_genuine = True
        verdict_summary = f"Genuine currency note verified successfully. Overall confidence is {round(score, 1)}%. All primary security and OCR validations passed."
    elif score >= 50.0:
        is_genuine = False
        failed_critical = []
        if not watermark_ok: failed_critical.append("Mahatma Gandhi Watermark")
        if not thread_ok: failed_critical.append("Security Thread")
        if not serial_format_ok: failed_critical.append("Serial Number Format")
        
        if failed_critical:
            verdict_summary = f"Suspicious Note: Failed critical security features: {', '.join(failed_critical)}. Confidence score: {round(score, 1)}%."
        else:
            verdict_summary = f"Suspicious Note: Verification failed due to minor feature alignment anomalies. Confidence score: {round(score, 1)}%."
    else:
        is_genuine = False
        verdict_summary = f"Counterfeit Alert: The note failed multiple core security tests. Confidence score is dangerously low ({round(score, 1)}%). High probability of fake currency."
        
    return {
        "is_genuine": is_genuine,
        "confidence": round(score, 2),
        "verdict_summary": verdict_summary,
        "checklist": checklist
    }
