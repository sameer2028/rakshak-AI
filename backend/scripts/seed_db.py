"""
Rakshak AI - Database Seeder
Generates realistic test data for the Intelligence Grid.
"""

import asyncio
import random
from datetime import datetime, timedelta, timezone
from loguru import logger
import uuid

# Models
from app.config.database import connect_to_mongodb, close_mongodb_connection
from app.models.user import User, UserRole
from app.models.complaint import Complaint, ScamType, VerdictType
from app.models.fraud_node import FraudNode, NodeType
from app.models.fraud_edge import FraudEdge, EdgeType
from app.models.crime_hotspot import CrimeHotspot
from app.models.currency_check import CurrencyCheck, CurrencyVerdict

# --- Dummy Data ---
CITIES = [
    {"state": "Maharashtra", "district": "Pune", "lat": 18.5204, "lng": 73.8567},
    {"state": "Maharashtra", "district": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"state": "Delhi", "district": "New Delhi", "lat": 28.6139, "lng": 77.2090},
    {"state": "Karnataka", "district": "Bangalore", "lat": 12.9716, "lng": 77.5946},
    {"state": "Telangana", "district": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
    {"state": "Tamil Nadu", "district": "Chennai", "lat": 13.0827, "lng": 80.2707},
    {"state": "Gujarat", "district": "Ahmedabad", "lat": 23.0225, "lng": 72.5714},
    {"state": "Haryana", "district": "Gurugram", "lat": 28.4595, "lng": 77.0266},
]

SCAM_TYPES = [ScamType.DIGITAL_ARREST, ScamType.FAKE_CBI, ScamType.PHISHING, ScamType.UPI_FRAUD, ScamType.OTHER]

async def clear_collections():
    logger.info("Clearing existing data...")
    await User.find_all().delete()
    await Complaint.find_all().delete()
    await FraudNode.find_all().delete()
    await FraudEdge.find_all().delete()
    await CrimeHotspot.find_all().delete()
    await CurrencyCheck.find_all().delete()

async def seed_users():
    logger.info("Seeding users...")
    users = [
        User(
            email="admin@rakshak.ai",
            password="hashed_password", # Dummy
            name="Admin Police",
            role=UserRole.ADMIN,
            is_active=True
        ),
        User(
            email="analyst@rakshak.ai",
            password="hashed_password",
            name="Cyber Analyst",
            role=UserRole.POLICE,
            is_active=True
        ),
        User(
            email="citizen@example.com",
            password="hashed_password",
            name="Raj Sharma",
            role=UserRole.CITIZEN,
            is_active=True
        )
    ]
    for u in users:
        await u.insert()
    return users

async def seed_complaints():
    logger.info("Seeding complaints...")
    complaints = []
    now = datetime.now(timezone.utc)
    
    for i in range(150):
        city = random.choice(CITIES)
        scam = random.choice(SCAM_TYPES)
        # Add slight jitter to coordinates
        lat = city["lat"] + random.uniform(-0.05, 0.05)
        lng = city["lng"] + random.uniform(-0.05, 0.05)
        
        is_scam = random.random() > 0.2
        risk = random.randint(60, 100) if is_scam else random.randint(0, 30)
        verdict = VerdictType.SCAM if is_scam else VerdictType.SAFE
        
        c = Complaint(
            message=f"I received a suspicious call claiming to be {scam.value}. They asked for money.",
            phone=f"+91{random.randint(6000000000, 9999999999)}",
            source=random.choice(["call", "sms", "whatsapp"]),
            location={"type": "Point", "coordinates": [lng, lat]},
            state=city["state"],
            district=city["district"],
            amount_lost=random.choice([0, 0, 5000, 15000, 50000, 100000]) if is_scam else 0,
            verdict=verdict,
            risk_score=risk,
            confidence=random.uniform(0.7, 0.99),
            scam_type=scam,
            status=random.choice(["analyzing", "investigated", "closed"]),
            created_at=now - timedelta(days=random.randint(0, 30)),
            updated_at=now - timedelta(days=random.randint(0, 5))
        )
        complaints.append(c)
        await c.insert()
    return complaints

async def seed_fraud_network():
    logger.info("Seeding fraud network graph...")
    # Create 3 communities
    nodes = []
    edges = []
    
    for comm_id in range(1, 4):
        # Suspect (Ring Leader)
        leader_id = f"suspect_{comm_id}"
        leader = FraudNode(
            node_id=leader_id,
            node_type=NodeType.SUSPECT,
            label=f"Suspect {comm_id}",
            properties={"name": f"Unknown {comm_id}", "location": "Jamtara"},
            risk_score=95,
            is_ring_leader=True,
            is_flagged=True,
            community=comm_id
        )
        nodes.append(leader)
        
        # Money Mule Accounts
        for m in range(2):
            mule_id = f"mule_{comm_id}_{m}"
            mule = FraudNode(
                node_id=mule_id,
                node_type=NodeType.BANK_ACCOUNT,
                label=f"Mule Acct {m}",
                properties={"bank_account": f"0000{random.randint(1000,9999)}", "bank": "SBI"},
                risk_score=85,
                is_money_mule=True,
                is_flagged=True,
                community=comm_id
            )
            nodes.append(mule)
            # Leader uses mule
            edges.append(FraudEdge(source_node_id=leader_id, target_node_id=mule_id, edge_type=EdgeType.TRANSFERRED_TO, weight=0.9))
            
            # Victims connected to mule
            for v in range(3):
                vic_id = f"victim_{comm_id}_{m}_{v}"
                vic = FraudNode(
                    node_id=vic_id,
                    node_type=NodeType.VICTIM,
                    label=f"Victim {v}",
                    properties={"name": f"Citizen {v}", "city": "Pune"},
                    risk_score=10,
                    community=comm_id
                )
                nodes.append(vic)
                edges.append(FraudEdge(source_node_id=vic_id, target_node_id=mule_id, edge_type=EdgeType.TRANSFERRED_TO, weight=0.5))
                
        # Phones used by leader
        for p in range(2):
            phone_id = f"phone_{comm_id}_{p}"
            phone = FraudNode(
                node_id=phone_id,
                node_type=NodeType.PHONE,
                label=f"Burner {p}",
                properties={"phone_number": f"+9198765{random.randint(10000,99999)}"},
                risk_score=90,
                is_flagged=True,
                community=comm_id
            )
            nodes.append(phone)
            edges.append(FraudEdge(source_node_id=leader_id, target_node_id=phone_id, edge_type=EdgeType.USES_DEVICE, weight=0.8))
            
    for n in nodes:
        await n.insert()
    for e in edges:
        await e.insert()

async def seed_hotspots():
    logger.info("Seeding crime hotspots...")
    hotspots = []
    for city in CITIES:
        count = random.randint(5, 50)
        h = CrimeHotspot(
            state=city["state"],
            district=city["district"],
            fraud_count=count,
            coordinates={"type": "Point", "coordinates": [city["lng"], city["lat"]]},
            risk_score=min(100, count * 2),
            risk_level="critical" if count > 30 else ("high" if count > 15 else "medium"),
            trend=random.choice(["increasing", "stable"]),
            total_amount_lost=count * random.randint(1000, 10000),
            top_crime_types=[ScamType.DIGITAL_ARREST.value, ScamType.UPI_FRAUD.value]
        )
        hotspots.append(h)
        await h.insert()

async def seed_currency_checks():
    logger.info("Seeding counterfeit checks...")
    now = datetime.now(timezone.utc)
    for i in range(15):
        is_genuine = random.random() > 0.4
        c = CurrencyCheck(
            image_path=f"dummy_{i}.jpg",
            denomination=random.choice([500, 2000, 200, 100]),
            prediction=CurrencyVerdict.GENUINE if is_genuine else CurrencyVerdict.COUNTERFEIT,
            confidence=random.uniform(0.75, 0.99),
            watermark="pass" if is_genuine else "fail",
            security_thread="pass" if is_genuine else "fail",
            micro_text="pass",
            color_shift_ink="pass",
            serial_pattern="pass",
            intaglio_print="pass",
            ashoka_emblem="pass",
            serial_number=f"00{random.randint(10000, 99999)}",
            analyst_id="admin_id",
            created_at=now - timedelta(days=random.randint(0, 10))
        )
        await c.insert()

async def main():
    logger.info("Starting Database Seeder...")
    await connect_to_mongodb()
    
    await clear_collections()
    await seed_users()
    await seed_complaints()
    await seed_fraud_network()
    await seed_hotspots()
    await seed_currency_checks()
    
    logger.info("✅ Database seeded successfully!")
    await close_mongodb_connection()

if __name__ == "__main__":
    asyncio.run(main())
