"""
Rakshak AI Intelligence Grid - Currency Check Document Model

Stores counterfeit currency detection results.
Used by: Counterfeit Vision AI
"""

from datetime import datetime, timezone
from typing import Optional, List
from enum import Enum

from beanie import Document, Indexed
from pydantic import BaseModel, Field


class CurrencyVerdict(str, Enum):
    GENUINE = "GENUINE"
    COUNTERFEIT = "COUNTERFEIT"


class FeatureStatus(str, Enum):
    PASS = "pass"
    FAIL = "fail"
    INCONCLUSIVE = "inconclusive"


class SecurityFeatures(BaseModel):
    """Security feature check results for a currency note."""
    pass


class CurrencyCheck(Document):
    """Counterfeit currency detection record."""

    # Image Data
    image_path: str = Field(..., description="Path to uploaded currency image")
    denomination: Optional[int] = Field(default=None, description="100, 200, 500, 2000")

    # AI Detection Result
    prediction: CurrencyVerdict = Field(...)
    confidence: float = Field(..., ge=0.0, le=1.0)

    # Security Feature Analysis
    watermark: Optional[str] = Field(default=None, description="pass | fail | inconclusive")
    security_thread: Optional[str] = Field(default=None)
    micro_text: Optional[str] = Field(default=None)
    color_shift_ink: Optional[str] = Field(default=None)
    serial_pattern: Optional[str] = Field(default=None)
    intaglio_print: Optional[str] = Field(default=None)
    ashoka_emblem: Optional[str] = Field(default=None)

    # Serial Number
    serial_number: Optional[Indexed(str)] = Field(default=None)  # type: ignore[valid-type]

    # Anomaly Regions (bounding boxes on the image)
    anomaly_regions: List[dict] = Field(
        default_factory=list,
        description="List of {x, y, width, height, description}",
    )

    # Location
    location: Optional[dict] = Field(default=None)
    state: Optional[str] = Field(default=None)
    district: Optional[str] = Field(default=None)

    # Metadata
    analyst_id: Optional[str] = Field(default=None, description="User who uploaded")
    model_version: str = Field(default="v1.0")

    # Timestamps
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "currency_checks"
        indexes = [
            "prediction",
            "serial_number",
            "denomination",
            "created_at",
        ]
