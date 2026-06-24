"""
Rakshak AI Intelligence Grid - Transaction Document Model

Stores financial transactions for fraud detection and risk analysis.
Used by: Fraud Risk Engine, Fraud Network Intelligence
"""

from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from beanie import Document, Indexed
from pydantic import Field


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Transaction(Document):
    """Financial transaction record for fraud analysis."""

    # Transaction Details
    transaction_id: Indexed(str, unique=True)  # type: ignore[valid-type]
    account: str = Field(..., description="Source bank account")
    upi: Optional[str] = Indexed(str, default=None)  # type: ignore[valid-type]
    amount: float = Field(..., gt=0)
    receiver_account: Optional[str] = Field(default=None)
    receiver_upi: Optional[str] = Field(default=None)
    receiver_name: Optional[str] = Field(default=None)

    # Transaction Metadata
    transaction_type: str = Field(default="upi", description="upi | neft | rtgs | imps")
    channel: str = Field(default="mobile", description="mobile | web | atm | pos")

    # Risk Analysis
    risk_score: int = Field(default=0, ge=0, le=100)
    risk_level: RiskLevel = Field(default=RiskLevel.LOW)
    is_flagged: bool = Field(default=False)
    fraud_indicators: list = Field(default_factory=list)

    # Velocity Features (computed)
    daily_transaction_count: Optional[int] = Field(default=None)
    daily_transaction_amount: Optional[float] = Field(default=None)
    unique_receivers_24h: Optional[int] = Field(default=None)

    # Timestamps
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "transactions"
        indexes = [
            "transaction_id",
            "account",
            "upi",
            "receiver_account",
            "risk_level",
            "is_flagged",
            "timestamp",
        ]
