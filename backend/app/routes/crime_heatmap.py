"""
Rakshak AI - Crime Heatmap Routes

GET /api/heatmap/points    - Get crime coordinates
GET /api/heatmap/stats     - Aggregate crime statistics
GET /api/heatmap/districts - District-level risk ranking
"""

from fastapi import APIRouter, Depends, Query
from typing import Optional

from app.schemas.crime_heatmap import (
    HeatmapResponse,
    HeatmapStatsResponse,
    DistrictRiskResponse,
)
from app.middleware.dependencies import get_current_user, require_roles
from app.models.user import User
from app.services.crime_heatmap_service import CrimeHeatmapService

router = APIRouter(prefix="/heatmap", tags=["Crime Heatmap"])


@router.get("/points", response_model=HeatmapResponse)
async def get_heatmap_points(
    crime_type: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
):
    """Get crime data points for heatmap visualization."""
    service = CrimeHeatmapService()
    return await service.get_points(crime_type, state, district, date_from, date_to)


@router.get("/stats", response_model=HeatmapStatsResponse)
async def get_stats(
    state: Optional[str] = Query(default=None),
    current_user: User = Depends(require_roles(["police", "admin", "analyst"])),
):
    """Get aggregated crime statistics."""
    service = CrimeHeatmapService()
    return await service.get_stats(state)


@router.get("/districts", response_model=DistrictRiskResponse)
async def get_districts(
    state: Optional[str] = Query(default=None),
    risk_level: Optional[str] = Query(default=None),
    current_user: User = Depends(require_roles(["police", "admin", "analyst"])),
):
    """Get district-level risk rankings."""
    service = CrimeHeatmapService()
    return await service.get_district_risks(state, risk_level)
