import os
import random
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
from loguru import logger

# Ensure model directory exists
MODEL_DIR = Path(os.getenv("ML_MODELS_DIR", "app/ml/models"))
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / "fraud_classifier.pkl"

# --- 1. Synthetic Data Generation ---
logger.info("Generating improved synthetic training data...")

# Realistic scam message templates (Indian context)
SCAM_TEMPLATES = [
    "This is CBI calling. Your Aadhaar is linked to money laundering. Pay {amount} immediately or face digital arrest.",
    "I am from bank. Send me your OTP and PIN to verify your account.",
    "Your account has been suspended. Share your OTP to reactivate it.",
    "Congratulations! You won a lottery of Rs {amount}. Pay processing fee of Rs 2000 via UPI.",
    "I am calling from customs. A parcel with drugs was found in your name. Pay fine of Rs {amount}.",
    "Your KYC has expired. Click this link to update or your account will be blocked in 24 hours.",
    "This is ED calling. Your bank account is frozen under PMLA. Transfer Rs {amount} to safe account.",
    "Im from bank. Send you otp and pin for verification purpose.",
    "We are from income tax department. Pay penalty of Rs {amount} or face arrest.",
    "Your SIM will be deactivated in 2 hours. Press 1 to speak to customer care.",
    "Dear customer your credit card ending 4567 is blocked. Click here to verify.",
    "Send your ATM pin and CVV to unlock your frozen account.",
    "I accidentally sent Rs 5000 to you. Please return via UPI. Sending collect request.",
    "Your son has been arrested. Transfer Rs {amount} for bail immediately.",
    "Police here. There is a case against you. Pay settlement amount now.",
    "Share your password and OTP. We need to update your bank security.",
    "Urgent: Your account shows suspicious activity. Share OTP to secure it.",
    "You have a pending tax refund of Rs 15000. Share your bank details and OTP.",
    "I am from RBI. Your PAN card is being misused. Verify by sharing Aadhaar and OTP.",
    "Free iPhone 15 Pro! Just pay Rs 999 shipping. Send OTP to confirm.",
    "Your UPI ID is compromised. Share your PIN to reset it safely.",
    "This is Supreme Court calling. Digital arrest warrant issued against you.",
    "Fake CBI officer calling about money laundering case. Pay to settle.",
    "Your WhatsApp will be blocked. Verify by sending 6 digit code.",
    "Loan approved for Rs 5 lakh! Pay insurance premium of Rs 4500 first.",
    "Im calling from bank. Give me your otp I will update your kyc.",
    "Send otp and pin number to complete your account verification process.",
    "Give me your card number, cvv and otp for refund processing.",
    "Your account will be blocked. Share pin and otp immediately.",
    "Transfer money to this account for digital arrest settlement.",
]

SUSPICIOUS_TEMPLATES = [
    "Your bank account needs KYC update. Call this number urgently.",
    "You may have won a prize. Reply with your details to claim.",
    "Important notice about your account. Call back immediately.",
    "Package delivery failed. Click link to reschedule.",
    "Your loan application status: Call this number for details.",
    "Verify your identity. We noticed unusual login attempt.",
    "Your subscription is expiring. Act now to avoid service disruption.",
    "Security alert: Someone tried to access your account.",
    "Complete your pending verification to avoid account suspension.",
    "Your payment of Rs {amount} is pending. Confirm or cancel.",
]

SAFE_TEMPLATES = [
    "Hi, can we meet for dinner at 8pm today?",
    "Your Flipkart order has been shipped. Delivery by tomorrow.",
    "Meeting scheduled for 3pm in conference room B.",
    "Your salary of Rs {amount} has been credited to your account.",
    "Reminder: Your appointment is confirmed for tomorrow at 10am.",
    "Amazon order delivered successfully. Rate your experience.",
    "Your electricity bill of Rs 1200 is due on 25th.",
    "IRCTC: Your train ticket PNR 4521234567 is confirmed.",
    "Happy birthday! Wishing you a wonderful year ahead.",
    "Please review the project report and share your feedback.",
    "Your Swiggy order is being prepared. ETA 30 minutes.",
    "Monthly statement for your HDFC credit card is ready.",
    "Your OTP is 847293. Do not share this with anyone. - SBI",
    "Rs 500 debited from your account. Available balance Rs 15000.",
    "Flight booking confirmed. Departure at 6:30 AM tomorrow.",
    "Your mutual fund SIP of Rs 5000 has been processed.",
    "Team lunch at 1pm. Please confirm attendance.",
    "Your Zomato order has been picked up by delivery partner.",
    "Bank will never ask for your PIN, OTP or password. Stay safe.",
    "Your fixed deposit of Rs {amount} has matured. Visit branch.",
]


def generate_improved_data(n_samples=15000):
    data = []
    
    # Distribution: 40% safe, 25% suspicious, 35% scam
    labels = random.choices([0, 1, 2], weights=[0.40, 0.25, 0.35], k=n_samples)
    
    for label in labels:
        amount = random.choice([5000, 10000, 25000, 50000, 100000, 250000])
        
        if label == 2:  # SCAM
            message = random.choice(SCAM_TEMPLATES).format(amount=amount)
            # Add some noise/typos to make it realistic
            if random.random() < 0.3:
                message = message.lower()
            if random.random() < 0.2:
                # Add random typos
                message = message.replace("your", "ur").replace("please", "pls")
            
            # Scams often use VoIP, but also regular mobile numbers
            if random.random() < 0.4:
                phone_prefix = random.choice([140, 144, 800])
                is_voip = 1
            else:
                phone_prefix = random.randint(600, 999)
                is_voip = 0
            upi_domain = random.randint(0, 5)
            
        elif label == 1:  # SUSPICIOUS
            message = random.choice(SUSPICIOUS_TEMPLATES).format(amount=amount)
            if random.random() < 0.3:
                message = message.lower()
            
            if random.random() < 0.2:
                phone_prefix = random.choice([140, 144, 800])
                is_voip = 1
            else:
                phone_prefix = random.randint(600, 999)
                is_voip = 0
            upi_domain = random.randint(0, 5)
            
        else:  # SAFE
            message = random.choice(SAFE_TEMPLATES).format(amount=amount)
            if random.random() < 0.2:
                message = message.lower()
            phone_prefix = random.randint(600, 999)
            is_voip = 0
            upi_domain = random.randint(0, 3)
        
        # Feature extraction (mirrors inference-time extraction)
        msg_lower = message.lower()
        message_length = len(message)
        urgency_count = sum(1 for w in ["urgent", "immediate", "suspended", "block", "arrest", "freeze", "blocked", "deactivated"] if w in msg_lower)
        money_count = sum(1 for w in ["rs", "inr", "amount", "prize", "lottery", "cash", "lakh", "crore"] if w in msg_lower)
        
        import re
        soc_eng_patterns = [
            r"(send|share|give|tell).*?(otp|pin|password|cvv)",
            r"(from|calling).*?(bank|rbi|police|cbi|customs)",
            r"(account|card).*?(blocked|suspended|frozen)"
        ]
        social_eng_count = sum(len(re.findall(p, msg_lower)) for p in soc_eng_patterns)
        
        data.append({
            "message": message,
            "phone_prefix": phone_prefix,
            "is_voip": is_voip,
            "upi_domain": upi_domain,
            "message_length": message_length,
            "urgency_word_count": urgency_count,
            "money_word_count": money_count,
            "social_eng_count": social_eng_count,
            "label": label
        })
        
    return pd.DataFrame(data)

df = generate_improved_data(15000)
X = df.drop("label", axis=1)
y = df["label"]

logger.info(f"Generated {len(df)} samples. Class distribution: {df['label'].value_counts().to_dict()}")

# --- 2. Pipeline Construction ---
logger.info("Constructing improved pipeline...")

text_features = "message"
numeric_features = ["phone_prefix", "is_voip", "upi_domain", "message_length", "urgency_word_count", "money_word_count", "social_eng_count"]

preprocessor = ColumnTransformer(
    transformers=[
        ("text", TfidfVectorizer(max_features=2000, stop_words="english", ngram_range=(1, 3)), text_features),
        ("num", StandardScaler(), numeric_features),
    ]
)

# XGBoost model with better hyperparameters
xgb_model = xgb.XGBClassifier(
    n_estimators=300,
    max_depth=8,
    learning_rate=0.08,
    objective='multi:softprob',
    num_class=3,
    eval_metric='mlogloss',
    use_label_encoder=False,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=3,
    random_state=42
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", xgb_model)
])

# --- 3. Training ---
logger.info("Training improved XGBoost Fraud Classifier...")
X_processed = preprocessor.fit_transform(X)
xgb_model.fit(X_processed, y)

# --- 4. Save model immediately ---
logger.info(f"Saving improved model to {MODEL_PATH}")
# Save preprocessor and model separately to avoid sklearn/xgboost Pipeline compatibility bugs
model_data = {
    "preprocessor": preprocessor,
    "classifier": xgb_model
}
joblib.dump(model_data, MODEL_PATH)
logger.info("Model saved successfully! Restart the backend server to load the new model.")
