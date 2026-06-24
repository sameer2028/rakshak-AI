"""
Rakshak AI Intelligence Grid - MongoDB Database Connection

Uses Motor (async MongoDB driver) with Beanie ODM for document models.
Provides async initialization and connection management.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from loguru import logger

from app.config.settings import settings

# MongoDB client instance (module-level singleton)
client: AsyncIOMotorClient | None = None


async def connect_to_mongodb() -> None:
    """Initialize MongoDB connection and Beanie ODM."""
    global client

    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    # Import all document models for Beanie initialization
    from app.models.user import User
    from app.models.complaint import Complaint
    from app.models.transaction import Transaction
    from app.models.fraud_node import FraudNode
    from app.models.fraud_edge import FraudEdge
    from app.models.device import Device
    from app.models.currency_check import CurrencyCheck
    from app.models.crime_hotspot import CrimeHotspot
    from app.models.alert import Alert

    await init_beanie(
        database=db,
        document_models=[
            User,
            Complaint,
            Transaction,
            FraudNode,
            FraudEdge,
            Device,
            CurrencyCheck,
            CrimeHotspot,
            Alert,
        ],
    )

    logger.info(f"Connected to MongoDB database: {settings.DATABASE_NAME}")


async def close_mongodb_connection() -> None:
    """Close the MongoDB connection."""
    global client

    if client:
        client.close()
        logger.info("MongoDB connection closed.")


def get_database():
    """Get the MongoDB database instance."""
    if client is None:
        raise RuntimeError("MongoDB client not initialized. Call connect_to_mongodb() first.")
    return client[settings.DATABASE_NAME]
