"""
Rakshak AI - Scam Detection Schemas

Request/Response schemas for Digital Arrest Scam Detection endpoints.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


# ─── Requests ────────────────────────────────────────────────────

class PhoneMetadata(BaseModel):
    caller_number: Optional[str] = None
    receiver_number: Optional[str] = None
    call_duration_sec: Optional[int] = None
    is_voip: Optional[bool] = None


class ScamAnalyzeRequest(BaseModel):
    """Input for scam transcript analysis."""
    transcript: str = Field(..., min_length=10, max_length=10000)
    phone_metadata: Optional[PhoneMetadata] = None
    message: Optional[str] = Field(default=None, max_length=5000)


class ScamStatusUpdateRequest(BaseModel):
    """Update detection status."""
    status: str = Field(..., description="pending | analyzed | escalated | resolved")


# ─── Responses ───────────────────────────────────────────────────

class ThreatIndicator(BaseModel):
    indicator: str
    category: str = Field(
        description="impersonation | fear_language | money_demand | sensitive_info | spoofing | fraud_network | pressure_tactic"
    )
    severity: str = Field(description="low | medium | high | critical")
    evidence: str


class ScamAnalyzeResponse(BaseModel):
    """AI analysis result for scam detection."""
    detection_id: str
    is_scam: bool
    scam_type: str = Field(
        description="fake_cbi | fake_ed | fake_customs | digital_arrest | video_scam | unknown"
    )
    risk_score: int = Field(ge=0, le=100)
    confidence: float = Field(ge=0.0, le=1.0)
    threat_indicators: List[ThreatIndicator]
    recommended_actions: List[str]
    analyzed_at: datetime
    fraud_network_match: Optional[dict] = Field(
        default=None,
        description="If a phone/UPI/bank was found in the fraud intelligence graph, details are here",
    )


class ScamDetectionSummary(BaseModel):
    """Summary of a past scam detection."""
    detection_id: str
    is_scam: bool
    scam_type: str
    risk_score: int
    status: str
    created_at: datetime


class ScamDetectionListResponse(BaseModel):
    """Paginated list of scam detections."""
    detections: List[ScamDetectionSummary]
    total: int
    page: int
    page_size: int
