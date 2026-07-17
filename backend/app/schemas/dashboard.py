"""
Rakshak AI - Dashboard Schemas

Request/Response schemas for Police Command Center dashboard endpoints.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


# ─── Responses ───────────────────────────────────────────────────

class TopCommunity(BaseModel):
    id: str
    nodes: int
    risk: int
    main_type: str


class TrendInfo(BaseModel):
    """Week-over-week trend for a stat card."""
    value: int = Field(default=0, description="Percentage change vs last week")
    is_positive: bool = Field(default=True, description="True if trending upward")


class DashboardOverview(BaseModel):
    """Command Center summary statistics."""
    total_scams_detected: int
    total_scams_blocked: int
    active_fraud_rings: int
    districts_at_risk: int
    counterfeit_notes_detected: int
    total_amount_saved: float
    top_communities: List[TopCommunity] = Field(default_factory=list)
    trends: dict = Field(
        default_factory=dict,
        description="scams_last_7_days, fraud_rings_last_7_days, complaints_last_7_days",
    )
    scams_trend: TrendInfo = Field(default_factory=TrendInfo)
    fraud_rings_trend: TrendInfo = Field(default_factory=TrendInfo)
    hotspots_trend: TrendInfo = Field(default_factory=TrendInfo)
    counterfeit_trend: TrendInfo = Field(default_factory=TrendInfo)
    last_updated: datetime


class AlertEvidenceResponse(BaseModel):
    """Evidence data associated with an alert."""
    evidence_text: str
    evidence_type: str = Field(default="transcript")

class AlertItem(BaseModel):
    """Single alert in the live feed."""
    id: str
    alert_type: str
    severity: str
    title: str
    description: str
    source_module: str
    reference_id: Optional[str] = None
    metadata: dict = Field(default_factory=dict)
    state: Optional[str] = None
    district: Optional[str] = None
    is_read: bool
    is_resolved: bool
    created_at: datetime


class AlertsResponse(BaseModel):
    """Live alerts feed response."""
    alerts: List[AlertItem]
    total: int
    unread_count: int


class HighRiskAccount(BaseModel):
    """Flagged high-risk account."""
    account_id: str
    account_type: str = Field(description="phone | upi | bank_account")
    identifier: str
    risk_score: int
    fraud_count: int
    total_amount: float
    last_activity: datetime


class HighRiskAccountsResponse(BaseModel):
    """List of flagged high-risk accounts."""
    accounts: List[HighRiskAccount]
    total: int


class RecentComplaint(BaseModel):
    """Recent complaint summary."""
    complaint_id: str
    victim_name: Optional[str] = None
    scam_type: Optional[str] = None
    amount_lost: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    status: str
    reported_at: datetime


class RecentComplaintsResponse(BaseModel):
    """List of recent complaints."""
    complaints: List[RecentComplaint]
    total: int
