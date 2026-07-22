import os
import json
from deep_translator import GoogleTranslator

base_translations = {
  "app_title": "Rakshak AI",
  "welcome": "Welcome to Rakshak AI",
  "dashboard": "Dashboard",
  "citizen_shield": "Citizen Shield",
  "scam_detection": "Scam Detection",
  "fraud_network": "Fraud Network",
  "crime_heatmap": "Crime Heatmap",
  "counterfeit": "Counterfeit Detection",
  "logout": "Logout",
  "login": "Login",
  "select_language": "Select Language",
  "analyze": "Analyze",
  "report_scam": "Report Scam",
  "risk_score": "Risk Score",
  "safe": "SAFE",
  "suspicious": "SUSPICIOUS",
  "scam": "SCAM",
  "command_center": "Command Center",
  "command_center_desc": "Live public safety intelligence and automated threat neutralization.",
  "scams_blocked": "Scams Blocked",
  "active_fraud_rings": "Active Fraud Rings",
  "critical_hotspots": "Critical Hotspots",
  "counterfeit_reports": "Counterfeit Reports",
  "vs_last_week": "vs last week",
  "scam_attempts_chart": "Scam Attempts vs Blocked (Last 7 Days)",
  "live_threat_alerts": "Live Threat Alerts",
  "high_risk_accounts": "High-Risk Accounts to Freeze",
  "view_all": "View All",
  "identifier": "IDENTIFIER",
  "type": "TYPE",
  "risk_score_caps": "RISK SCORE",
  "risk_level_caps": "RISK LEVEL",
  "fraud_connections": "FRAUD CONNECTIONS",
  "resolve": "Resolve",
  "active": "Active",
  "citizen_fraud_shield": "Citizen Fraud Shield",
  "citizen_shield_desc": "Protect yourself from digital scams. Analyze suspicious messages, calls, or transactions before proceeding.",
  "suspicious_message": "Suspicious Message or Transcript",
  "paste_message": "Paste the SMS, WhatsApp message, or email here...",
  "sender_phone": "Sender Phone Number",
  "suspicious_upi": "Suspicious UPI ID",
  "select_source": "Select Source",
  "whatsapp": "WhatsApp",
  "sms": "SMS",
  "phone_call": "Phone Call",
  "email": "Email",
  "analyze_threat_level": "Analyze Threat Level",
  "analysis_result": "Analysis Result",
  "threat_indicators": "Threat Indicators",
  "extracted_entities": "Extracted Entities",
  "digital_arrest_scam_detection": "Digital Arrest Scam Detection",
  "scam_detection_desc": "AI-powered analysis of live calls and transcripts to detect impersonation and digital arrest attempts.",
  "live_call_analysis": "Live Call Analysis",
  "call_simulator": "Call Simulator",
  "transcript_analysis": "Transcript Analysis",
  "start_live_recording": "Start Live Recording",
  "fraud_network_intelligence": "Fraud Network Intelligence",
  "fraud_network_desc": "Graph-based analysis to detect complex fraud rings, money mules, and central syndicate nodes.",
  "run_algorithms": "Run Algorithms",
  "detect_communities": "Detect Communities",
  "find_money_mules": "Find Money Mules",
  "identify_ring_leaders": "Identify Ring Leaders",
  "search_nodes": "Search Nodes",
  "geospatial_crime_heatmap": "Geospatial Crime Heatmap",
  "crime_heatmap_desc": "Live visualization of cybercrime density and emerging threat hotspots across India.",
  "filter_crime_type": "Filter by Crime Type",
  "all_crimes": "All Crimes",
  "financial_fraud": "Financial Fraud",
  "digital_arrest_type": "Digital Arrest",
  "phishing": "Phishing",
  "counterfeit_currency_detection": "Counterfeit Currency Detection",
  "counterfeit_desc": "Upload images of currency notes for AI-powered verification of security features.",
  "upload_note_image": "Upload Note Image",
  "drag_drop_image": "Drag & drop an image here, or click to select",
  "security_features_verification": "Security Features Verification",
  "watermark": "Watermark",
  "security_thread": "Security Thread",
  "micro_text": "Micro Text",
  "sign_in_account": "Sign in to your account",
  "email_address": "Email Address",
  "password": "Password",
  "sign_in": "Sign In",
  "dont_have_account": "Don't have an account?",
  "register": "Register",
  "alerts": "Alerts",
  "new_scan": "New Scan",
  "my_history": "My History",
  "citizen_shield_subtitle": "Verify suspicious messages, phone numbers, or UPI IDs instantly using AI.",
  "input_details": "Input Details",
  "suspicious_message_content": "Suspicious Message / Content",
  "upi_id_vpa": "UPI ID / VPA",
  "run_security_check": "Run Security Check",
  "enter_suspicious_details": "Enter suspicious details in the form and click 'Run Security Check' to analyze for fraud.",
  "sender_email": "Sender Email",
  "analyzing_data": "Analyzing Data...",
  "no_previous_scans": "No previous scans found.",
  "loading_history": "Loading history...",
  "date": "Date",
  "source": "Source",
  "verdict": "Verdict",
  "scam_type": "Scam Type"
}

# The target languages corresponding to our options
target_langs = {
    "hi": "hi",
    "bn": "bn",
    "mr": "mr",
    "te": "te",
    "ta": "ta",
    "gu": "gu",
    "ur": "ur",
    "kn": "kn",
    "or": "or", # Odia might be 'or' in Google Translate
    "ml": "ml",
    "pa": "pa",
    "as": "as" # Assamese might be 'as'
}

# Use the correct google translate codes if different. 
# Odia is 'or', Assamese is 'as'

frontend_locales_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "src", "locales")

print(f"Writing to {frontend_locales_dir}")

for lang_code, google_code in target_langs.items():
    translated_dict = {}
    print(f"Translating for {lang_code}...")
    try:
        translator = GoogleTranslator(source='en', target=google_code)
        for key, value in base_translations.items():
            # Keep Rakshak AI as is if possible, but let's just translate all
            if key == "app_title":
                translated_dict[key] = "Rakshak AI"
            else:
                translated = translator.translate(value)
                translated_dict[key] = translated
                
        # Write to file
        file_path = os.path.join(frontend_locales_dir, f"{lang_code}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(translated_dict, f, ensure_ascii=False, indent=2)
            
    except Exception as e:
        print(f"Failed to translate for {lang_code}: {e}")

print("Translation complete.")
