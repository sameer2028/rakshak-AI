"""
Rakshak AI - Crime Heatmap Service

Business logic for crime heatmap geospatial data.
Aggregates crime complaints into heatmap points and district-level risk scores.
"""

from typing import Optional

from app.models.complaint import Complaint
from app.models.crime_hotspot import CrimeHotspot
from app.schemas.crime_heatmap import (
    HeatmapPoint,
    HeatmapResponse,
    HeatmapStatsResponse,
    DistrictRisk,
    DistrictRiskResponse,
)
from loguru import logger


class CrimeHeatmapService:
    """Geospatial crime intelligence service."""

    async def get_points(
        self,
        crime_type: Optional[str],
        state: Optional[str],
        district: Optional[str],
        date_from: Optional[str],
        date_to: Optional[str],
    ) -> HeatmapResponse:
        """Get crime data points for heatmap visualization."""
        query_filter = {}
        filters_applied = {}

        if crime_type:
            query_filter["scam_type"] = crime_type
            filters_applied["crime_type"] = crime_type
        if state:
            query_filter["state"] = state
            filters_applied["state"] = state
        if district:
            query_filter["district"] = district
            filters_applied["district"] = district

        # MongoDB Aggregation Pipeline
        match_stage = {"location": {"$ne": None}, "district": {"$ne": None}}
        if crime_type:
            match_stage["scam_type"] = crime_type
        if state:
            match_stage["state"] = state
        if district:
            match_stage["district"] = district

        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": {"district": "$district", "state": "$state"},
                    "count": {"$sum": 1},
                    "total_risk": {"$sum": "$risk_score"},
                    # Get the coordinates of the first document in the group to represent the district
                    "coordinates": {"$first": "$location.coordinates"},
                    # Create an array of all scam types in this district
                    "scam_types": {"$push": "$scam_type"}
                }
            },
            {"$limit": 500}
        ]

        # Use Motor client directly via Beanie model
        cursor = Complaint.get_motor_collection().aggregate(pipeline)
        results = await cursor.to_list(length=500)

        points = []
        for res in results:
            # Calculate average risk
            avg_risk = res["total_risk"] / res["count"] if res["count"] > 0 else 0
            
            # Determine risk level
            if avg_risk >= 80:
                risk_level = "critical"
            elif avg_risk >= 60:
                risk_level = "high"
            elif avg_risk >= 40:
                risk_level = "medium"
            else:
                risk_level = "low"
                
            # Count crime types
            types_dict = {}
            for t in res.get("scam_types", []):
                if t:
                    types_dict[t] = types_dict.get(t, 0) + 1

            points.append(
                HeatmapPoint(
                    coordinates=res.get("coordinates", [0, 0]),
                    district=res["_id"].get("district", "Unknown"),
                    state=res["_id"].get("state", "Unknown"),
                    risk_level=risk_level,
                    count=res["count"],
                    types=types_dict,
                )
            )

        return HeatmapResponse(
            points=points,
            total=len(points),
            filters_applied=filters_applied,
        )

    async def get_stats(self, state: Optional[str]) -> HeatmapStatsResponse:
        """Get aggregated crime statistics."""
        query = Complaint.find()
        if state:
            query = query.find(Complaint.state == state)

        total = await query.count()
        complaints = await query.to_list()

        total_amount = sum(c.amount_lost or 0 for c in complaints)
        states = set(c.state for c in complaints if c.state)
        districts = set(c.district for c in complaints if c.district)

        # Crime type breakdown
        breakdown = {}
        for c in complaints:
            ctype = c.scam_type.value if c.scam_type else "other"
            breakdown[ctype] = breakdown.get(ctype, 0) + 1

        return HeatmapStatsResponse(
            total_crimes=total,
            total_amount_lost=total_amount,
            states_affected=len(states),
            districts_affected=len(districts),
            crime_type_breakdown=breakdown,
            monthly_trend=[],  # TODO: Compute monthly aggregation
        )

    async def get_district_risks(
        self, state: Optional[str], risk_level: Optional[str]
    ) -> DistrictRiskResponse:
        """Get district-level risk rankings."""
        query = CrimeHotspot.find()

        if state:
            query = query.find(CrimeHotspot.state == state)
        if risk_level:
            query = query.find(CrimeHotspot.risk_level == risk_level)

        hotspots = await query.sort(-CrimeHotspot.risk_score).to_list()

        districts = [
            DistrictRisk(
                state=h.state,
                district=h.district,
                total_crimes=h.fraud_count,
                risk_level=h.risk_level,
                risk_score=h.risk_score,
                top_crime_type=h.top_crime_types[0] if h.top_crime_types else "unknown",
                trend=h.trend,
                amount_lost_total=h.total_amount_lost,
            )
            for h in hotspots
        ]

        return DistrictRiskResponse(districts=districts, total=len(districts))
