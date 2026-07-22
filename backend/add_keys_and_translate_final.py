import json
import os
import sys

# Ensure deep_translator is imported
try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("deep_translator not installed")
    sys.exit(1)

new_keys = {
    "counterfeit_subtitle": "AI-powered multi-stage security feature verification using YOLOv11, EasyOCR, and EfficientNetV2.",
    "scanner_console": "Scanner Console",
    "analytics_vault": "Analytics Vault",
    "audit_history": "Audit History",
    "upload_banknote": "Upload Banknote for Analysis",
    "upload_banknote_desc": "Select denomination and upload a high-resolution flat image of the banknote front side.",
    "drag_drop_banknote": "Drag and drop your banknote here",
    "supports_images": "Supports PNG, JPG, or JPEG",
    "select_denomination": "SELECT DENOMINATION",
    "analyze_note": "ANALYZE NOTE",
    "yolo_detection": "YOLOv11 Feature Detection",
    "efficientnet_classifier": "EfficientNetV2 Classifier",
    "easyocr_matching": "EasyOCR Serial Matching",
    
    "crime_density_heatmap": "Crime Density Heatmap",
    "heatmap_subtitle": "Geospatial intelligence of cybercrime hotspots across India.",
    "filters": "Filters:",
    "all_crime_types": "All Crime Types",
    "all_states": "All States",
    "date_format": "dd-mm-yyyy",
    "high_risk_districts": "High Risk Districts",
    "cases": "Cases:",
    "score": "Score:",
    
    "threat_alerts_database": "Threat Alerts Database",
    "alerts_subtitle": "Comprehensive log of all automated threat detections and alerts.",
    "all_status": "All Status",
    "active_only": "Active Only",
    "all_severity": "All Severity",
    "time_col": "Time",
    "severity_col": "Severity",
    "alert_details_col": "Alert Details",
    "module_col": "Module",
    "action_col": "Action",
    "mark_resolved": "Mark Resolved",
    "resolved": "Resolved",
    "critical": "Critical",
    "high": "High",
    "medium": "Medium",
    "low": "Low",
    "no_alerts_found": "No alerts found",
    "adjust_filters": "Try adjusting your filters.",
    
    "stage1_title": "Stage 1: Preprocessing & CLAHE",
    "stage1_desc": "Applies Contrast Limited Adaptive Histogram Equalization (CLAHE) filters and localized thresholding masks to reveal hidden micro-prints, watermarks, and serial engravings.",
    "stage1_status": "Image Optimization Grid Active",
    "stage2_title": "Stage 2: YOLOv11 Feature Anchoring",
    "stage2_desc": "Deploying YOLOv11 convolutional neural networks to localize primary security landmarks: Mahatma Gandhi Watermark, Ashoka Pillar, RBI Seal, and the color-shifting Security Thread.",
    "stage2_status": "Neural Anchors Ready",
    "stage3_title": "Stage 3: EasyOCR & Signature Diagnostics",
    "stage3_desc": "Extracts the banknote serial number prefix and governor's signature block, cross-validating the format against standard RBI database structures.",
    "stage3_status": "EasyOCR Pipeline Configured",
    "compiling_analytics": "Compiling analytics...",
    "no_analytics_data": "No analytics data available. Run some verifications first."
}

locales_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'src', 'locales')

with open(os.path.join(locales_dir, 'en.json'), 'r', encoding='utf-8') as f:
    en_translations = json.load(f)

# Update English
en_translations.update(new_keys)
with open(os.path.join(locales_dir, 'en.json'), 'w', encoding='utf-8') as f:
    json.dump(en_translations, f, ensure_ascii=False, indent=2)

target_languages = {
    'hi': 'Hindi', 'bn': 'Bengali', 'mr': 'Marathi', 'te': 'Telugu',
    'ta': 'Tamil', 'gu': 'Gujarati', 'ur': 'Urdu', 'kn': 'Kannada',
    'or': 'Odia', 'ml': 'Malayalam', 'pa': 'Punjabi', 'as': 'Assamese'
}

for lang_code in target_languages.keys():
    file_path = os.path.join(locales_dir, f"{lang_code}.json")
    
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            lang_dict = json.load(f)
    else:
        lang_dict = {}

    missing_keys = [k for k in en_translations.keys() if k not in lang_dict]
    
    if missing_keys:
        print(f"Translating {len(missing_keys)} missing keys for {lang_code}...")
        for key in missing_keys:
            text = en_translations[key]
            try:
                translated_text = GoogleTranslator(source='en', target=lang_code).translate(text)
                lang_dict[key] = translated_text
            except Exception as e:
                print(f"Error translating '{text}' to {lang_code}: {e}")
                lang_dict[key] = text # fallback to english
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(lang_dict, f, ensure_ascii=False, indent=2)
            
print("Missing translations added for Final Sweep.")
