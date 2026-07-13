"""
Rakshak AI Intelligence Grid - Alert Document Model

Live alerts for the Police Command Center dashboard.
Used by: Police Command Center, all modules generate alerts.
"""

from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from beanie import Document, Indexed
from pydantic import Field


class AlertType(str, Enum):
    SCAM_DETECTED = "scam_detected"
    FRAUD_RING = "fraud_ring"
    COUNTERFEIT = "counterfeit"
    HIGH_RISK_ACCOUNT = "high_risk_account"
    CROSS_STATE = "cross_state"
    MONEY_MULE = "money_mule"
    MASS_ATTACK = "mass_attack"


class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Alert(Document):
    """Live alert for the Police Command Center."""

    alert_type: AlertType = Field(...)
    severity: AlertSeverity = Field(...)
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=1000)

    # Source
    source_module: str = Field(
        ...,
        description="citizen_shield | scam_detection | fraud_network | heatmap | counterfeit",
    )
    reference_id: Optional[str] = Field(
        default=None,
        description="ID of the related complaint/detection/node",
    )

    # Additional Context
    metadata: dict = Field(default_factory=dict)

    # State
    is_read: bool = Field(default=False)
    is_resolved: bool = Field(default=False)
    assigned_to: Optional[str] = Field(default=None)
    resolved_by: Optional[str] = Field(default=None)
    resolved_at: Optional[datetime] = Field(default=None)

    # Location
    state: Optional[str] = Field(default=None)
    district: Optional[str] = Field(default=None)

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "alerts"
        indexes = [
            "alert_type",
            "severity",
            "is_read",
            "is_resolved",
            "source_module",
            "created_at",
        ]
