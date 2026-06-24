"""
Rakshak AI - Citizen Shield Routes

POST /api/citizen/check     - Analyze input for fraud
GET  /api/citizen/history   - Get user's past reports
GET  /api/citizen/report/{id} - Get specific report detail
"""

from fastapi import APIRouter, Depends, Query

from app.schemas.citizen_shield import (
    FraudCheckRequest,
    FraudCheckResponse,
    FraudHistoryResponse,
)
from app.middleware.dependencies import get_current_user
from app.models.user import User
from app.services.citizen_shield_service import CitizenShieldService

router = APIRouter(prefix="/citizen", tags=["Citizen Fraud Shield"])


@router.post("/check", response_model=FraudCheckResponse)
async def check_fraud(
    request: FraudCheckRequest,
    current_user: User = Depends(get_current_user),
):
    """Analyze citizen input for fraud. Returns verdict, risk score, and reasons."""
    service = CitizenShieldService()
    return await service.analyze(request, current_user)


@router.get("/history", response_model=FraudHistoryResponse)
async def get_history(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    """Get paginated list of the current user's past fraud reports."""
    service = CitizenShieldService()
    return await service.get_history(current_user, page, page_size)


@router.get("/report/{report_id}", response_model=FraudCheckResponse)
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get details of a specific fraud report."""
    service = CitizenShieldService()
    return await service.get_report(report_id, current_user)
