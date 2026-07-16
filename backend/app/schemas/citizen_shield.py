"""
Rakshak AI - Citizen Shield Schemas

Request/Response schemas for Citizen Fraud Shield endpoints.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


# ─── Requests ────────────────────────────────────────────────────

class FraudCheckRequest(BaseModel):
    """Input from citizen to check for fraud."""
    message: Optional[str] = Field(default=None, max_length=5000)
    phone_number: Optional[str] = Field(default=None, max_length=15)
    upi_id: Optional[str] = Field(default=None, max_length=100)
    email: Optional[str] = Field(default=None, max_length=200)
    source: str = Field(
        default="manual",
        description="sms | whatsapp | email | call | manual",
    )


# ─── Responses ───────────────────────────────────────────────────

class FraudNetworkMatch(BaseModel):
    """Result of checking reported entities in the fraud network graph."""
    matched: bool = False
    entity_type: Optional[str] = None  # "phone" | "upi" | "email"
    entity_value: Optional[str] = None
    community_name: Optional[str] = None


class FraudCheckResponse(BaseModel):
    """AI analysis result for a fraud check."""
    report_id: str
    verdict: str = Field(description="SCAM | SAFE | SUSPICIOUS")
    risk_score: int = Field(ge=0, le=100)
    confidence: float = Field(ge=0.0, le=1.0)
    reasons: List[str]
    matched_patterns: List[str]
    response_time_ms: int
    analyzed_at: datetime
    fraud_network_match: Optional[FraudNetworkMatch] = None



class FraudReportSummary(BaseModel):
    """Summary of a past fraud report."""
    report_id: str
    verdict: str
    risk_score: int
    scam_type: Optional[str] = None
    source: str
    created_at: datetime


class FraudHistoryResponse(BaseModel):
    """Paginated list of past fraud reports."""
    reports: List[FraudReportSummary]
    total: int
    page: int
    page_size: int
