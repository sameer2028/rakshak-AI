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
    "interactive_viz": "Interactive visualization of crime rings, money mules, and suspect links.",
    "nodes": "Nodes",
    "links": "Links",
    "syndicates": "Syndicates",
    "controls": "Controls",
    "export_graph": "Export Graph as PNG",
    "legend": "Legend",
    "suspect": "Suspect",
    "victim": "Victim",
    "phone": "Phone",
    "upi_id": "UPI",
    "bank_account": "Bank Account",
    "ring_leader": "Ring Leader",
    "money_mule": "Money Mule",
    "no_network_data": "No Network Data Found",
    "adjust_filters_prompt": "Try adjusting your filters or search query to explore the fraud intelligence graph.",
    "reset_view": "Reset View",
    "initializing_grid": "Initializing Intelligence Grid...",
    "all_types": "All Types",
    "graph_intelligence_algorithms": "Graph Intelligence Algorithms",
    "detect_communities": "Detect Communities (Louvain)",
    "find_ring_leaders": "Find Ring Leaders (PageRank)",
    "find_money_mules": "Find Money Mules (Centrality)",
    "graph_filters": "Graph Filters",
    "community_syndicate": "Community / Syndicate",
    "all_communities": "All Communities",
    "node_type": "Node Type",
    "search_placeholder": "Search phone, UPI...",
    "search_button": "Search"
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
            
print("Missing translations added for Fraud Network.")
