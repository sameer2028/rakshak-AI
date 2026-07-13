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
    verdict_summary: str = Field(default="", description="Human-readable summary e.g. 'This note is FAKE'")
    reasons: List[str] = Field(default=[], description="List of reasons explaining the verdict")
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


# ─── CC Pipeline Schemas (upgraded multi-stage pipeline) ─────────────────

class CCImageQualityReport(BaseModel):
    """Image quality assessment result."""
    is_valid: bool
    sharpness_score: float
    brightness_score: float
    resolution: str
    checks: dict


class CCYoloDetection(BaseModel):
    """A single YOLO / CV layout security feature detection."""
    name: str
    confidence: float
    box: List[int] = Field(description="[xmin, ymin, xmax, ymax] in 1000x460 space")
    status: bool


class CCOcrResults(BaseModel):
    """OCR extraction results from the banknote."""
    serial_number: Optional[str] = None
    serial_number_valid: bool = False
    rbi_text_detected: bool = False
    rbi_text: Optional[str] = None
    governor_signature_detected: bool = False
    denomination_text: Optional[str] = None
    denomination_match: bool = False


class CCDecisionReport(BaseModel):
    """Weighted decision engine verdict."""
    is_genuine: bool
    confidence: float = Field(description="Aggregated confidence score 0–100")
    verdict_summary: str
    checklist: dict


class CCVerifyResponse(BaseModel):
    """Full CC pipeline verification response."""
    filename: str
    denomination: int
    quality_report: CCImageQualityReport
    preprocessed_images: dict = Field(description="Base64 encoded filtered images")
    yolo_detections: List[CCYoloDetection]
    ocr_results: CCOcrResults
    decision: CCDecisionReport
    grad_cam_heatmap: str = Field(description="Base64 Grad-CAM overlay PNG")
    created_at: datetime


class CCHistoryItem(BaseModel):
    """A single CC verification history record from MongoDB."""
    id: str
    filename: str
    denomination: int
    is_genuine: bool
    confidence: float
    quality_score: float
    ocr_serial_number: Optional[str] = None
    features_failed: List[str] = []
    created_at: datetime


class CCDashboardStats(BaseModel):
    """Aggregated analytics statistics for the CC dashboard."""
    total_scans: int
    genuine_count: int
    fake_count: int
    denomination_distribution: dict
    failure_rates: dict
    timeline_scans: List[dict]


class CCDenominationResponse(BaseModel):
    """Response schema for denomination auto-detection."""
    denomination: int
    detected: bool
    method: str
