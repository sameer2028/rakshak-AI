import os
import glob
import re

phrases = {
    # Dashboard
    "Command Center": "command_center",
    "Live public safety intelligence and automated threat neutralization.": "command_center_desc",
    "Scams Blocked": "scams_blocked",
    "Active Fraud Rings": "active_fraud_rings",
    "Critical Hotspots": "critical_hotspots",
    "Counterfeit Reports": "counterfeit_reports",
    "vs last week": "vs_last_week",
    "Scam Attempts vs Blocked (Last 7 Days)": "scam_attempts_chart",
    "Live Threat Alerts": "live_threat_alerts",
    "High-Risk Accounts to Freeze": "high_risk_accounts",
    "View All": "view_all",
    "IDENTIFIER": "identifier",
    "TYPE": "type",
    "RISK SCORE": "risk_score_caps",
    "RISK LEVEL": "risk_level_caps",
    "FRAUD CONNECTIONS": "fraud_connections",
    "Resolve": "resolve",
    "Active": "active",
    
    # Citizen Shield
    "Citizen Fraud Shield": "citizen_fraud_shield",
    "Protect yourself from digital scams. Analyze suspicious messages, calls, or transactions before proceeding.": "citizen_shield_desc",
    "Suspicious Message or Transcript": "suspicious_message",
    "Paste the SMS, WhatsApp message, or email here...": "paste_message",
    "Sender Phone Number": "sender_phone",
    "Suspicious UPI ID": "suspicious_upi",
    "Select Source": "select_source",
    "WhatsApp": "whatsapp",
    "SMS": "sms",
    "Phone Call": "phone_call",
    "Email": "email",
    "Analyze Threat Level": "analyze_threat_level",
    "Analysis Result": "analysis_result",
    "Threat Indicators": "threat_indicators",
    "Extracted Entities": "extracted_entities",
    
    # Scam Detection
    "Digital Arrest Scam Detection": "digital_arrest_scam_detection",
    "AI-powered analysis of live calls and transcripts to detect impersonation and digital arrest attempts.": "scam_detection_desc",
    "Live Call Analysis": "live_call_analysis",
    "Call Simulator": "call_simulator",
    "Transcript Analysis": "transcript_analysis",
    "Start Live Recording": "start_live_recording",
    
    # Fraud Network
    "Fraud Network Intelligence": "fraud_network_intelligence",
    "Graph-based analysis to detect complex fraud rings, money mules, and central syndicate nodes.": "fraud_network_desc",
    "Run Algorithms": "run_algorithms",
    "Detect Communities": "detect_communities",
    "Find Money Mules": "find_money_mules",
    "Identify Ring Leaders": "identify_ring_leaders",
    "Search Nodes": "search_nodes",
    
    # Crime Heatmap
    "Geospatial Crime Heatmap": "geospatial_crime_heatmap",
    "Live visualization of cybercrime density and emerging threat hotspots across India.": "crime_heatmap_desc",
    "Filter by Crime Type": "filter_crime_type",
    "All Crimes": "all_crimes",
    "Financial Fraud": "financial_fraud",
    "Digital Arrest": "digital_arrest_type",
    "Phishing": "phishing",
    
    # Counterfeit
    "Counterfeit Currency Detection": "counterfeit_currency_detection",
    "Upload images of currency notes for AI-powered verification of security features.": "counterfeit_desc",
    "Upload Note Image": "upload_note_image",
    "Drag & drop an image here, or click to select": "drag_drop_image",
    "Security Features Verification": "security_features_verification",
    "Watermark": "watermark",
    "Security Thread": "security_thread",
    "Micro Text": "micro_text",
    
    # Auth
    "Sign in to your account": "sign_in_account",
    "Email Address": "email_address",
    "Password": "password",
    "Sign In": "sign_in",
    "Don't have an account?": "dont_have_account",
    "Register": "register",
    
    # Common
    "Dashboard": "dashboard",
    "Citizen Shield": "citizen_shield",
    "Scam Detection": "scam_detection",
    "Fraud Network": "fraud_network",
    "Crime Heatmap": "crime_heatmap",
    "Counterfeit Detection": "counterfeit",
    "Logout": "logout"
}

frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "src")
jsx_files = glob.glob(os.path.join(frontend_dir, "**", "*.jsx"), recursive=True)

for file_path in jsx_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    modified = False

    for text, key in phrases.items():
        escaped_text = re.escape(text)
        
        # Replace exact text within > < tags, allowing leading/trailing whitespace/newlines
        pattern_node = f">(\\s*){escaped_text}(\\s*)<"
        def repl_node(match):
            return f">{match.group(1)}{{t('{key}')}}{match.group(2)}<"
        
        if re.search(pattern_node, content):
            content = re.sub(pattern_node, repl_node, content)
            modified = True
            
        # Replace string literal properties: title="Text" or placeholder="Text"
        pattern_prop = f'([a-zA-Z]+)="{escaped_text}"'
        def repl_prop(match):
            return f"{match.group(1)}={{t('{key}')}}"
        if re.search(pattern_prop, content):
            content = re.sub(pattern_prop, repl_prop, content)
            modified = True
            
        # Replace plain text if not covered (risky but we have specific texts)
        # We only do this if it's very specific, like the title of the app, but node and prop should cover 99%

    if modified:
        # Check if useTranslation is imported
        if "useTranslation" not in content:
            # Find the last import statement and add it after
            imports_end = [m.end() for m in re.finditer(r"^import .*;?\n", content, re.MULTILINE)]
            insert_pos = imports_end[-1] if imports_end else 0
            
            import_statement = "import { useTranslation } from 'react-i18next';\n"
            content = content[:insert_pos] + import_statement + content[insert_pos:]
            
        # Inject const { t } = useTranslation(); into ALL functional components in the file
        # We find: export default function X() { OR function X() { OR const X = () => {
        func_patterns = [
            r"export\s+default\s+function\s+\w+\s*\([^)]*\)\s*{",
            r"export\s+function\s+\w+\s*\([^)]*\)\s*{",
            r"function\s+\w+\s*\([^)]*\)\s*{"
        ]
        
        for p in func_patterns:
            matches = list(re.finditer(p, content))
            for m in reversed(matches): # traverse backward to preserve indices
                body_start = m.end()
                # Check if it's already there in the next 100 chars to avoid double inject
                if "useTranslation" not in content[body_start:body_start+150]:
                    inject_code = "\n  const { t } = useTranslation();"
                    content = content[:body_start] + inject_code + content[body_start:]
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Modified: {file_path}")

print("Auto-translation text replacement complete.")
