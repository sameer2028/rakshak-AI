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
    "cluster": "Cluster",
    "suspected_ring_leader": "Suspected Ring Leader",
    "suspected_money_mule": "Suspected Money Mule",
    "flagged_entity": "Flagged Entity",
    "properties": "Properties",
    "pagerank": "PageRank",
    "centrality": "Centrality",
    "connections": "Connections",
    "more_connections": "more connections",
    "detected_syndicates": "Detected Syndicates",
    "community": "Community",
    "nodes_count": "nodes",
    "leader": "Leader:",
    "money_mules_count": "Money Mule(s)",
    "view_on_graph": "View on Graph",
    "analysis_complete": "Analysis Complete",
    "algorithm": "Algorithm:",
    "execution_time": "Execution Time:",
    "total_nodes_processed": "Total Nodes Processed:",
    "communities_detected": "Communities Detected:",
    "ring_leaders_identified": "Ring Leaders Identified:",
    "money_mules_flagged": "Money Mules Flagged:",
    "close": "Close"
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
            
print("Missing translations added for Network 2.")
