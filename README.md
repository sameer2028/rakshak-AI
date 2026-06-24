# Rakshak AI - Digital Public Safety Intelligence Platform

Rakshak AI is an advanced, AI-powered command center and digital intelligence grid built for law enforcement and citizen protection. It leverages multiple Machine Learning paradigms to detect cyber fraud, visualize crime hotspots, dismantle criminal networks, and catch counterfeit currency.

![Command Center Concept](https://via.placeholder.com/1200x600.png?text=Rakshak+AI+Command+Center)

## Core Capabilities (Intelligence Modules)

1. **Citizen Fraud Shield**: Analyzes incoming citizen complaints using a TF-IDF + Logistic Regression NLP Engine to detect sophisticated cyber scams (e.g., Digital Arrest, Fake CBI, Custom Fraud).
2. **Scam Detection Engine**: An XGBoost classifier that computes risk scores for suspicious entities (phone numbers, UPI IDs) based on transactional and behavioral features.
3. **Fraud Network Intelligence**: Uses NetworkX graph algorithms (Louvain community detection, PageRank, Betweenness Centrality) to expose deep criminal syndicates, identify ring leaders, and trace money mules.
4. **Geospatial Crime Engine**: A real-time heatmap powered by MongoDB aggregation pipelines and Leaflet to identify crime hotspots at a district level.
5. **Vision AI (Counterfeit Detection)**: An OpenCV + PyTorch ResNet50 hybrid system that verifies currency notes by analyzing watermarks, security threads, and micro-text to flag counterfeits.

## Technology Stack

### Backend
* **FastAPI**: Asynchronous Python web framework for blazing fast REST APIs.
* **MongoDB + Beanie**: NoSQL database for flexible, schema-less document storage with async Pydantic-based ODM.
* **Scikit-Learn & XGBoost**: Classical ML pipelines for scam detection and risk scoring.
* **NetworkX**: Complex network and graph theory analysis.
* **OpenCV & PyTorch**: Computer vision processing and deep learning simulations.

### Frontend
* **React + Vite**: High-performance single-page application.
* **Vanilla CSS (Glassmorphism & Neon UI)**: Premium, dark-mode-first styling tailored for a high-tech "Intelligence Grid" aesthetic.
* **Recharts & Leaflet**: Data visualization and interactive maps.

## Getting Started

### Prerequisites
* Python 3.11+
* Node.js 18+
* MongoDB Atlas (or a local MongoDB instance running on port 27017)

### 1. Database Setup
Ensure you have created a MongoDB cluster and copied your connection string. Add this string to your `backend/.env` file:
```env
MONGODB_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows
pip install -r requirements.txt

# Seed the database with synthetic data (Users, Scams, Networks, Heatmaps)
python -m scripts.seed_db

# Start the Intelligence Grid server
uvicorn app.main:app --reload --port 8000
```
*API Documentation will be available at: http://localhost:8000/docs*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The command center will be available at: http://localhost:5173*

## Test Credentials
If you seeded the database using the provided script, you can log into the frontend using:
* **Admin**: `admin@rakshak.ai` / `hashed_password`
* **Analyst**: `analyst@rakshak.ai` / `hashed_password`
* **Citizen**: `citizen@example.com` / `hashed_password`

---

*Designed and engineered to protect citizens from the rapidly evolving landscape of digital crime.*
