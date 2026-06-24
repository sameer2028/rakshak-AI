"""
Rakshak AI - Crime Heatmap Schemas

Request/Response schemas for Crime Heatmap endpoints.
"""

from typing import Optional, List

from pydantic import BaseModel, Field


# ─── Responses ───────────────────────────────────────────────────

class HeatmapPoint(BaseModel):
    coordinates: List[float] # [lng, lat]
    district: str
    state: str
    risk_level: str
    count: int
    types: dict = {}


class HeatmapResponse(BaseModel):
    """Crime heatmap data points."""
    points: List[HeatmapPoint]
    total: int
    filters_applied: dict = {}


class DistrictRisk(BaseModel):
    state: str
    district: str
    total_crimes: int
    risk_level: str = Field(description="low | medium | high | critical")
    risk_score: int = Field(ge=0, le=100)
    top_crime_type: str
    trend: str = Field(description="increasing | stable | decreasing")
    amount_lost_total: float = 0.0


class DistrictRiskResponse(BaseModel):
    """District-level risk ranking."""
    districts: List[DistrictRisk]
    total: int


class HeatmapStatsResponse(BaseModel):
    """Aggregated crime statistics."""
    total_crimes: int
    total_amount_lost: float
    states_affected: int
    districts_affected: int
    crime_type_breakdown: dict = {}
    monthly_trend: List[dict] = []
