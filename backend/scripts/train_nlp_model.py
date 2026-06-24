import os
import random
import pandas as pd
import joblib
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from loguru import logger

# Ensure model directory exists
MODEL_DIR = Path(os.getenv("ML_MODELS_DIR", "app/ml/models"))
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / "nlp_scam_detector.pkl"

# --- 1. Synthetic Data Generation ---
logger.info("Generating synthetic NLP training data...")

def generate_nlp_data(n_samples=5000):
    data = []
    
    # Scam Types: 'safe', 'digital_arrest', 'fake_cbi', 'phishing'
    
    safe_templates = [
        "Hi, are we still meeting for lunch tomorrow?",
        "Your pizza has been delivered.",
        "Please find the attached Q3 report for your review.",
        "Can you call me back when you are free?",
        "I will be late by 10 minutes due to traffic."
    ]
    
    digital_arrest_templates = [
        "Your Aadhaar is linked to illegal money laundering. Do not disconnect the call.",
        "You are under digital arrest. A parcel was seized by customs containing illegal items.",
        "This is an automated call from telecom department. Your number will be blocked in 2 hours.",
        "We found 20 credit cards in a package under your name. Pay penalty immediately.",
        "Your bank accounts are frozen pending investigation by the police."
    ]
    
    fake_cbi_templates = [
        "This is inspector Sharma from CBI cyber crime division.",
        "An FIR has been lodged against you by ED for tax evasion.",
        "I am calling from the Supreme Court. Transfer the bail amount to the secret account.",
        "To verify you are not involved in the smuggling case, deposit the security fee."
    ]
    
    phishing_templates = [
        "Congratulations! You won a lottery of Rs 25 Lakhs. Click link to claim.",
        "Your electricity bill is overdue. Power will be cut at 9 PM. Call this number.",
        "KYC suspended for your SBI account. Update via this link immediately.",
        "Dear customer, your reward points are expiring today. Redeem now."
    ]
    
    for _ in range(n_samples):
        # 0: safe, 1: digital_arrest, 2: fake_cbi, 3: phishing
        label = random.choices([0, 1, 2, 3], weights=[0.4, 0.2, 0.2, 0.2])[0]
        
        if label == 0:
            text = random.choice(safe_templates)
            label_str = "safe"
        elif label == 1:
            text = random.choice(digital_arrest_templates)
            label_str = "digital_arrest"
        elif label == 2:
            text = random.choice(fake_cbi_templates)
            label_str = "fake_cbi"
        else:
            text = random.choice(phishing_templates)
            label_str = "phishing"
            
        # Add some random noise
        words = text.split()
        if random.random() > 0.5:
            random.shuffle(words)
        text = " ".join(words)
            
        data.append({
            "text": text,
            "label": label_str
        })
        
    return pd.DataFrame(data)

df = generate_nlp_data(10000)
X = df["text"]
y = df["label"]

logger.info(f"Generated {len(df)} samples. Class distribution:\n{df['label'].value_counts()}")

# --- 2. Pipeline Construction ---
logger.info("Constructing TF-IDF + Logistic Regression pipeline...")

pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(max_features=1000, stop_words="english", ngram_range=(1, 2))),
    ("classifier", LogisticRegression(class_weight='balanced', max_iter=1000))
])

# --- 3. Training ---
logger.info("Training NLP Scam Detector...")
pipeline.fit(X, y)

train_acc = pipeline.score(X, y)
logger.info(f"Training Accuracy: {train_acc:.4f}")

# --- 4. Saving Model ---
logger.info(f"Saving model to {MODEL_PATH}")
joblib.dump(pipeline, MODEL_PATH)

logger.info("Training complete! Model is ready for inference.")
