# Rakshak AI Intelligence Grid

**AI Powered Digital Public Safety Intelligence Platform**

---

# 1. System Vision

Rakshak AI Intelligence Grid is a multi-agency public safety ecosystem that connects:

* Citizens
* Police Departments
* Cyber Crime Cells
* Telecom Providers
* Banks
* RBI

The platform uses AI to:

* Detect scams before money transfer
* Discover hidden fraud rings
* Track counterfeit currency circulation
* Identify cybercrime hotspots
* Provide intelligence to law enforcement

---

# 2. High Level Architecture

```
                        ┌─────────────────────┐
                        │      CITIZENS       │
                        │ Mobile / Web / WA   │
                        │ Scam Reporting      │
                        └─────────┬───────────┘
                                  │

──────────────────────────────────────────────────────────

                    ┌───────────────────┐
                    │ TELECOM PROVIDERS │
                    │ Call Metadata     │
                    │ Spoof Detection   │
                    │ Device Fingerprint│
                    └───────────────────┘

                    ┌───────────────────┐
                    │       BANKS       │
                    │ Transactions      │
                    │ Accounts          │
                    │ UPI IDs           │
                    └───────────────────┘

                    ┌───────────────────┐
                    │      POLICE       │
                    │ FIR               │
                    │ Complaints        │
                    │ Cyber Cases       │
                    └───────────────────┘

                    ┌───────────────────┐
                    │        RBI        │
                    │ Counterfeit Data  │
                    │ Security Features │
                    └───────────────────┘


──────────────────────────────────────────────────────────

                AI INTELLIGENCE LAYER

      Scam NLP Engine

      Fraud Risk Engine

      Fraud Graph Intelligence

      Counterfeit Vision AI

      Geospatial Crime Intelligence


──────────────────────────────────────────────────────────

            COMMAND CENTER DASHBOARD

      Live Scam Alerts

      Fraud Rings

      Crime Hotspots

      Counterfeit Networks

      High Risk Accounts

      Cross State Intelligence
```

---

# 3. Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript, Tailwind CSS, Shadcn UI, React Flow, Leaflet, Recharts |
| Backend | FastAPI, Pydantic, Uvicorn, Python |
| Database | MongoDB (Motor + Beanie ODM) |
| ML | Scikit-learn, XGBoost, Transformers, NetworkX, PyTorch, OpenCV |
| Auth | JWT + bcrypt, Role-Based Access Control |

---

# 4. End-to-End Workflow

```
Citizen receives scam message
    ↓
Reports via Web App / WhatsApp / Mobile
    ↓
Scam NLP Engine extracts: Phone, UPI, Account, Keywords, Scam Type, Location
    ↓
Telecom Analysis: Spoofed Number? Mass Calling? Device Reputation?
    ↓
Bank Intelligence: Repeated Account? Money Mule? Transaction Velocity?
    ↓
Police Intelligence: Previous FIR? Known Suspect? Cross State Cases?
    ↓
Fraud Graph Engine: Fraud Ring, Leader, Money Mule, Central Account, Risk Score
    ↓
Geospatial Engine: Heatmap, District Risk
    ↓
Police Command Center: Active Alerts, Fraud Rings, Hotspots, Dangerous Accounts
```

---

# 5. AI Services Architecture

## Scam NLP Engine
- Model: TF-IDF + Logistic Regression (base), IndicBERT/mBERT (advanced)
- Detects: Digital Arrest, Fake CBI, Fake ED, Fake Customs, Fraud Messages
- Output: SCAM verdict, Risk Score, Reasons

## Fraud Risk Engine
- Model: XGBoost
- Input: Transaction, UPI, Amount, Account, Frequency
- Output: Fraud Score, Risk Level

## Fraud Graph Intelligence
- Library: NetworkX
- Algorithms: Louvain, PageRank, Degree Centrality, Betweenness Centrality
- Advanced: GraphSAGE
- Output: Fraud Rings, Leader, Money Mule, Risk Score

## Counterfeit Vision AI
- Model: ResNet50 Transfer Learning
- Checks: Watermark, Security Thread, Micro Text, Serial Number, Ashoka Emblem
- Output: GENUINE/COUNTERFEIT, Confidence Score

## Geospatial Crime Engine
- Libraries: Leaflet, GeoJSON, Recharts
- Output: Heatmap, District Risk, Crime Density, Hotspots

---

# 6. Role-Based Access

| Role | Permissions |
|---|---|
| Citizen | Report Scam, Check Fraud, Upload Currency |
| Police | View Fraud Graph, Hotspots, Complaints, Alerts, Command Center |
| Bank | Check Transactions, View Risk Scores, Counterfeit Detection |
| Telecom | Upload Call Metadata, Receive Scam Alerts |
| Admin | Manage Users, Models, Agencies, Full Access |

---

# 7. Final System Flow

```
Crime → Complaint → Investigation
```
becomes:
```
Suspicion → Detection → Prediction → Prevention
```

**Rakshak AI transforms reactive policing into predictive threat neutralization.**
