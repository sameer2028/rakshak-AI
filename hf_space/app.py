import gradio as gr
import base64
import os
import sys

# Ensure local 'app' module can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ml.currency_ai.quality import assess_image_quality
from app.ml.currency_ai.preprocessing import apply_preprocessing_filters
from app.ml.currency_ai.detector import detect_security_features
from app.ml.currency_ai.ocr import extract_banknote_text
from app.ml.currency_ai.classifier import classify_note
from app.ml.currency_ai.decision import evaluate_verdict
from app.ml.currency_ai.explainability import generate_grad_cam_overlay

def predict_currency(data_uri: str, denom_val: int):
    """
    Receives base64 image and denomination from the Core Render API.
    Runs the heavy PyTorch/YOLO/EasyOCR inference and returns JSON.
    """
    try:
        header, encoded = data_uri.split(",", 1)
        content = base64.b64decode(encoded)
        
        quality_report = assess_image_quality(content)
        preprocessed_images = apply_preprocessing_filters(content)
        
        yolo_detections = []
        ocr_results = {
            "serial_number": None,
            "serial_number_valid": False,
            "rbi_text_detected": False,
            "rbi_text": None,
            "governor_signature_detected": False,
            "denomination_text": None,
            "denomination_match": False
        }
        classification = {"real_probability": 0.0, "fake_probability": 1.0}
        
        if quality_report["is_valid"]:
            yolo_detections = detect_security_features(content, int(denom_val))
            ocr_results = extract_banknote_text(content, int(denom_val))
            classification = classify_note(content, yolo_detections, ocr_results)
            decision = evaluate_verdict(quality_report, yolo_detections, ocr_results, classification)
            grad_cam_heatmap = generate_grad_cam_overlay(content, yolo_detections)
        else:
            decision = evaluate_verdict(quality_report, yolo_detections, ocr_results, classification)
            grad_cam_heatmap = preprocessed_images.get("original", "")

        return {
            "quality_report": quality_report,
            "preprocessed_images": preprocessed_images,
            "yolo_detections": yolo_detections,
            "ocr_results": ocr_results,
            "decision": decision,
            "grad_cam_heatmap": grad_cam_heatmap
        }
    except Exception as e:
        return {"error": str(e)}

# Gradio automatically exposes `/api/predict` when we define an Interface
demo = gr.Interface(
    fn=predict_currency,
    inputs=[gr.Textbox(label="Base64 Image Data URI"), gr.Number(value=500, label="Denomination")],
    outputs=gr.JSON(label="Analysis Results"),
    title="Rakshak AI - Counterfeit Currency Microservice",
    description="Internal API for processing heavy PyTorch Computer Vision workloads."
)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
