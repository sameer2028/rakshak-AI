"""
Rakshak AI - Counterfeit Detection Schemas

Request/Response schemas for Counterfeit Currency Detection endpoints.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


# ─── Responses ───────────────────────────────────────────────────

class SecurityFeatureResult(BaseModel):
    watermark: str = Field(description="pass | fail | inconclusive")
    security_thread: str = Field(description="pass | fail | inconclusive")
    micro_text: str = Field(description="pass | fail | inconclusive")
    color_shift_ink: str = Field(description="pass | fail | inconclusive")
    serial_pattern: str = Field(description="pass | fail | inconclusive")
    intaglio_print: str = Field(description="pass | fail | inconclusive")
    ashoka_emblem: str = Field(description="pass | fail | inconclusive")


class AnomalyRegion(BaseModel):
    x: int
    y: int
    width: int
    height: int
    description: str


class CounterfeitDetectResponse(BaseModel):
    """AI detection result for a currency image."""
    record_id: str
    prediction: str = Field(description="GENUINE | COUNTERFEIT")
    confidence: float = Field(ge=0.0, le=1.0)
    denomination: Optional[int] = None
    serial_number: Optional[str] = None
    security_features: SecurityFeatureResult
    anomaly_regions: List[AnomalyRegion] = []
    analyzed_at: datetime


class CounterfeitRecordSummary(BaseModel):
    """Summary of a past counterfeit detection."""
    record_id: str
    prediction: str
    confidence: float
    denomination: Optional[int] = None
    serial_number: Optional[str] = None
    created_at: datetime


class CounterfeitHistoryResponse(BaseModel):
    """Paginated list of past counterfeit detections."""
    records: List[CounterfeitRecordSummary]
    total: int
    page: int
    page_size: int
