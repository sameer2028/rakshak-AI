import os
import random
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, FunctionTransformer
import xgboost as xgb
from loguru import logger

# Ensure model directory exists
MODEL_DIR = Path(os.getenv("ML_MODELS_DIR", "app/ml/models"))
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / "fraud_classifier.pkl"

# --- 1. Synthetic Data Generation ---
logger.info("Generating synthetic training data...")

def generate_synthetic_data(n_samples=5000):
    data = []
    
    scam_keywords = ["urgent", "kyc", "block", "suspended", "prize", "lottery", "customs", "cbi", "arrest", "fine", "penalty"]
    safe_keywords = ["meeting", "dinner", "lunch", "hi", "hello", "project", "report", "call me", "tomorrow"]
    
    for _ in range(n_samples):
        # 0: SAFE, 1: SUSPICIOUS, 2: SCAM
        label = random.choices([0, 1, 2], weights=[0.6, 0.2, 0.2])[0]
        
        # message text
        msg_words = []
        num_words = random.randint(5, 25)
        
        is_voip = 0
        phone_prefix = random.randint(100, 999)
        upi_domain = random.randint(0, 5) # 0: okicici, 1: okhdfcbank, etc.
        
        if label == 2: # SCAM
            msg_words.extend(random.choices(scam_keywords, k=random.randint(2, 5)))
            is_voip = random.choices([0, 1], weights=[0.2, 0.8])[0]
            if is_voip:
                phone_prefix = random.choice([140, 144, 800])
        elif label == 1: # SUSPICIOUS
            msg_words.extend(random.choices(scam_keywords, k=random.randint(0, 2)))
            msg_words.extend(random.choices(safe_keywords, k=random.randint(2, 4)))
            is_voip = random.choices([0, 1], weights=[0.7, 0.3])[0]
        else: # SAFE
            msg_words.extend(random.choices(safe_keywords, k=random.randint(3, 8)))
            is_voip = random.choices([0, 1], weights=[0.95, 0.05])[0]
            phone_prefix = random.randint(600, 999)
            
        # Add random words
        msg_words.extend(["the", "and", "your", "account", "is", "for"] * random.randint(1, 3))
        random.shuffle(msg_words)
        message = " ".join(msg_words)
        
        # custom feature extraction mimics what will happen in inference
        message_length = len(message)
        urgency_count = sum(1 for w in ["urgent", "immediate", "suspended", "block", "arrest"] if w in message.lower())
        money_count = sum(1 for w in ["rs", "inr", "amount", "prize", "lottery", "cash"] if w in message.lower())
        
        data.append({
            "message": message,
            "phone_prefix": phone_prefix,
            "is_voip": is_voip,
            "upi_domain": upi_domain,
            "message_length": message_length,
            "urgency_word_count": urgency_count,
            "money_word_count": money_count,
            "label": label
        })
        
    return pd.DataFrame(data)

df = generate_synthetic_data(10000)
X = df.drop("label", axis=1)
y = df["label"]

logger.info(f"Generated {len(df)} samples. Class distribution: {df['label'].value_counts().to_dict()}")

# --- 2. Pipeline Construction ---
logger.info("Constructing pipeline...")

# We need to process 'message' with TF-IDF, and the rest with StandardScaler
text_features = "message"
numeric_features = ["phone_prefix", "is_voip", "upi_domain", "message_length", "urgency_word_count", "money_word_count"]

preprocessor = ColumnTransformer(
    transformers=[
        ("text", TfidfVectorizer(max_features=500, stop_words="english"), text_features),
        ("num", StandardScaler(), numeric_features),
    ]
)

# XGBoost model
xgb_model = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    objective='multi:softprob',
    num_class=3,
    eval_metric='mlogloss',
    use_label_encoder=False,
    random_state=42
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", xgb_model)
])

# --- 3. Training ---
logger.info("Training XGBoost Fraud Classifier...")
pipeline.fit(X, y)

# Accuracy check
train_acc = pipeline.score(X, y)
logger.info(f"Training Accuracy: {train_acc:.4f}")

# --- 4. Saving Model ---
logger.info(f"Saving model to {MODEL_PATH}")
joblib.dump(pipeline, MODEL_PATH)

logger.info("Training complete! Model is ready for inference.")
