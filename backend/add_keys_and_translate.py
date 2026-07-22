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
    "scam_detection_subtitle": "Analyze call transcripts using NLP to detect impersonation and extortion attempts.",
    "paste_text": "Paste Text",
    "simulator": "Simulator",
    "live_mic": "Live Mic",
    "upload_wav": "Upload .WAV",
    "interactive_scenario": "Interactive Scenario",
    "paste_transcript_prompt": "Paste a call transcript and click 'Analyze' to detect potential scam indicators.",
    "call_transcript": "Call Transcript",
    "auto_transcription_active": "Auto-transcription active",
    "call_metadata_optional": "Call Metadata (Optional)",
    "caller_number": "Caller Number",
    "receiver_number": "Receiver Number",
    "flag_voip": "Flag as suspected VoIP / Spoofed Call",
    "running_nlp": "Running NLP Analysis...",
    "analyze_transcript": "Analyze Transcript",
    "transcript_placeholder": "Paste the audio transcript here...",
    "no_scam_detected": "No Scam Detected",
    "scam_detected": "SCAM DETECTED",
    "detected_type": "Detected Type:",
    "model_confidence": "Model Confidence:",
    "fraud_network_match_title": "🚨 FRAUD NETWORK MATCH",
    "threat_indicators_found": "Threat Indicators Found",
    "no_specific_indicators": "No specific indicators extracted.",
    "recommended_action_plan": "Recommended Action Plan",
    "ai_suggested_response": "AI Suggested Response",
    "response_high_risk": "\"I will contact my bank or the local authorities directly. I will not share any information over the phone.\"",
    "response_low_risk": "\"Thank you for the information, I will verify this and get back to you.\""
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
            
print("Missing translations added for Scam Detection.")
