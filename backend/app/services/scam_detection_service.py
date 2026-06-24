"""
Rakshak AI - Scam Detection Service

Business logic for digital arrest scam detection.
Orchestrates NLP models to analyze call transcripts for scam patterns.
"""

from datetime import datetime, timezone
import time
from typing import Optional, List

from app.models.complaint import Complaint, ScamType, VerdictType
from app.models.user import User
from app.schemas.scam_detection import (
    ScamAnalyzeRequest,
    ScamAnalyzeResponse,
    ScamStatusUpdateRequest,
    ScamDetectionSummary,
    ScamDetectionListResponse,
    ThreatIndicator,
)
from app.schemas.auth import MessageResponse
from app.middleware.exceptions import NotFoundException
from app.ml.scam_nlp import nlp_engine
from loguru import logger


class ScamDetectionService:
    """Scam transcript analysis and detection logic."""

    async def analyze(self, request: ScamAnalyzeRequest, user: User) -> ScamAnalyzeResponse:
        """Analyze a call transcript for digital arrest scam patterns."""
        start_time = time.time()

        # ML NLP scam classifier
        result = self._ml_scam_analysis(request)

        response_time_ms = int((time.time() - start_time) * 1000)

        # Persist as complaint
        complaint = Complaint(
            message=request.transcript,
            phone=request.phone_metadata.caller_number if request.phone_metadata else None,
            source="call",
            verdict=VerdictType.SCAM if result["is_scam"] else VerdictType.SAFE,
            risk_score=result["risk_score"],
            confidence=result["confidence"],
            scam_type=result["scam_type_enum"],
            reasons=[ti["indicator"] for ti in result["threat_indicators"]],
            threat_indicators=result["threat_indicators"],
            recommended_actions=result["recommended_actions"],
            response_time_ms=response_time_ms,
            status="analyzed",
        )
        await complaint.insert()

        return ScamAnalyzeResponse(
            detection_id=str(complaint.id),
            is_scam=result["is_scam"],
            scam_type=result["scam_type"],
            risk_score=result["risk_score"],
            confidence=result["confidence"],
            threat_indicators=[ThreatIndicator(**ti) for ti in result["threat_indicators"]],
            recommended_actions=result["recommended_actions"],
            analyzed_at=complaint.created_at,
        )

    async def list_detections(
        self, page: int, page_size: int, scam_type: Optional[str], status: Optional[str]
    ) -> ScamDetectionListResponse:
        """List scam detections with filters."""
        query = Complaint.find(Complaint.source == "call")

        if scam_type:
            query = query.find(Complaint.scam_type == scam_type)
        if status:
            query = query.find(Complaint.status == status)

        total = await query.count()
        skip = (page - 1) * page_size

        detections = await query.sort(-Complaint.created_at).skip(skip).limit(page_size).to_list()

        return ScamDetectionListResponse(
            detections=[
                ScamDetectionSummary(
                    detection_id=str(d.id),
                    is_scam=d.verdict == VerdictType.SCAM,
                    scam_type=d.scam_type.value if d.scam_type else "unknown",
                    risk_score=d.risk_score,
                    status=d.status.value if d.status else "pending",
                    created_at=d.created_at,
                )
                for d in detections
            ],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def update_status(
        self, detection_id: str, request: ScamStatusUpdateRequest, user: User
    ) -> MessageResponse:
        """Update the status of a scam detection."""
        complaint = await Complaint.get(detection_id)
        if not complaint:
            raise NotFoundException("Scam detection", detection_id)

        complaint.status = request.status
        complaint.assigned_to = str(user.id)
        complaint.updated_at = datetime.now(timezone.utc)
        await complaint.save()

        return MessageResponse(message=f"Detection {detection_id} status updated to {request.status}")

    def _ml_scam_analysis(self, request: ScamAnalyzeRequest) -> dict:
        """ML NLP scam analysis."""
        transcript_lower = request.transcript.lower()
        threat_indicators = []
        
        # 1. NLP Classification
        nlp_result = nlp_engine.classify(request.transcript)
        is_scam = nlp_result["is_scam"]
        detected_scam_type = nlp_result["scam_type"] or "unknown"
        confidence = nlp_result["probability"]
        
        # 2. Extract Threat Indicators for Explanation
        # We augment the ML decision with explainable threat indicators
        risk_score = nlp_result["risk_score"]

        # Impersonation detection for explanation
        impersonation_patterns = {
            "cbi": "Fake CBI Impersonation",
            "enforcement directorate": "Fake ED Impersonation",
            "ed ": "Fake ED Impersonation",
            "customs": "Fake Customs Impersonation",
            "police": "Government Impersonation",
        }

        for keyword, label in impersonation_patterns.items():
            if keyword in transcript_lower:
                threat_indicators.append({
                    "indicator": label,
                    "category": "impersonation",
                    "severity": "critical",
                    "evidence": f"Contains keyword: '{keyword}'",
                })

        # Fear language
        fear_words = ["arrest", "warrant", "jail", "prison", "case filed", "FIR", "digital arrest"]
        for word in fear_words:
            if word.lower() in transcript_lower:
                threat_indicators.append({
                    "indicator": f"Fear language: '{word}'",
                    "category": "fear_language",
                    "severity": "high",
                    "evidence": f"Transcript contains fear-inducing term: '{word}'",
                })

        # Money demand
        money_words = ["transfer", "pay", "lakh", "crore", "send money", "NEFT", "RTGS", "UPI"]
        for word in money_words:
            if word.lower() in transcript_lower:
                threat_indicators.append({
                    "indicator": f"Urgent money demand: '{word}'",
                    "category": "money_demand",
                    "severity": "high",
                    "evidence": f"Financial transaction term detected: '{word}'",
                })

        # VoIP detection
        if request.phone_metadata and request.phone_metadata.is_voip:
            threat_indicators.append({
                "indicator": "VoIP/Spoofed call detected",
                "category": "spoofing",
                "severity": "medium",
                "evidence": "Call originated from VoIP service",
            })

        recommended_actions = []
        if is_scam:
            recommended_actions = [
                "Do NOT transfer any money",
                "Disconnect the call immediately",
                "Report to cybercrime.gov.in",
                "Call 1930 (Cyber Crime Helpline)",
                "Block the caller's number",
            ]

        scam_type_enum = None
        if detected_scam_type != "unknown":
            try:
                scam_type_enum = ScamType(detected_scam_type)
            except ValueError:
                scam_type_enum = ScamType.OTHER

        return {
            "is_scam": is_scam,
            "scam_type": detected_scam_type,
            "scam_type_enum": scam_type_enum,
            "risk_score": risk_score,
            "confidence": confidence,
            "threat_indicators": threat_indicators,
            "recommended_actions": recommended_actions,
        }
