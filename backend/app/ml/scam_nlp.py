"""
Rakshak AI - Scam NLP Engine

TF-IDF + Logistic Regression for scam message classification.
"""

import os
import joblib
from loguru import logger

class ScamNLPEngine:
    """NLP engine for scam text classification."""

    def __init__(self):
        self.model = None
        self.model_version = "v1.0-tfidf-logreg"

    def load_model(self, model_path: str = None) -> None:
        """Load trained NLP model (TF-IDF + LogReg pipeline)."""
        if not model_path:
            model_dir = os.getenv("ML_MODELS_DIR", "app/ml/models")
            model_path = os.path.join(model_dir, "nlp_scam_detector.pkl")
            
        try:
            self.model = joblib.load(model_path)
            logger.info(f"ScamNLPEngine: Model loaded from {model_path}")
        except Exception as e:
            logger.error(f"Failed to load ScamNLPEngine model from {model_path}: {e}")
            self.model = None

    def classify(self, text: str) -> dict:
        """Classify text as scam/safe with scam type.

        Args:
            text: Message or transcript text

        Returns:
            Dict with is_scam, scam_type, probability, risk_score
        """
        if not self.model:
            logger.warning("ScamNLPEngine model not loaded. Using fallback rules.")
            return self._fallback_classify(text)
            
        try:
            # Predict probabilities and class
            probs = self.model.predict_proba([text])[0]
            classes = self.model.classes_
            
            # Find the max probability class
            max_idx = probs.argmax()
            predicted_class = classes[max_idx]
            confidence = float(probs[max_idx])
            
            # 'safe' means is_scam = False
            is_scam = (predicted_class != "safe")
            
            # Map predictions to score
            if is_scam:
                risk_score = min(int(confidence * 100) + 10, 100)
            else:
                risk_score = int((1 - confidence) * 100)
                
            return {
                "is_scam": is_scam,
                "scam_type": predicted_class if is_scam else None,
                "probability": confidence,
                "risk_score": risk_score,
                "model_version": self.model_version,
            }
        except Exception as e:
            logger.error(f"Error during NLP classification: {e}")
            return self._fallback_classify(text)

    def _fallback_classify(self, text: str) -> dict:
        """Rule-based fallback."""
        text_lower = text.lower()
        if "arrest" in text_lower or "customs" in text_lower:
            return {"is_scam": True, "scam_type": "digital_arrest", "probability": 0.8, "risk_score": 85}
        if "cbi" in text_lower or "ed " in text_lower:
            return {"is_scam": True, "scam_type": "fake_cbi", "probability": 0.8, "risk_score": 80}
        if "lottery" in text_lower or "prize" in text_lower:
            return {"is_scam": True, "scam_type": "phishing", "probability": 0.7, "risk_score": 75}
            
        return {"is_scam": False, "scam_type": None, "probability": 0.9, "risk_score": 5}

    def extract_entities(self, text: str) -> dict:
        """Extract entities (phone, UPI, account) from text."""
        import re
        
        # Phone numbers: +91 followed by 10 digits, or 10 digits starting with 6-9
        phone_pattern = r'(?:\+91[\-\s]?)?[6789]\d{9}'
        phones = list(set(re.findall(phone_pattern, text)))
        
        # UPI IDs: string followed by @ and a bank handle
        upi_pattern = r'[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,64}'
        upis = list(set(re.findall(upi_pattern, text)))
        
        # Amounts: ₹10,000, Rs 5 lakh, etc.
        amount_pattern = r'(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d+)?\s*(?:lakh|crore|k|L)?'
        amounts = list(set(re.findall(amount_pattern, text, re.IGNORECASE)))
        
        # Bank accounts: 9 to 18 digits
        account_pattern = r'\b\d{9,18}\b'
        accounts_raw = re.findall(account_pattern, text)
        accounts = list(set([a for a in accounts_raw if a not in phones and not (len(a) == 10 and a.startswith(('6','7','8','9')))]))
        
        return {
            "phone_numbers": phones,
            "upi_ids": upis,
            "bank_accounts": accounts,
            "amounts": amounts,
        }

# Global instance
nlp_engine = ScamNLPEngine()
