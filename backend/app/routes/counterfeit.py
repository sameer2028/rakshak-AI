"""
Rakshak AI - Counterfeit Detection Routes

POST /api/currency/check       - Upload image for detection
GET  /api/currency/history     - List past detections
GET  /api/currency/record/{id} - Get detection details
"""

from fastapi import APIRouter, Depends, File, UploadFile, Form, Query
from typing import Optional

from app.schemas.counterfeit import (
    CounterfeitDetectResponse,
    CounterfeitHistoryResponse,
)
from app.middleware.dependencies import require_roles
from app.models.user import User
from app.services.counterfeit_service import CounterfeitService

router = APIRouter(prefix="/currency", tags=["Counterfeit Currency Detection"])


@router.post("/check", response_model=CounterfeitDetectResponse)
async def detect_counterfeit(
    image: UploadFile = File(..., description="Currency note image"),
    denomination: Optional[int] = Form(default=None),
    current_user: User = Depends(require_roles(["police", "bank", "admin"])),
):
    """Upload a currency image for counterfeit detection."""
    service = CounterfeitService()
    return await service.detect(image, denomination, current_user)


@router.get("/history", response_model=CounterfeitHistoryResponse)
async def get_history(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    prediction: Optional[str] = Query(default=None),
    current_user: User = Depends(require_roles(["police", "bank", "admin"])),
):
    """Get paginated list of past counterfeit detections."""
    service = CounterfeitService()
    return await service.get_history(page, page_size, prediction)


@router.get("/record/{record_id}", response_model=CounterfeitDetectResponse)
async def get_record(
    record_id: str,
    current_user: User = Depends(require_roles(["police", "bank", "admin"])),
):
    """Get details of a specific counterfeit detection record."""
    service = CounterfeitService()
    return await service.get_record(record_id)
