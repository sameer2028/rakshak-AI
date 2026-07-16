"""
Rakshak AI - Scam Detection Routes

POST  /api/scam/analyze           - Analyze transcript for scam
GET   /api/scam/detections        - List all detections
PATCH /api/scam/detections/{id}   - Update detection status
"""

from fastapi import APIRouter, Depends, Query, File, UploadFile
from typing import Optional

from app.schemas.scam_detection import (
    ScamAnalyzeRequest,
    ScamAnalyzeResponse,
    ScamStatusUpdateRequest,
    ScamDetectionListResponse,
)
from app.schemas.auth import MessageResponse
from app.middleware.dependencies import get_current_user, require_roles
from app.models.user import User
from app.services.scam_detection_service import ScamDetectionService

try:
    from app.services.audio_service import extract_text_from_audio
except ImportError:
    from loguru import logger
    from fastapi import HTTPException, status
    logger.warning("audio_service could not be imported. Audio upload transcription features are disabled.")
    
    async def extract_text_from_audio(file):
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Audio transcription service is currently disabled because the audio_service module or speech dependencies are missing."
        )

router = APIRouter(prefix="/scam", tags=["Digital Arrest Scam Detection"])


@router.post("/analyze", response_model=ScamAnalyzeResponse)
async def analyze_scam(
    request: ScamAnalyzeRequest,
    current_user: User = Depends(require_roles(["police", "admin", "citizen"])),
):
    service = ScamDetectionService()
    return await service.analyze(request, current_user)

@router.post("/analyze-live", response_model=ScamAnalyzeResponse)
async def analyze_scam_live(
    request: ScamAnalyzeRequest,
    current_user: User = Depends(require_roles(["police", "admin", "citizen"])),
):
    """Analyze a call transcript in real-time (no DB insertion)."""
    service = ScamDetectionService()
    return await service.analyze_live(request)

@router.post("/analyze-audio", response_model=ScamAnalyzeResponse)
async def analyze_scam_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["police", "admin", "citizen"])),
):
    """Extract text from audio and analyze for scam patterns."""
    transcript = await extract_text_from_audio(file)
    
    # Create request object
    from app.schemas.scam_detection import ScamAnalyzeRequest, PhoneMetadata
    request = ScamAnalyzeRequest(
        transcript=transcript,
        phone_metadata=None
    )
    
    service = ScamDetectionService()
    return await service.analyze(request, current_user)



@router.get("/detections", response_model=ScamDetectionListResponse)
async def list_detections(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    scam_type: str = Query(default=None),
    status: str = Query(default=None),
    current_user: User = Depends(require_roles(["police", "admin"])),
):
    """List all scam detections with optional filters."""
    service = ScamDetectionService()
    return await service.list_detections(page, page_size, scam_type, status)


@router.patch("/detections/{detection_id}", response_model=MessageResponse)
async def update_status(
    detection_id: str,
    request: ScamStatusUpdateRequest,
    current_user: User = Depends(require_roles(["police", "admin"])),
):
    """Update the status of a scam detection."""
    service = ScamDetectionService()
    return await service.update_status(detection_id, request, current_user)
