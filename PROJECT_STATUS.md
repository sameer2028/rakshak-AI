# RAKSHAK AI INTELLIGENCE GRID — PROJECT STATUS

## Last Updated: 2026-06-23

## Quick Summary

**Project**: Rakshak AI Intelligence Grid
**What**: AI-Powered Digital Public Safety Intelligence Platform
**Goal**: Shift law enforcement from Reactive Investigation → Predictive Threat Neutralization
**Current State**: Phases 1 through 9 are largely COMPLETE ✅. Phase 10 (Seed Data + Polish) is NEXT.
**Frontend Language**: JavaScript (NOT TypeScript)

---

# TECH STACK

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript, Tailwind CSS, Shadcn UI, React Flow, Leaflet, Recharts |
| Backend | FastAPI, Pydantic, Uvicorn, Python |
| Database | MongoDB (Motor async driver + Beanie ODM) |
| ML | Scikit-learn, XGBoost, Transformers, NetworkX, PyTorch, OpenCV |
| Auth | JWT (python-jose) + bcrypt (passlib) |

---

# CODING RULES (MUST FOLLOW)

1. **JavaScript** on frontend (no TypeScript).
2. **Feature-based folder structure** on frontend.
3. **Reusable components** — never duplicate UI logic.
4. **Backend architecture**: routes → services → repositories → models
5. **Routes are thin** — zero business logic in routes, only call services.
6. **Repository pattern** for data access.
7. **Dependency injection** via FastAPI `Depends()`.
8. **Pydantic schemas** for all request/response contracts.
9. **Role-based access control**: citizen, police, bank, telecom, admin.

---

# MODULES (6 TOTAL)

| # | Module | Description | Backend Endpoint Prefix |
|---|---|---|---|
| 1 | Citizen Fraud Shield | Citizens report SMS/WhatsApp/Phone/UPI/Email for analysis | `/api/citizen/` |
| 2 | Digital Arrest Scam Detection | Detect fake CBI/ED/Customs/Digital Arrest scams from transcripts | `/api/scam/` |
| 3 | Fraud Network Intelligence | Graph-based fraud ring detection (Louvain, PageRank, Centrality) | `/api/network/` |
| 4 | Crime Heatmap | Geospatial crime density visualization on India map | `/api/heatmap/` |
| 5 | Counterfeit Currency Detection | Image-based fake currency detection (watermark, thread, micro text) | `/api/currency/` |
| 6 | Police Command Center | Live dashboard with alerts, fraud rings, hotspots, complaints | `/api/dashboard/` |

---

# PHASE 1 — COMPLETED ✅

## What Was Built

### Backend Folder Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                          # FastAPI entry point (lifespan, CORS, middleware, routers)
│   │
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py                  # Pydantic-settings (env vars: MONGODB_URL, JWT_SECRET, etc.)
│   │   └── database.py                  # Motor async client + Beanie ODM init (9 document models)
│   │
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── security.py                  # hash_password, verify_password, create/decode JWT
│   │   ├── dependencies.py              # get_current_user (JWT), require_roles (RBAC)
│   │   ├── request_logging.py           # RequestLoggingMiddleware (timing + logging)
│   │   └── exceptions.py               # NotFoundException, DuplicateException, etc.
│   │
│   ├── models/                          # Beanie Document models (MongoDB collections)
│   │   ├── __init__.py
│   │   ├── user.py                      # users collection (name, email, password, role)
│   │   ├── complaint.py                 # complaints collection (fraud reports + AI results)
│   │   ├── transaction.py               # transactions collection (financial + risk scoring)
│   │   ├── fraud_node.py                # fraud_nodes collection (graph nodes + metrics)
│   │   ├── fraud_edge.py                # fraud_edges collection (graph edges)
│   │   ├── device.py                    # devices collection (device tracking)
│   │   ├── currency_check.py            # currency_checks collection (counterfeit results)
│   │   ├── crime_hotspot.py             # crime_hotspots collection (geospatial density)
│   │   └── alert.py                     # alerts collection (command center live alerts)
│   │
│   ├── schemas/                         # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── auth.py                      # RegisterRequest, LoginRequest, TokenResponse, UserResponse
│   │   ├── citizen_shield.py            # FraudCheckRequest, FraudCheckResponse, FraudHistoryResponse
│   │   ├── scam_detection.py            # ScamAnalyzeRequest, ScamAnalyzeResponse, ThreatIndicator
│   │   ├── fraud_network.py             # GraphResponse, GraphNode, GraphEdge, CommunityResponse
│   │   ├── crime_heatmap.py             # HeatmapResponse, HeatmapPoint, DistrictRiskResponse
│   │   ├── counterfeit.py               # CounterfeitDetectResponse, SecurityFeatureResult
│   │   └── dashboard.py                 # DashboardOverview, AlertsResponse, HighRiskAccountsResponse
│   │
│   ├── routes/                          # API route definitions (THIN — delegates to services)
│   │   ├── __init__.py                  # api_router (aggregates all module routers under /api)
│   │   ├── auth.py                      # POST /register, POST /login, GET /me
│   │   ├── citizen_shield.py            # POST /check, GET /history, GET /report/{id}
│   │   ├── scam_detection.py            # POST /analyze, GET /detections, PATCH /detections/{id}
│   │   ├── fraud_network.py             # GET /graph, GET /node/{id}, POST /search, POST /analyze, GET /communities
│   │   ├── crime_heatmap.py             # GET /points, GET /stats, GET /districts
│   │   ├── counterfeit.py               # POST /check, GET /history, GET /record/{id}
│   │   └── dashboard.py                # GET /overview, GET /alerts, GET /high-risk, GET /complaints, PATCH /alerts/{id}/resolve
│   │
│   ├── services/                        # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py              # COMPLETE: Registration + JWT login
│   │   ├── citizen_shield_service.py    # COMPLETE: Fraud analysis (placeholder ML, keyword matching)
│   │   ├── scam_detection_service.py    # COMPLETE: Scam transcript analysis (placeholder NLP)
│   │   ├── fraud_network_service.py     # COMPLETE: Graph queries + algorithm stubs
│   │   ├── crime_heatmap_service.py     # COMPLETE: Geospatial data aggregation
│   │   ├── counterfeit_service.py       # COMPLETE: Image upload + placeholder detection
│   │   └── dashboard_service.py         # COMPLETE: Cross-module aggregation
│   │
│   ├── ml/                              # ML model stubs (to be replaced with trained models)
│   │   ├── __init__.py
│   │   ├── fraud_classifier.py          # XGBoost stub → Phase 4
│   │   ├── scam_nlp.py                  # TF-IDF + LogReg stub → Phase 5
│   │   ├── graph_analyzer.py            # NetworkX stub → Phase 6
│   │   ├── counterfeit_detector.py      # OpenCV + ResNet50 stub → Phase 8
│   │   └── models/                      # Serialized .pkl/.pt files go here
│   │       └── .gitkeep
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── scoring.py                   # compute_risk_score(), classify_risk_level()
│   │   ├── text.py                      # extract_phone_numbers(), extract_upi_ids(), etc.
│   │   └── geo.py                       # make_geojson_point(), INDIAN_CITIES dict (20 cities)
│   │
│   └── seeds/
│       └── __init__.py                  # Placeholder → Phase 10
│
├── requirements.txt                     # All Python dependencies
├── .env                                 # Local environment config
├── .env.example                         # Template for .env
└── README.md                            # Setup + run instructions
```

### API Endpoints Summary (22 total)

```
# Auth
POST   /api/auth/register              # Public
POST   /api/auth/login                  # Public → returns JWT
GET    /api/auth/me                     # JWT required

# Module 1: Citizen Fraud Shield
POST   /api/citizen/check               # All roles
GET    /api/citizen/history              # All roles (own reports)
GET    /api/citizen/report/{id}          # All roles

# Module 2: Digital Arrest Scam Detection
POST   /api/scam/analyze                # police, admin, citizen
GET    /api/scam/detections             # police, admin
PATCH  /api/scam/detections/{id}        # police, admin

# Module 3: Fraud Network Intelligence
GET    /api/network/graph               # police, bank, admin
GET    /api/network/node/{node_id}      # police, bank, admin
POST   /api/network/search              # police, bank, admin
POST   /api/network/analyze             # police, admin
GET    /api/network/communities         # police, admin

# Module 4: Crime Heatmap
GET    /api/heatmap/points              # All roles
GET    /api/heatmap/stats               # police, admin
GET    /api/heatmap/districts           # police, admin

# Module 5: Counterfeit Detection
POST   /api/currency/check              # police, bank, admin (multipart/form-data)
GET    /api/currency/history             # police, bank, admin
GET    /api/currency/record/{id}        # police, bank, admin

# Module 6: Police Command Center
GET    /api/dashboard/overview          # police, admin
GET    /api/dashboard/alerts            # police, admin
GET    /api/dashboard/high-risk         # police, admin
GET    /api/dashboard/complaints        # police, admin
PATCH  /api/dashboard/alerts/{id}/resolve  # police, admin
```

### MongoDB Collections (9 total)

| Collection | Key Fields | Indexes |
|---|---|---|
| `users` | name, email, password, role, phone, is_active | email (unique), role |
| `complaints` | victim, phone, upi, message, verdict, risk_score, scam_type, location | phone, upi, verdict, scam_type, location (2dsphere) |
| `transactions` | transaction_id, account, upi, amount, risk_score, risk_level | transaction_id (unique), account, upi, risk_level |
| `fraud_nodes` | node_id, node_type, label, community, pagerank, centrality, is_money_mule, is_ring_leader | node_id (unique), node_type, community, is_flagged |
| `fraud_edges` | source_node_id, target_node_id, edge_type, weight | source, target, edge_type, compound(source,target) |
| `devices` | device_id, phone_numbers, accounts, risk_score | device_id (unique), is_flagged |
| `currency_checks` | image_path, prediction, confidence, watermark, security_thread, serial_number | prediction, serial_number, created_at |
| `crime_hotspots` | district, state, coordinates, fraud_count, risk_level, risk_score | state, district, risk_level, coordinates (2dsphere) |
| `alerts` | alert_type, severity, title, description, source_module, is_read, is_resolved | alert_type, severity, is_read, is_resolved, created_at |

### ML Models Integration Status

Services use real ML models or advanced implementations:

| Service | Logic Status | Future Advanced Models |
|---|---|---|
| `citizen_shield_service.py` | Integrated with XGBoost `fraud_classifier.py` | Deep Learning |
| `scam_detection_service.py` | Integrated with `scam_nlp.py` | IndicBERT |
| `fraud_network_service.py` | Integrated with `graph_analyzer.py` (NetworkX) | GraphSAGE |
| `counterfeit_service.py` | Integrated with `counterfeit_detector.py` | YOLO / ViT |

### How to Run Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Requires MongoDB running on `localhost:27017`. API docs at `http://localhost:8000/docs`.

---

# PHASE 2 — FRONTEND SCAFFOLD — COMPLETED ✅

## Goal
Set up the complete React/TypeScript frontend with routing, auth, and app shell.

## Tasks

### 1. Initialize Vite + React + JavaScript
```bash
cd frontend
npx -y create-vite@latest ./ --template react
npm install
```

### 2. Install Dependencies
```bash
# UI Framework
npx shadcn@latest init

# Core dependencies
npm install react-router-dom axios zustand
npm install @tanstack/react-query

# Visualization
npm install reactflow recharts
npm install react-leaflet leaflet
npm install @types/leaflet

# Utilities
npm install lucide-react clsx tailwind-merge
npm install date-fns
```

### 3. Configure Tailwind CSS
- Dark theme as default
- Custom color palette: deep navy, electric blue, cyan accents, amber alerts
- Custom fonts: Inter (UI), JetBrains Mono (data/code)
- Add CSS variables for the design tokens

### 4. Create Folder Structure
```
frontend/src/
├── main.tsx
├── App.tsx
├── index.css
├── api/                     # Axios client + module API files
│   ├── client.js            # Base axios instance with JWT interceptor
│   ├── auth.api.js
│   ├── citizen-shield.api.js
│   ├── scam-detection.api.js
│   ├── fraud-network.api.js
│   ├── crime-heatmap.api.js
│   ├── counterfeit.api.js
│   └── dashboard.api.js
├── hooks/                   # Custom React hooks per module
├── store/                   # Zustand stores (auth, app state)
│   ├── authStore.js
│   └── appStore.js
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── layout/
│   │   ├── Sidebar.jsx      # Navigation sidebar with module links
│   │   ├── Header.jsx       # Top bar with user info
│   │   ├── AppShell.jsx     # Sidebar + Header + Outlet wrapper
│   │   └── ProtectedRoute.jsx
│   ├── common/
│   │   ├── RiskMeter.jsx    # Circular gauge (0-100)
│   │   ├── VerdictBadge.jsx # SCAM/SAFE/SUSPICIOUS badge
│   │   ├── StatCard.jsx     # Animated counter card
│   │   ├── AlertBanner.jsx  # Threat alert notification
│   │   └── DataTable.jsx    # Reusable sortable table
│   └── charts/
│       ├── RiskChart.jsx
│       ├── TrendChart.jsx
│       └── DistributionChart.jsx
├── features/                # Feature-based pages
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── citizen-shield/
│   │   ├── CitizenShieldPage.jsx
│   │   ├── FraudCheckForm.jsx
│   │   └── AnalysisResult.jsx
│   ├── scam-detection/
│   │   ├── ScamDetectionPage.jsx
│   │   ├── TranscriptInput.jsx
│   │   └── ScamResult.jsx
│   ├── fraud-network/
│   │   ├── FraudNetworkPage.jsx
│   │   ├── NetworkGraph.jsx       # React Flow
│   │   ├── NodeDetail.jsx
│   │   └── GraphControls.jsx
│   ├── crime-heatmap/
│   │   ├── CrimeHeatmapPage.jsx
│   │   ├── HeatmapView.jsx        # React-Leaflet
│   │   ├── HeatmapFilters.jsx
│   │   └── DistrictRiskPanel.jsx
│   ├── counterfeit/
│   │   ├── CounterfeitPage.jsx
│   │   ├── ImageUpload.jsx
│   │   └── DetectionResult.jsx
│   └── dashboard/
│       ├── DashboardPage.jsx
│       ├── LiveAlertsFeed.jsx
│       ├── FraudRingSummary.jsx
│       ├── MiniHeatmap.jsx
│       ├── HighRiskAccounts.jsx
│       └── RecentComplaints.jsx
├── lib/
│   └── utils.js             # cn() helper
└── constants/
    ├── routes.js
    └── config.js            # API_BASE_URL
```

### 5. Build Core Components
- **AppShell**: Sidebar (collapsible) + Header + main content area
- **Sidebar**: Links to all 6 modules + logo + user role indicator
- **ProtectedRoute**: Redirect to login if no JWT token
- **Login/Register**: Forms with validation, role selection
- **Zustand auth store**: Token storage, user state, login/logout

### 6. Set Up Routing
```typescript
// Route structure
/login
/register
/dashboard                    # Police Command Center (default for police/admin)
/citizen-shield               # Citizen Fraud Shield (default for citizens)
/scam-detection               # Digital Arrest Scam Detection
/fraud-network                # Fraud Network Intelligence
/crime-heatmap                # Crime Heatmap
/counterfeit                  # Counterfeit Detection
/profile                     # User profile
/alerts                      # Alerts page
```

### 7. API Client Setup
```javascript
// client.js — Axios instance
const api = axios.create({ baseURL: 'http://localhost:8000/api' });
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Design Theme
- **Dark cybersecurity aesthetic**: bg-slate-950, borders in slate-800
- **Primary accent**: Electric blue (#3B82F6 → #60A5FA)
- **Danger**: Red (#EF4444) for SCAM verdicts
- **Warning**: Amber (#F59E0B) for SUSPICIOUS
- **Success**: Emerald (#10B981) for SAFE
- **Glassmorphism cards**: bg-slate-900/50 backdrop-blur-xl border border-slate-700/50
- **Glow effects**: shadow-[0_0_15px_rgba(59,130,246,0.3)]
- **Font**: Inter for UI, JetBrains Mono for data

---

# PHASE 3 — FRONTEND MODULE PAGES — COMPLETED ✅

## Goal
Build all 6 feature pages connecting to backend APIs.

### Module 1: Citizen Fraud Shield Page
- Form: message (textarea), phone number, UPI ID, email, source dropdown
- Submit → calls `POST /api/citizen/check`
- Result panel: RiskMeter gauge, VerdictBadge, reasons list, matched patterns
- History tab: table of past reports

### Module 2: Digital Arrest Scam Detection Page
- Large textarea for call transcript
- Phone metadata fields (caller, receiver, VoIP toggle)
- Submit → calls `POST /api/scam/analyze`
- Result: Scam type badge, threat indicator cards (color-coded by severity), recommended actions
- Animation: scanning effect while analyzing

### Module 3: Fraud Network Intelligence Page
- Full-width React Flow graph canvas
- Node types with different shapes/colors:
  - Victim: blue circle
  - Phone: gray diamond
  - UPI: purple hexagon
  - Bank Account: green rectangle
  - Device: orange triangle
  - Suspect: red circle
- Edge types with different line styles
- Side panel: click node → show details
- Controls: Run Louvain / PageRank / Centrality buttons
- Search bar: search by phone/UPI/account
- Community highlighting with different background colors

### Module 4: Crime Heatmap Page
- Full-width React-Leaflet map centered on India (lat: 20.5937, lng: 78.9629, zoom: 5)
- Heatmap layer for crime density
- Color-coded markers by crime type
- Filter panel: crime type, state, date range
- Side panel: district risk ranking table
- Click marker → complaint details popup

### Module 5: Counterfeit Detection Page
- Drag-and-drop image upload zone
- Image preview with scanning overlay animation
- Result panel:
  - GENUINE/COUNTERFEIT verdict badge
  - Confidence gauge
  - Security features checklist (watermark ✅, thread ❌, etc.)
  - Anomaly regions highlighted on image
- History tab: past detections

### Module 6: Police Command Center (Dashboard)
- Grid layout (3 columns on desktop)
- Panel 1: Overview stats (animated counters) — scams blocked, fraud rings, districts at risk, counterfeit detected
- Panel 2: Live Alerts Feed (auto-scrolling, color-coded by severity)
- Panel 3: Fraud Ring Summary (top 5 rings, member count)
- Panel 4: Mini Crime Heatmap (small Leaflet map)
- Panel 5: High Risk Accounts table
- Panel 6: Recent Complaints feed
- Recharts: trend lines for scams over last 7 days
- Auto-refresh every 10 seconds

---

# PHASE 4 — ML: FRAUD CLASSIFIER — COMPLETED ✅

## Goal
Train and integrate XGBoost fraud classifier into `citizen_shield_service.py`.

## Steps
1. Create training data (or use synthetic data) with features:
   - Message text features (TF-IDF)
   - Phone number features (prefix, length, VoIP likelihood)
   - UPI ID features (pattern analysis)
   - Transaction velocity features
2. Train XGBoost model
3. Save model with joblib to `app/ml/models/fraud_classifier.pkl`
4. Update `fraud_classifier.py` to load and predict
5. Replace placeholder in `citizen_shield_service.py`

## Model Architecture
```
Input Features:
  - text_tfidf (500 features from TF-IDF)
  - phone_prefix_code
  - is_voip
  - upi_domain_code
  - message_length
  - urgency_word_count
  - money_word_count

Model: XGBClassifier(
  n_estimators=200,
  max_depth=6,
  learning_rate=0.1,
  objective='multi:softprob'
)

Output: [SCAM, SAFE, SUSPICIOUS] + probability
```

---

# PHASE 5 — ML: SCAM NLP ENGINE — COMPLETED ✅

## Goal
Train TF-IDF + Logistic Regression scam classifier for transcript analysis.

## Steps
1. Create labeled dataset of scam transcripts (fake CBI, fake ED, fake customs, digital arrest)
2. Text preprocessing: normalize, tokenize, extract features
3. Train TF-IDF vectorizer + LogisticRegression pipeline
4. Save pipeline to `app/ml/models/scam_nlp_pipeline.pkl`
5. Update `scam_nlp.py` to load and classify
6. Replace placeholder in `scam_detection_service.py`
7. Add entity extraction (phone, UPI, account from transcript)

## Model Architecture
```
Pipeline:
  1. TfidfVectorizer(max_features=5000, ngram_range=(1,3))
  2. LogisticRegression(multi_class='multinomial', C=1.0)

Classes: [fake_cbi, fake_ed, fake_customs, digital_arrest, video_scam, safe]
```

## Advanced (Later)
- Fine-tune IndicBERT or mBERT for Hindi/English code-mixed text
- Support for Hinglish transcripts

---

# PHASE 6 — ML: GRAPH INTELLIGENCE — COMPLETED ✅

## Goal
Implement NetworkX graph algorithms in `graph_analyzer.py` and integrate into `fraud_network_service.py`.

## Steps
1. Implement `build_graph()` — load fraud_nodes and fraud_edges from MongoDB into nx.Graph
2. Implement `run_louvain()` — community detection using `community.best_partition()`
3. Implement `run_pagerank()` — `nx.pagerank()`
4. Implement `run_degree_centrality()` — `nx.degree_centrality()`
5. Implement `run_betweenness_centrality()` — `nx.betweenness_centrality()`
6. Implement `detect_money_mules()` — nodes with high in-degree from victims, high out-degree to suspects
7. Implement `detect_ring_leaders()` — highest PageRank + betweenness centrality
8. Update `fraud_network_service.py` to call graph_analyzer and persist results back to MongoDB
9. Create seed data for testing (40+ nodes, 60+ edges, multiple communities)

## Algorithm Details
```python
import networkx as nx
from community import community_louvain

G = nx.Graph()
# Add nodes/edges from MongoDB

# Louvain
partition = community_louvain.best_partition(G)

# PageRank
pagerank = nx.pagerank(G, alpha=0.85)

# Centrality
degree = nx.degree_centrality(G)
betweenness = nx.betweenness_centrality(G)

# Money Mule: high in-degree from victim nodes + high out-degree to suspect nodes
# Ring Leader: top PageRank + top betweenness centrality
```

---

# PHASE 7 — GEOSPATIAL PIPELINE — COMPLETED ✅

## Goal
Build aggregation pipeline for crime heatmap data.

## Steps
1. Create MongoDB aggregation pipeline to compute district-level crime stats
2. Auto-update `crime_hotspots` collection from `complaints` data
3. Compute weekly/monthly trends
4. Risk level classification based on crime density
5. Create seed data: 200+ complaints across 20 Indian cities

---

# PHASE 8 — ML: COUNTERFEIT DETECTOR — COMPLETED ✅

## Goal
Build OpenCV + ResNet50 counterfeit currency detector.

## Steps
1. Image preprocessing with OpenCV:
   - Resize, normalize
   - Isolate watermark region
   - Isolate security thread region
   - Isolate serial number region
2. ResNet50 transfer learning for genuine vs. counterfeit classification
3. Individual security feature checks:
   - Watermark detection (template matching)
   - Security thread detection (line detection)
   - Micro text detection (OCR)
   - Serial number extraction (OCR)
   - Color shift ink detection (color histogram analysis)
4. Save model to `app/ml/models/counterfeit_resnet50.pt`
5. Update `counterfeit_detector.py` with full implementation
6. Replace placeholder in `counterfeit_service.py`

---

# PHASE 9 — POLICE COMMAND CENTER INTEGRATION — COMPLETED ✅

## Goal
Wire up live dashboard with real-time data from all modules.

## Steps
1. Dashboard aggregation queries (optimized with MongoDB aggregation pipelines)
2. Auto-generate alerts when:
   - New SCAM verdict detected → alert
   - New fraud ring discovered → alert
   - Counterfeit note detected → alert
   - High-risk account flagged → alert
3. WebSocket support (optional) for live alert feed
4. Cross-state intelligence: detect same phone/UPI/account across multiple states

---

# PHASE 10 — SEED DATA + POLISH (NEXT) 🔜

## Goal
Generate realistic demo data and polish everything.

## Steps
1. Seed `users` (5 demo users: 1 citizen, 1 police, 1 bank, 1 telecom, 1 admin)
2. Seed `complaints` (200+ across 20 Indian cities with realistic scam messages)
3. Seed `transactions` (500+ with varying risk levels)
4. Seed `fraud_nodes` + `fraud_edges` (40+ nodes, 60+ edges, 5 communities)
5. Seed `crime_hotspots` (20 districts)
6. Seed `alerts` (30+ live alerts)
7. Seed `currency_checks` (20+ records)
8. End-to-end testing
9. API documentation finalization
10. Performance optimization

---

# ROLE-BASED ACCESS MATRIX

| Feature | Citizen | Police | Bank | Telecom | Admin |
|---|---|---|---|---|---|
| Report Scam (Citizen Shield) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Check Scam History | ✅ (own) | ✅ (all) | ❌ | ❌ | ✅ (all) |
| Scam Transcript Analysis | ✅ | ✅ | ❌ | ❌ | ✅ |
| View Fraud Network | ❌ | ✅ | ✅ | ❌ | ✅ |
| Run Graph Algorithms | ❌ | ✅ | ❌ | ❌ | ✅ |
| View Crime Heatmap | ✅ | ✅ | ✅ | ✅ | ✅ |
| Heatmap Stats/Districts | ❌ | ✅ | ❌ | ❌ | ✅ |
| Counterfeit Detection | ❌ | ✅ | ✅ | ❌ | ✅ |
| Command Center Dashboard | ❌ | ✅ | ❌ | ❌ | ✅ |
| Manage Alerts | ❌ | ✅ | ❌ | ❌ | ✅ |

---

# ENVIRONMENT SETUP

## Backend
```bash
# Prerequisites: Python 3.11+, MongoDB running on localhost:27017
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

## Frontend (Phase 2)
```bash
# Prerequisites: Node.js 18+
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

## Environment Variables (.env)
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=rakshak_db
JWT_SECRET_KEY=rakshak-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
UPLOAD_DIR=uploads
ML_MODELS_DIR=app/ml/models
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```
