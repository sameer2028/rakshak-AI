"""
Rakshak AI Intelligence Grid - Complaint Document Model

Stores citizen fraud complaints with scam analysis results.
Used by: Citizen Fraud Shield, Digital Arrest Scam Detection
"""

from datetime import datetime, timezone
from typing import Optional, List
from enum import Enum

from beanie import Document, Indexed
from pydantic import BaseModel, Field


class ComplaintStatus(str, Enum):
    REPORTED = "reported"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    INVESTIGATED = "investigated"
    RESOLVED = "resolved"
    CLOSED = "closed"


class ScamType(str, Enum):
    DIGITAL_ARREST = "digital_arrest"
    FAKE_CBI = "fake_cbi"
    FAKE_ED = "fake_ed"
    FAKE_CUSTOMS = "fake_customs"
    UPI_FRAUD = "upi_fraud"
    PHISHING = "phishing"
    LOAN_FRAUD = "loan_fraud"
    VIDEO_SCAM = "video_scam"
    IDENTITY_THEFT = "identity_theft"
    OTHER = "other"


class VerdictType(str, Enum):
    SCAM = "SCAM"
    SAFE = "SAFE"
    SUSPICIOUS = "SUSPICIOUS"


class LocationData(BaseModel):
    """GeoJSON Point for geospatial queries."""
    type: str = "Point"
    coordinates: List[float]


class Complaint(Document):
    """Citizen fraud complaint with AI analysis results."""

    # Victim Information
    victim_name: Optional[str] = Field(default=None)
    victim_phone: Optional[str] = Field(default=None)
    victim_age: Optional[int] = Field(default=None)
    victim_gender: Optional[str] = Field(default=None)

    # Reported Input
    phone: Optional[Indexed(str)] = Field(default=None)  # type: ignore[valid-type]
    upi: Optional[Indexed(str)] = Field(default=None)  # type: ignore[valid-type]
    message: Optional[str] = Field(default=None)
    email: Optional[str] = Field(default=None)
    source: str = Field(default="manual", description="sms | whatsapp | email | call | manual")

    # AI Analysis Result
    verdict: Optional[VerdictType] = Field(default=None)
    risk_score: int = Field(default=0, ge=0, le=100)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    scam_type: Optional[ScamType] = Field(default=None)
    reasons: List[str] = Field(default_factory=list)
    matched_patterns: List[str] = Field(default_factory=list)
    threat_indicators: List[dict] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)
    model_version: str = Field(default="v1.0")
    response_time_ms: Optional[int] = Field(default=None)

    # Location
    location: Optional[dict] = Field(
        default=None,
        description="GeoJSON Point: {type: 'Point', coordinates: [lng, lat]}",
    )
    state: Optional[str] = Field(default=None)
    district: Optional[str] = Field(default=None)

    # Financial
    amount_lost: Optional[float] = Field(default=None, ge=0)

    # Status
    status: ComplaintStatus = Field(default=ComplaintStatus.REPORTED)
    assigned_to: Optional[str] = Field(default=None, description="Officer user ID")

    # Timestamps
    reported_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "complaints"
        indexes = [
            "phone",
            "upi",
            "verdict",
            "scam_type",
            "state",
            "district",
            "status",
            "reported_at",
            [("location", "2dsphere")],
        ]
