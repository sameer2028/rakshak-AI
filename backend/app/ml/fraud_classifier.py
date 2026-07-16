"""
Rakshak AI - ML Fraud Classifier

XGBoost-based fraud classifier for transaction and message analysis.
"""

import os
import joblib
import pandas as pd
from loguru import logger


class FraudClassifier:
    """XGBoost fraud classification model."""

    def __init__(self):
        self.model = None
        self.model_version = "v1.0-xgboost"

    def load_model(self, model_path: str = None) -> None:
        """Load a trained XGBoost model from disk."""
        if not model_path:
            model_dir = os.getenv("ML_MODELS_DIR", "app/ml/models")
            model_path = os.path.join(model_dir, "fraud_classifier.pkl")

        try:
            self.model = joblib.load(model_path)
            logger.info(f"FraudClassifier: Model loaded from {model_path}")
        except Exception as e:
            logger.error(f"Failed to load FraudClassifier model from {model_path}: {e}")
            self.model = None

    def _extract_features(self, features: dict) -> pd.DataFrame:
        """Extract and format features for the model."""
        message = features.get("message") or ""
        message_length = len(message)
        
        msg_lower = message.lower()
        urgency_count = sum(1 for w in ["urgent", "immediate", "suspended", "block", "arrest"] if w in msg_lower)
        money_count = sum(1 for w in ["rs", "inr", "amount", "prize", "lottery", "cash"] if w in msg_lower)
        
        # Phone features
        phone = features.get("phone_number") or ""
        phone = phone.replace(" ", "").replace("-", "")
        phone_prefix = 0
        is_voip = 0
        if phone.startswith("+91"):
            phone = phone[3:]
        if len(phone) >= 3:
            try:
                phone_prefix = int(phone[:3].strip())
            except ValueError:
                phone_prefix = 0
                
        # If no phone number is provided, default to a safe prefix (600-999) 
        # so the model relies on text features instead of anomalyizing a 0.
        if phone_prefix == 0:
            phone_prefix = 999
        
        if phone_prefix in [140, 144, 800]:
            is_voip = 1
            
        # UPI features
        upi = features.get("upi_id") or ""
        upi_domain = 0 # Default safe domain for simplicity
        
        # Construct DataFrame in exactly the format expected by the pipeline
        data = {
            "message": [message],
            "phone_prefix": [phone_prefix],
            "is_voip": [is_voip],
            "upi_domain": [upi_domain],
            "message_length": [message_length],
            "urgency_word_count": [urgency_count],
            "money_word_count": [money_count]
        }
        return pd.DataFrame(data)

    def predict(self, features: dict) -> dict:
        """Predict fraud probability for given features.

        Args:
            features: Dict containing message, phone_number, upi_id

        Returns:
            Dict with prediction, probability, and risk_score
        """
        if not self.model:
            logger.warning("FraudClassifier model not loaded. Using fallback rules.")
            return self._fallback_predict(features)
            
        try:
            df = self._extract_features(features)
            # Pipeline predict_proba returns probabilities for [SAFE, SUSPICIOUS, SCAM]
            probs = self.model.predict_proba(df)[0]
            
            safe_prob = float(probs[0])
            susp_prob = float(probs[1])
            scam_prob = float(probs[2])
            
            if scam_prob > 0.5:
                verdict = "SCAM"
                confidence = scam_prob
                risk_score = min(int(scam_prob * 100) + 10, 100)
            elif susp_prob > 0.4:
                verdict = "SUSPICIOUS"
                confidence = susp_prob
                risk_score = int(susp_prob * 100)
            else:
                verdict = "SAFE"
                confidence = safe_prob
                risk_score = int((1 - safe_prob) * 100)
                
            return {
                "prediction": verdict,
                "probability": confidence,
                "risk_score": risk_score,
                "model_version": self.model_version,
            }
        except Exception as e:
            logger.error(f"Error during ML prediction: {e}")
            return self._fallback_predict(features)

    def _fallback_predict(self, features: dict) -> dict:
        """Basic rules if ML fails."""
        risk_score = 10
        if features.get("message") and "urgent" in features["message"].lower():
            risk_score += 40
        
        verdict = "SAFE"
        if risk_score > 40:
            verdict = "SUSPICIOUS"
            
        return {
            "prediction": verdict,
            "probability": 0.6,
            "risk_score": risk_score,
            "model_version": "v0.1-rules",
        }

# Global instance
fraud_classifier = FraudClassifier()

