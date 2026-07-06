import pandas as pd
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

def train_model():
    data_path = 'app/ml/data/scam_dataset.csv'
    model_dir = 'app/ml/models'
    model_path = os.path.join(model_dir, 'nlp_scam_detector.pkl')
    
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    print("Loading dataset...")
    df = pd.read_csv(data_path)
    
    X = df['text']
    y = df['label']
    
    # Split for evaluation
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Building NLP Pipeline (TF-IDF + Logistic Regression)...")
    # Using bigrams and trigrams to capture phrases like "digital arrest" and "share otp"
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 3), max_features=5000, stop_words='english')),
        ('clf', LogisticRegression(class_weight='balanced', max_iter=1000))
    ])
    
    print("Training model...")
    pipeline.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = pipeline.predict(X_test)
    print(classification_report(y_test, y_pred))
    
    os.makedirs(model_dir, exist_ok=True)
    print(f"Saving model to {model_path}...")
    joblib.dump(pipeline, model_path)
    print("Done! The new model is ready to use.")

if __name__ == "__main__":
    train_model()
