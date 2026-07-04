"""
Rakshak AI - Comprehensive Database Seeder
Generates rich, realistic demo data for every module of the Intelligence Grid.

Run: python -m scripts.seed_db
"""

import asyncio
import random
from datetime import datetime, timedelta, timezone
from loguru import logger

from app.config.database import connect_to_mongodb, close_mongodb_connection
from app.middleware.security import hash_password
from app.models.user import User, UserRole
from app.models.complaint import Complaint, ScamType, VerdictType, ComplaintStatus
from app.models.transaction import Transaction, RiskLevel
from app.models.fraud_node import FraudNode, NodeType
from app.models.fraud_edge import FraudEdge, EdgeType
from app.models.device import Device
from app.models.crime_hotspot import CrimeHotspot
from app.models.currency_check import CurrencyCheck, CurrencyVerdict
from app.models.alert import Alert, AlertType, AlertSeverity


# ────────────────────────────────────────────────────────────────
# REFERENCE DATA
# ────────────────────────────────────────────────────────────────

INDIAN_CITIES = [
    {"state": "Maharashtra", "district": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"state": "Maharashtra", "district": "Pune", "lat": 18.5204, "lng": 73.8567},
    {"state": "Maharashtra", "district": "Nagpur", "lat": 21.1458, "lng": 79.0882},
    {"state": "Delhi", "district": "New Delhi", "lat": 28.6139, "lng": 77.2090},
    {"state": "Karnataka", "district": "Bangalore", "lat": 12.9716, "lng": 77.5946},
    {"state": "Telangana", "district": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
    {"state": "Tamil Nadu", "district": "Chennai", "lat": 13.0827, "lng": 80.2707},
    {"state": "Gujarat", "district": "Ahmedabad", "lat": 23.0225, "lng": 72.5714},
    {"state": "Gujarat", "district": "Surat", "lat": 21.1702, "lng": 72.8311},
    {"state": "Rajasthan", "district": "Jaipur", "lat": 26.9124, "lng": 75.7873},
    {"state": "Uttar Pradesh", "district": "Lucknow", "lat": 26.8467, "lng": 80.9462},
    {"state": "Uttar Pradesh", "district": "Noida", "lat": 28.5355, "lng": 77.3910},
    {"state": "West Bengal", "district": "Kolkata", "lat": 22.5726, "lng": 88.3639},
    {"state": "Madhya Pradesh", "district": "Bhopal", "lat": 23.2599, "lng": 77.4126},
    {"state": "Jharkhand", "district": "Jamtara", "lat": 23.9606, "lng": 86.8144},
    {"state": "Jharkhand", "district": "Ranchi", "lat": 23.3441, "lng": 85.3096},
    {"state": "Haryana", "district": "Gurugram", "lat": 28.4595, "lng": 77.0266},
    {"state": "Punjab", "district": "Chandigarh", "lat": 30.7333, "lng": 76.7794},
    {"state": "Kerala", "district": "Kochi", "lat": 9.9312, "lng": 76.2673},
    {"state": "Odisha", "district": "Bhubaneswar", "lat": 20.2961, "lng": 85.8245},
]

VICTIM_FIRST_NAMES = [
    "Rahul", "Priya", "Amit", "Sunita", "Vikram", "Anjali", "Rajesh", "Meera",
    "Suresh", "Neha", "Arun", "Kavita", "Deepak", "Pooja", "Manish", "Ritu",
    "Sanjay", "Divya", "Rohit", "Nisha", "Ajay", "Swati", "Ashok", "Rekha",
]

VICTIM_LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Singh", "Kumar", "Gupta", "Joshi", "Mehta",
    "Reddy", "Nair", "Iyer", "Das", "Choudhury", "Banerjee", "Mishra", "Rao",
]

SCAM_MESSAGES = {
    ScamType.DIGITAL_ARREST: [
        "This is CBI Delhi. There is a warrant issued against your Aadhaar number for money laundering. You must pay ₹2,50,000 immediately or face digital arrest. Do not disconnect this call.",
        "I am calling from Supreme Court Digital Cell. Your bank account has been used in hawala transactions. Stay on the line for digital arrest proceedings. Transfer ₹1,80,000 to clear your name.",
        "This is Inspector Rajesh Kumar from Delhi Cyber Crime. A parcel containing illegal drugs was intercepted at Mumbai customs. Your Aadhaar is linked. You are under digital arrest.",
        "We are from Ministry of Home Affairs. Your SIM card has been used for terrorist communications. You will be digitally arrested in 2 hours unless you cooperate. Transfer funds to the safe account now.",
        "Your PAN card has been flagged by the Income Tax Department for ₹48 lakh in unaccounted transactions. You will be arrested digitally. Pay the settlement amount of ₹3,50,000 immediately.",
    ],
    ScamType.FAKE_CBI: [
        "This is CBI Special Branch officer Ramesh. We found 3 bank accounts in your name used for drug trafficking. We are initiating a video call arrest. Do NOT hang up.",
        "CBI has identified your phone number in connection with a human trafficking ring. This is your last chance to cooperate before we issue an arrest warrant.",
        "You are speaking to CBI Joint Director. Your name appears in an FIR registered in connection with a ₹200 crore money laundering case. You need to verify your identity and secure your assets.",
    ],
    ScamType.FAKE_ED: [
        "This is the Enforcement Directorate. Under PMLA Act, we have frozen your accounts. To unfreeze, you must transfer ₹5 lakh to a government escrow account for verification.",
        "ED has flagged your UPI ID for receiving proceeds of crime. An attachment order is being prepared. Cooperate now or face 7 years imprisonment under PMLA.",
    ],
    ScamType.FAKE_CUSTOMS: [
        "Indian Customs has seized a parcel in your name containing 5 fake passports and MDMA. A case has been registered. To avoid arrest, you must pay a security deposit of ₹1,20,000.",
        "A parcel shipped from Thailand addressed to your name has been held at Mumbai customs. It contains banned substances. Your Aadhaar is linked. Cooperate or FIR will be filed.",
    ],
    ScamType.UPI_FRAUD: [
        "Congratulations! You have won ₹10,00,000 in the Amazon Lucky Draw. To claim, send ₹999 as processing fee to this UPI ID: winner2024@ybl",
        "Your SBI account KYC has expired. Click this link to update immediately or your account will be blocked in 24 hours. Enter your UPI PIN to verify.",
        "I accidentally sent ₹5000 to your number. Please return it to my UPI ID: refund.now@paytm. I am sending a collect request.",
        "URGENT: Your PhonePe account is being closed due to suspicious activity. Send ₹1 to verify your identity at this UPI: kyc.verify@upi",
    ],
    ScamType.PHISHING: [
        "Dear customer, your HDFC credit card ending 4567 has been temporarily blocked. Click here to verify: http://hdfc-verify.scam.com",
        "SBI Alert: Unusual login detected. Your net banking will be suspended. Verify now: http://sbi-secure-login.phishing.net",
    ],
    ScamType.LOAN_FRAUD: [
        "Pre-approved personal loan of ₹5,00,000 at 0% interest! No documents needed. Just pay ₹2,999 processing fee via UPI to: quickloan@ybl",
        "You qualify for instant loan of ₹10 lakh. Download our app and pay the insurance premium of ₹4,500 to get disbursement in 1 hour.",
    ],
    ScamType.VIDEO_SCAM: [
        "During a video call on a dating app, the scammer recorded a compromising video and threatened to share it unless ₹50,000 is transferred immediately via Google Pay.",
    ],
    ScamType.IDENTITY_THEFT: [
        "Someone has applied for a credit card using my Aadhaar and PAN. I received an OTP for a transaction I never initiated.",
        "My WhatsApp was cloned and the scammer sent messages to all my contacts asking for urgent money transfers.",
    ],
}

SAFE_MESSAGES = [
    "Got a message from my bank about a genuine account statement notification.",
    "Received a delivery update from Flipkart about my order. Seems normal.",
    "My friend sent a UPI request for splitting dinner bill. This is legitimate.",
    "Got an OTP from IRCTC for booking a train ticket. I initiated this myself.",
    "My company HR sent details about the new health insurance policy via WhatsApp.",
]


# ────────────────────────────────────────────────────────────────
# SEEDERS
# ────────────────────────────────────────────────────────────────

async def clear_all():
    """Drop all documents from all collections."""
    logger.warning("🗑️  Clearing all existing data...")
    for Model in [User, Complaint, Transaction, FraudNode, FraudEdge, Device, CurrencyCheck, CrimeHotspot, Alert]:
        await Model.find_all().delete()
    logger.info("   All collections cleared.")


async def seed_users():
    """Create 5 demo users with properly hashed passwords."""
    logger.info("👤 Seeding users...")
    common_password = hash_password("password123")

    users_data = [
        {"name": "Inspector Rajesh Kumar", "email": "admin@rakshak.ai", "role": UserRole.ADMIN, "phone": "+919876500001", "organization": "National Cyber Crime HQ"},
        {"name": "SI Priya Sharma", "email": "analyst@rakshak.ai", "role": UserRole.POLICE, "phone": "+919876500002", "organization": "Maharashtra Cyber Cell"},
        {"name": "Raj Sharma", "email": "citizen@example.com", "role": UserRole.CITIZEN, "phone": "+919876500003", "organization": None},
        {"name": "HDFC Fraud Desk", "email": "bank@rakshak.ai", "role": UserRole.BANK, "phone": "+919876500004", "organization": "HDFC Bank Ltd"},
        {"name": "Jio SOC Team", "email": "telecom@rakshak.ai", "role": UserRole.TELECOM, "phone": "+919876500005", "organization": "Reliance Jio Infocomm"},
    ]

    created = []
    for u in users_data:
        user = User(password=common_password, **u)
        await user.insert()
        created.append(user)
        logger.info(f"   Created: {u['email']} ({u['role'].value})")

    return created


async def seed_complaints(count=220):
    """Generate 220 complaints spread across 30 days and 20 cities."""
    logger.info(f"📋 Seeding {count} complaints...")
    now = datetime.now(timezone.utc)
    created = []

    scam_types_list = list(SCAM_MESSAGES.keys())

    for i in range(count):
        city = random.choice(INDIAN_CITIES)
        lat = city["lat"] + random.uniform(-0.08, 0.08)
        lng = city["lng"] + random.uniform(-0.08, 0.08)

        # 75% scam, 10% suspicious, 15% safe
        roll = random.random()
        if roll < 0.75:
            scam_type = random.choice(scam_types_list)
            message = random.choice(SCAM_MESSAGES[scam_type])
            verdict = VerdictType.SCAM
            risk_score = random.randint(65, 100)
            confidence = round(random.uniform(0.75, 0.99), 2)
            amount_lost = random.choice([0, 5000, 12000, 25000, 50000, 75000, 150000, 250000])
        elif roll < 0.85:
            scam_type = random.choice(scam_types_list)
            message = random.choice(SCAM_MESSAGES[scam_type])
            verdict = VerdictType.SUSPICIOUS
            risk_score = random.randint(35, 64)
            confidence = round(random.uniform(0.50, 0.74), 2)
            amount_lost = 0
        else:
            scam_type = None
            message = random.choice(SAFE_MESSAGES)
            verdict = VerdictType.SAFE
            risk_score = random.randint(0, 20)
            confidence = round(random.uniform(0.80, 0.98), 2)
            amount_lost = 0

        first = random.choice(VICTIM_FIRST_NAMES)
        last = random.choice(VICTIM_LAST_NAMES)
        victim_name = f"{first} {last}"
        days_ago = random.randint(0, 30)
        created_at = now - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))

        reasons = []
        if verdict != VerdictType.SAFE:
            if scam_type in [ScamType.DIGITAL_ARREST, ScamType.FAKE_CBI, ScamType.FAKE_ED]:
                reasons = ["Government impersonation detected", "Fear/urgency language found", "Demand for immediate payment"]
            elif scam_type == ScamType.UPI_FRAUD:
                reasons = ["Suspicious UPI ID pattern", "Social engineering detected"]
            elif scam_type == ScamType.PHISHING:
                reasons = ["Suspicious URL pattern", "Brand impersonation detected"]
            else:
                reasons = ["Analyzed by ML risk model"]

        complaint = Complaint(
            victim_name=victim_name,
            victim_phone=f"+91{random.randint(6000000000, 9999999999)}",
            victim_age=random.randint(18, 72),
            victim_gender=random.choice(["Male", "Female"]),
            phone=f"+91{random.randint(6000000000, 9999999999)}",
            upi=f"scammer{random.randint(100,999)}@{'ybl' if random.random() > 0.5 else 'paytm'}" if verdict != VerdictType.SAFE else None,
            message=message,
            source=random.choice(["call", "sms", "whatsapp", "email", "manual"]),
            location={"type": "Point", "coordinates": [lng, lat]},
            state=city["state"],
            district=city["district"],
            amount_lost=amount_lost,
            verdict=verdict,
            risk_score=risk_score,
            confidence=confidence,
            scam_type=scam_type,
            reasons=reasons,
            matched_patterns=reasons[:2] if reasons else [],
            status=random.choice([ComplaintStatus.REPORTED, ComplaintStatus.ANALYZING, ComplaintStatus.INVESTIGATED, ComplaintStatus.RESOLVED]),
            response_time_ms=random.randint(120, 800),
            reported_at=created_at,
            created_at=created_at,
            updated_at=created_at + timedelta(hours=random.randint(0, 48)),
        )
        await complaint.insert()
        created.append(complaint)

    logger.info(f"   Created {len(created)} complaints across {len(INDIAN_CITIES)} cities.")
    return created


async def seed_fraud_network():
    """Create 5 fraud communities with 45+ nodes and 70+ edges."""
    logger.info("🕸️  Seeding fraud network graph (5 communities)...")

    communities = [
        {"id": 0, "name": "Jamtara Digital Arrest Ring", "leader": "Ravi Mandal", "base": "Jamtara"},
        {"id": 1, "name": "Mumbai UPI Fraud Syndicate", "leader": "Deepak Yadav", "base": "Mumbai"},
        {"id": 2, "name": "Delhi Fake CBI Gang", "leader": "Sunil Tiwari", "base": "Delhi"},
        {"id": 3, "name": "Hyderabad Phishing Network", "leader": "Prasad Reddy", "base": "Hyderabad"},
        {"id": 4, "name": "Kolkata Counterfeit Ring", "leader": "Bablu Das", "base": "Kolkata"},
    ]

    all_nodes = []
    all_edges = []

    for comm in communities:
        cid = comm["id"]

        # 1. Ring Leader (Suspect)
        leader_id = f"suspect_{cid}_leader"
        all_nodes.append(FraudNode(
            node_id=leader_id, node_type=NodeType.SUSPECT,
            label=comm["leader"],
            properties={"name": comm["leader"], "location": comm["base"], "alias": f"Boss-{cid}"},
            community=cid, risk_score=95, is_ring_leader=True, is_flagged=True,
            connections=[]
        ))

        # 2. Money Mules (2–3 bank accounts)
        mule_ids = []
        for m in range(random.randint(2, 3)):
            mule_id = f"bank_{cid}_mule_{m}"
            mule_ids.append(mule_id)
            all_nodes.append(FraudNode(
                node_id=mule_id, node_type=NodeType.BANK_ACCOUNT,
                label=f"Acct ****{random.randint(1000,9999)}",
                properties={"bank_account": f"SBIN000{random.randint(10000,99999)}", "bank": random.choice(["SBI", "PNB", "BOI", "UCO"])},
                community=cid, risk_score=85, is_money_mule=True, is_flagged=True,
                connections=[leader_id]
            ))
            all_edges.append(FraudEdge(
                source_node_id=leader_id, target_node_id=mule_id,
                edge_type=EdgeType.TRANSFERRED_TO, weight=0.9,
                amount=random.uniform(50000, 500000), frequency=random.randint(10, 50),
            ))

        # 3. Burner Phones (2–3 per leader)
        phone_ids = []
        for p in range(random.randint(2, 3)):
            phone_id = f"phone_{cid}_{p}"
            phone_ids.append(phone_id)
            phone_num = f"+91{random.choice(['140', '800', '700'])}{random.randint(1000000, 9999999)}"
            all_nodes.append(FraudNode(
                node_id=phone_id, node_type=NodeType.PHONE,
                label=f"Burner {phone_num[-4:]}",
                properties={"phone_number": phone_num, "is_voip": True, "carrier": "Unknown"},
                community=cid, risk_score=90, is_flagged=True,
                connections=[leader_id]
            ))
            all_edges.append(FraudEdge(
                source_node_id=leader_id, target_node_id=phone_id,
                edge_type=EdgeType.USES_DEVICE, weight=0.8,
            ))

        # 4. UPI IDs (1–2)
        for u in range(random.randint(1, 2)):
            upi_id_node = f"upi_{cid}_{u}"
            upi_value = f"fraud{random.randint(100,999)}@{random.choice(['ybl', 'paytm', 'ibl'])}"
            all_nodes.append(FraudNode(
                node_id=upi_id_node, node_type=NodeType.UPI,
                label=upi_value,
                properties={"upi_id": upi_value},
                community=cid, risk_score=88, is_flagged=True,
                connections=[leader_id] + mule_ids[:1]
            ))
            all_edges.append(FraudEdge(
                source_node_id=upi_id_node, target_node_id=mule_ids[0],
                edge_type=EdgeType.LINKED_UPI, weight=0.85,
            ))
            all_edges.append(FraudEdge(
                source_node_id=leader_id, target_node_id=upi_id_node,
                edge_type=EdgeType.BELONGS_TO, weight=0.7,
            ))

        # 5. Device (1 per community)
        dev_id = f"device_{cid}"
        all_nodes.append(FraudNode(
            node_id=dev_id, node_type=NodeType.DEVICE,
            label=f"Device-{random.randint(1000,9999)}",
            properties={"device_id": f"IMEI-{random.randint(100000000, 999999999)}", "os": "Android", "model": "Redmi Note"},
            community=cid, risk_score=80, is_flagged=True,
            connections=phone_ids
        ))
        for pid in phone_ids:
            all_edges.append(FraudEdge(
                source_node_id=dev_id, target_node_id=pid,
                edge_type=EdgeType.USES_DEVICE, weight=0.7,
            ))

        # 6. Victims (3–5 per community)
        for v in range(random.randint(3, 5)):
            vic_id = f"victim_{cid}_{v}"
            first = random.choice(VICTIM_FIRST_NAMES)
            last = random.choice(VICTIM_LAST_NAMES)
            target_mule = random.choice(mule_ids)
            all_nodes.append(FraudNode(
                node_id=vic_id, node_type=NodeType.VICTIM,
                label=f"{first} {last}",
                properties={"name": f"{first} {last}", "city": random.choice(["Pune", "Lucknow", "Chennai", "Jaipur"])},
                community=cid, risk_score=random.randint(5, 20),
                connections=[target_mule]
            ))
            all_edges.append(FraudEdge(
                source_node_id=vic_id, target_node_id=target_mule,
                edge_type=EdgeType.TRANSFERRED_TO, weight=0.5,
                amount=random.uniform(5000, 200000),
            ))
            # Some victims were also called by a burner phone
            if random.random() > 0.4 and phone_ids:
                all_edges.append(FraudEdge(
                    source_node_id=random.choice(phone_ids), target_node_id=vic_id,
                    edge_type=EdgeType.CALLED_BY, weight=0.6,
                ))

    # Insert all
    for n in all_nodes:
        await n.insert()
    for e in all_edges:
        await e.insert()

    logger.info(f"   Created {len(all_nodes)} nodes, {len(all_edges)} edges across {len(communities)} communities.")


async def seed_hotspots():
    """Create crime hotspots for all 20 cities with trend data."""
    logger.info("🗺️  Seeding crime hotspots...")

    for city in INDIAN_CITIES:
        fraud_count = random.randint(5, 65)
        risk_score = min(100, int(fraud_count * 1.8))
        if risk_score >= 80:
            risk_level = "critical"
        elif risk_score >= 55:
            risk_level = "high"
        elif risk_score >= 30:
            risk_level = "medium"
        else:
            risk_level = "low"

        # Weekly trend data for the last 4 weeks
        trend_data = []
        base = random.randint(3, 15)
        for w in range(4):
            trend_data.append({"week": f"W{w+1}", "count": base + random.randint(-3, 8)})

        trend_direction = "increasing" if trend_data[-1]["count"] > trend_data[0]["count"] else (
            "decreasing" if trend_data[-1]["count"] < trend_data[0]["count"] else "stable"
        )

        top_types = random.sample(
            [ScamType.DIGITAL_ARREST.value, ScamType.UPI_FRAUD.value, ScamType.FAKE_CBI.value, ScamType.PHISHING.value, ScamType.LOAN_FRAUD.value],
            k=2
        )

        hotspot = CrimeHotspot(
            state=city["state"],
            district=city["district"],
            coordinates={"type": "Point", "coordinates": [city["lng"], city["lat"]]},
            fraud_count=fraud_count,
            total_amount_lost=fraud_count * random.randint(5000, 25000),
            crime_breakdown={top_types[0]: fraud_count // 2, top_types[1]: fraud_count - fraud_count // 2},
            risk_level=risk_level,
            risk_score=risk_score,
            trend=trend_direction,
            trend_data=trend_data,
            top_crime_types=top_types,
        )
        await hotspot.insert()

    logger.info(f"   Created {len(INDIAN_CITIES)} crime hotspots.")


async def seed_alerts():
    """Create 35 alerts across different types and severities."""
    logger.info("🚨 Seeding alerts...")
    now = datetime.now(timezone.utc)

    alert_templates = [
        # Critical
        {"type": AlertType.SCAM_DETECTED, "severity": AlertSeverity.CRITICAL, "title": "Digital Arrest Scam — ₹2.5L extorted", "desc": "Victim in Pune was held on video call for 6 hours by fake CBI officers. ₹2,50,000 transferred via UPI.", "module": "scam_detection", "state": "Maharashtra", "district": "Pune"},
        {"type": AlertType.FRAUD_RING, "severity": AlertSeverity.CRITICAL, "title": "Jamtara Syndicate — 18 linked victims", "desc": "Graph analysis detected a fraud ring with 18 victims across 4 states. Ring leader identified with PageRank 0.12.", "module": "fraud_network", "state": "Jharkhand", "district": "Jamtara"},
        {"type": AlertType.MASS_ATTACK, "severity": AlertSeverity.CRITICAL, "title": "Bulk VoIP attack — 500+ calls/hour", "desc": "VoIP number +911400012345 is generating 500+ scam calls per hour impersonating ED officials.", "module": "scam_detection", "state": "Delhi", "district": "New Delhi"},
        {"type": AlertType.COUNTERFEIT, "severity": AlertSeverity.CRITICAL, "title": "Counterfeit ₹500 notes — batch detected", "desc": "12 counterfeit ₹500 notes with same serial prefix detected across 3 bank branches in Mumbai.", "module": "counterfeit", "state": "Maharashtra", "district": "Mumbai"},
        # High
        {"type": AlertType.SCAM_DETECTED, "severity": AlertSeverity.HIGH, "title": "Fake customs call — parcel scam", "desc": "Victim received call claiming parcel with drugs seized at Mumbai airport. ₹1,20,000 demanded.", "module": "scam_detection", "state": "Tamil Nadu", "district": "Chennai"},
        {"type": AlertType.HIGH_RISK_ACCOUNT, "severity": AlertSeverity.HIGH, "title": "UPI ID fraud247@ybl flagged", "desc": "UPI ID received ₹8,40,000 from 14 different accounts in 48 hours. Suspected money mule.", "module": "fraud_network", "state": "Karnataka", "district": "Bangalore"},
        {"type": AlertType.MONEY_MULE, "severity": AlertSeverity.HIGH, "title": "Money mule network — 3 accounts", "desc": "Three SBI accounts operated from same device transferring funds within minutes of receiving them.", "module": "fraud_network", "state": "Uttar Pradesh", "district": "Noida"},
        {"type": AlertType.CROSS_STATE, "severity": AlertSeverity.HIGH, "title": "Cross-state scam — same phone across 5 states", "desc": "Phone +918001234567 used in digital arrest scams reported from Maharashtra, Delhi, Karnataka, Gujarat, Tamil Nadu.", "module": "scam_detection", "state": "Maharashtra", "district": "Mumbai"},
        {"type": AlertType.SCAM_DETECTED, "severity": AlertSeverity.HIGH, "title": "Loan fraud app — 200+ victims", "desc": "Fraudulent instant loan app 'QuickCash' collecting ₹4,500 processing fee and disappearing.", "module": "citizen_shield", "state": "Gujarat", "district": "Ahmedabad"},
        {"type": AlertType.COUNTERFEIT, "severity": AlertSeverity.HIGH, "title": "₹2000 counterfeit — missing security thread", "desc": "Counterfeit ₹2000 note detected at SBI Jaipur branch. Security thread and watermark both failed verification.", "module": "counterfeit", "state": "Rajasthan", "district": "Jaipur"},
        # Medium
        {"type": AlertType.SCAM_DETECTED, "severity": AlertSeverity.MEDIUM, "title": "WhatsApp phishing — SBI KYC", "desc": "Multiple citizens reported WhatsApp messages with fake SBI KYC update link.", "module": "citizen_shield", "state": "Kerala", "district": "Kochi"},
        {"type": AlertType.SCAM_DETECTED, "severity": AlertSeverity.MEDIUM, "title": "UPI refund scam attempt", "desc": "Scammer sent collect request claiming accidental transfer. Victim did not comply.", "module": "citizen_shield", "state": "Haryana", "district": "Gurugram"},
        {"type": AlertType.HIGH_RISK_ACCOUNT, "severity": AlertSeverity.MEDIUM, "title": "Suspicious account velocity spike", "desc": "Bank account SBIN00045672 showed 50x increase in daily transaction volume.", "module": "fraud_network", "state": "West Bengal", "district": "Kolkata"},
        {"type": AlertType.SCAM_DETECTED, "severity": AlertSeverity.MEDIUM, "title": "ED impersonation — video call", "desc": "Victim put on video call with fake ED officer in uniform. Call disconnected before any transfer.", "module": "scam_detection", "state": "Madhya Pradesh", "district": "Bhopal"},
        {"type": AlertType.COUNTERFEIT, "severity": AlertSeverity.MEDIUM, "title": "₹200 note — inconclusive watermark", "desc": "₹200 note at PNB Lucknow showed faint watermark. Further analysis required.", "module": "counterfeit", "state": "Uttar Pradesh", "district": "Lucknow"},
        # Low
        {"type": AlertType.SCAM_DETECTED, "severity": AlertSeverity.LOW, "title": "Lottery scam SMS blocked", "desc": "Automated system blocked SMS from +919999888777 claiming lottery win of ₹10 lakh.", "module": "citizen_shield", "state": "Punjab", "district": "Chandigarh"},
        {"type": AlertType.SCAM_DETECTED, "severity": AlertSeverity.LOW, "title": "Suspicious OTP sharing attempt", "desc": "Citizen reported caller asking for OTP. No financial loss occurred.", "module": "citizen_shield", "state": "Odisha", "district": "Bhubaneswar"},
    ]

    # Extend with more random alerts to reach 35
    extra_types = [
        (AlertType.SCAM_DETECTED, AlertSeverity.HIGH, "scam_detection"),
        (AlertType.SCAM_DETECTED, AlertSeverity.MEDIUM, "citizen_shield"),
        (AlertType.HIGH_RISK_ACCOUNT, AlertSeverity.HIGH, "fraud_network"),
        (AlertType.FRAUD_RING, AlertSeverity.HIGH, "fraud_network"),
        (AlertType.COUNTERFEIT, AlertSeverity.MEDIUM, "counterfeit"),
        (AlertType.MONEY_MULE, AlertSeverity.HIGH, "fraud_network"),
        (AlertType.CROSS_STATE, AlertSeverity.CRITICAL, "scam_detection"),
    ]

    count = 0
    for template in alert_templates:
        alert = Alert(
            alert_type=template["type"],
            severity=template["severity"],
            title=template["title"],
            description=template["desc"],
            source_module=template["module"],
            state=template.get("state"),
            district=template.get("district"),
            is_read=random.random() > 0.6,
            is_resolved=random.random() > 0.75,
            created_at=now - timedelta(hours=random.randint(1, 720)),
        )
        await alert.insert()
        count += 1

    # Fill up to ~35
    while count < 35:
        atype, sev, mod = random.choice(extra_types)
        city = random.choice(INDIAN_CITIES)
        alert = Alert(
            alert_type=atype,
            severity=sev,
            title=f"Auto-alert: {atype.value.replace('_', ' ').title()} in {city['district']}",
            description=f"System detected suspicious activity in {city['district']}, {city['state']}. Review required.",
            source_module=mod,
            state=city["state"],
            district=city["district"],
            is_read=random.random() > 0.5,
            is_resolved=False,
            created_at=now - timedelta(hours=random.randint(1, 200)),
        )
        await alert.insert()
        count += 1

    logger.info(f"   Created {count} alerts.")


async def seed_currency_checks():
    """Create 25 currency detection records."""
    logger.info("💵 Seeding currency check records...")
    now = datetime.now(timezone.utc)

    for i in range(25):
        is_genuine = random.random() > 0.45
        denomination = random.choice([100, 200, 500, 2000])
        city = random.choice(INDIAN_CITIES)

        if is_genuine:
            features = {"watermark": "pass", "security_thread": "pass", "micro_text": "pass",
                        "color_shift_ink": "pass", "serial_pattern": "pass", "intaglio_print": "pass", "ashoka_emblem": "pass"}
        else:
            features = {
                "watermark": random.choice(["fail", "inconclusive"]),
                "security_thread": random.choice(["fail", "pass"]),
                "micro_text": random.choice(["fail", "inconclusive"]),
                "color_shift_ink": random.choice(["fail", "pass"]),
                "serial_pattern": random.choice(["fail", "pass"]),
                "intaglio_print": "fail",
                "ashoka_emblem": random.choice(["fail", "inconclusive"]),
            }

        record = CurrencyCheck(
            image_path=f"uploads/currency_{i+1}.jpg",
            denomination=denomination,
            prediction=CurrencyVerdict.GENUINE if is_genuine else CurrencyVerdict.COUNTERFEIT,
            confidence=round(random.uniform(0.80, 0.98), 2) if is_genuine else round(random.uniform(0.65, 0.95), 2),
            watermark=features["watermark"],
            security_thread=features["security_thread"],
            micro_text=features["micro_text"],
            color_shift_ink=features["color_shift_ink"],
            serial_pattern=features["serial_pattern"],
            intaglio_print=features["intaglio_print"],
            ashoka_emblem=features["ashoka_emblem"],
            serial_number=f"{random.randint(10,99)}{random.choice('ABCDEFGHKLMNPRSTUVWX')}{random.randint(100000, 999999)}",
            state=city["state"],
            district=city["district"],
            analyst_id="admin",
            model_version="v1.0-cv-resnet-sim",
            created_at=now - timedelta(days=random.randint(0, 20)),
        )
        await record.insert()

    logger.info("   Created 25 currency check records.")


async def seed_transactions():
    """Create 100 financial transactions for risk analysis."""
    logger.info("💳 Seeding transactions...")
    now = datetime.now(timezone.utc)

    for i in range(100):
        amount = random.choice([500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000])
        risk_roll = random.random()
        if risk_roll < 0.15:
            risk_level = RiskLevel.CRITICAL
            risk_score = random.randint(80, 100)
            is_flagged = True
        elif risk_roll < 0.35:
            risk_level = RiskLevel.HIGH
            risk_score = random.randint(60, 79)
            is_flagged = True
        elif risk_roll < 0.55:
            risk_level = RiskLevel.MEDIUM
            risk_score = random.randint(30, 59)
            is_flagged = False
        else:
            risk_level = RiskLevel.LOW
            risk_score = random.randint(0, 29)
            is_flagged = False

        txn = Transaction(
            transaction_id=f"TXN{datetime.now().strftime('%Y%m%d')}{i:04d}",
            account=f"SBIN000{random.randint(10000, 99999)}",
            upi=f"user{random.randint(100,999)}@{random.choice(['ybl', 'paytm', 'oksbi', 'ibl'])}",
            amount=amount,
            receiver_account=f"PNBK000{random.randint(10000, 99999)}",
            receiver_upi=f"recv{random.randint(100,999)}@{random.choice(['ybl', 'paytm'])}",
            receiver_name=f"{random.choice(VICTIM_FIRST_NAMES)} {random.choice(VICTIM_LAST_NAMES)}",
            transaction_type=random.choice(["upi", "neft", "rtgs", "imps"]),
            channel=random.choice(["mobile", "web", "atm"]),
            risk_score=risk_score,
            risk_level=risk_level,
            is_flagged=is_flagged,
            fraud_indicators=["velocity_spike", "new_receiver"] if is_flagged else [],
            daily_transaction_count=random.randint(1, 50),
            daily_transaction_amount=amount * random.randint(1, 10),
            unique_receivers_24h=random.randint(1, 20),
            timestamp=now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23)),
        )
        await txn.insert()

    logger.info("   Created 100 transactions.")


# ────────────────────────────────────────────────────────────────
# MAIN
# ────────────────────────────────────────────────────────────────

async def main():
    logger.info("=" * 60)
    logger.info("  RAKSHAK AI — DATABASE SEEDER")
    logger.info("=" * 60)

    await connect_to_mongodb()

    await clear_all()
    await seed_users()
    await seed_complaints(220)
    await seed_fraud_network()
    await seed_hotspots()
    await seed_alerts()
    await seed_currency_checks()
    await seed_transactions()

    logger.info("=" * 60)
    logger.info("  ✅ DATABASE SEEDED SUCCESSFULLY!")
    logger.info("  Login credentials (all use password: password123):")
    logger.info("    admin@rakshak.ai    (admin)")
    logger.info("    analyst@rakshak.ai  (police)")
    logger.info("    citizen@example.com (citizen)")
    logger.info("    bank@rakshak.ai     (bank)")
    logger.info("    telecom@rakshak.ai  (telecom)")
    logger.info("=" * 60)

    await close_mongodb_connection()


if __name__ == "__main__":
    asyncio.run(main())
