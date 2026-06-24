"""
Rakshak AI Intelligence Grid - Crime Hotspot Document Model

Aggregated crime density data for geospatial visualization.
Used by: Crime Heatmap, Geospatial Crime Engine
"""

from datetime import datetime, timezone
from typing import Optional, List

from beanie import Document, Indexed
from pydantic import Field


class CrimeHotspot(Document):
    """District-level crime density record for heatmap visualization."""

    # Location
    district: str = Field(...)
    state: Indexed(str)  # type: ignore[valid-type]
    coordinates: dict = Field(
        ...,
        description="GeoJSON Point: {type: 'Point', coordinates: [lng, lat]}",
    )

    # Crime Statistics
    fraud_count: int = Field(default=0, ge=0)
    total_amount_lost: float = Field(default=0.0, ge=0.0)

    # Breakdown by Crime Type
    crime_breakdown: dict = Field(
        default_factory=dict,
        description="Crime counts by type: {upi_fraud: 10, digital_arrest: 5, ...}",
    )

    # Risk Assessment
    risk_level: str = Field(
        default="low",
        description="low | medium | high | critical",
    )
    risk_score: int = Field(default=0, ge=0, le=100)

    # Trend
    trend: str = Field(
        default="stable",
        description="increasing | stable | decreasing",
    )
    trend_data: List[dict] = Field(
        default_factory=list,
        description="Weekly crime counts for trend chart",
    )

    # Top Crime Types
    top_crime_types: List[str] = Field(default_factory=list)

    # Metadata
    period: str = Field(default="monthly", description="daily | weekly | monthly | yearly")
    last_computed: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "crime_hotspots"
        indexes = [
            "state",
            "district",
            "risk_level",
            [("coordinates", "2dsphere")],
        ]
