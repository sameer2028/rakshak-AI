"""
Rakshak AI - Citizen Shield Service

Business logic for citizen fraud analysis.
Orchestrates ML models to analyze messages, phone numbers, UPIs, and emails.
"""

from datetime import datetime, timezone
import time
from typing import Optional

from app.models.complaint import Complaint, VerdictType
from app.models.alert import Alert, AlertType, AlertSeverity
from app.models.user import User
from app.schemas.citizen_shield import (
    FraudCheckRequest,
    FraudCheckResponse,
    FraudReportSummary,
    FraudHistoryResponse,
)
from app.middleware.exceptions import NotFoundException
from app.ml.fraud_classifier import fraud_classifier
from loguru import logger


class CitizenShieldService:
    """Fraud analysis orchestration for citizen reports."""

    async def analyze(self, request: FraudCheckRequest, user: User) -> FraudCheckResponse:
        """Run fraud analysis on citizen input and persist the report."""
        start_time = time.time()

        # ML analysis
        prediction_result = fraud_classifier.predict({
            "message": request.message,
            "phone_number": request.phone_number,
            "upi_id": request.upi_id
        })
        
        verdict = VerdictType(prediction_result["prediction"])
        risk_score = prediction_result["risk_score"]
        confidence = prediction_result["probability"]
        
        # We can extract some basic patterns based on keywords for explanation
        reasons, patterns = self._extract_reasons_and_patterns(request)

        response_time_ms = int((time.time() - start_time) * 1000)

        # Persist complaint
        complaint = Complaint(
            victim_name=user.name,
            victim_phone=user.phone,
            phone=request.phone_number,
            upi=request.upi_id,
            message=request.message,
            email=request.email,
            source=request.source,
            verdict=verdict,
            risk_score=risk_score,
            confidence=confidence,
            reasons=reasons,
            matched_patterns=patterns,
            response_time_ms=response_time_ms,
        )
        await complaint.insert()

        if verdict == VerdictType.SCAM:
            alert = Alert(
                alert_type=AlertType.SCAM_DETECTED,
                severity=AlertSeverity.HIGH if risk_score > 85 else AlertSeverity.MEDIUM,
                title=f"Citizen Shield: Scam Detected ({request.source})",
                description=f"Risk Score: {risk_score}. {reasons[0] if reasons else 'Suspicious activity reported.'}",
                source_module="citizen_shield",
                reference_id=str(complaint.id),
            )
            await alert.insert()

        return FraudCheckResponse(
            report_id=str(complaint.id),
            verdict=verdict.value,
            risk_score=risk_score,
            confidence=confidence,
            reasons=reasons,
            matched_patterns=patterns,
            response_time_ms=response_time_ms,
            analyzed_at=complaint.created_at,
        )

    async def get_history(
        self, user: User, page: int, page_size: int
    ) -> FraudHistoryResponse:
        """Get paginated fraud report history for a user."""
        skip = (page - 1) * page_size

        complaints = (
            await Complaint.find(Complaint.victim_name == user.name)
            .sort(-Complaint.created_at)
            .skip(skip)
            .limit(page_size)
            .to_list()
        )

        total = await Complaint.find(Complaint.victim_name == user.name).count()

        reports = [
            FraudReportSummary(
                report_id=str(c.id),
                verdict=c.verdict.value if c.verdict else "UNKNOWN",
                risk_score=c.risk_score,
                scam_type=c.scam_type.value if c.scam_type else None,
                source=c.source,
                created_at=c.created_at,
            )
            for c in complaints
        ]

        return FraudHistoryResponse(
            reports=reports,
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_report(self, report_id: str, user: User) -> FraudCheckResponse:
        """Get a specific fraud report by ID."""
        complaint = await Complaint.get(report_id)
        if not complaint:
            raise NotFoundException("Fraud report", report_id)

        return FraudCheckResponse(
            report_id=str(complaint.id),
            verdict=complaint.verdict.value if complaint.verdict else "UNKNOWN",
            risk_score=complaint.risk_score,
            confidence=complaint.confidence,
            reasons=complaint.reasons,
            matched_patterns=complaint.matched_patterns,
            response_time_ms=complaint.response_time_ms or 0,
            analyzed_at=complaint.created_at,
        )

    def _extract_reasons_and_patterns(self, request: FraudCheckRequest):
        """Extract patterns to show user why a verdict was given."""
        reasons = []
        patterns = []

        if request.message:
            msg_lower = request.message.lower()
            scam_keywords = ["digital arrest", "cbi", "ed ", "customs", "warrant", "transfer money", "lakh", "urgent", "freeze"]
            for keyword in scam_keywords:
                if keyword in msg_lower:
                    patterns.append(keyword)
                    reasons.append(f"Contains suspicious keyword: '{keyword}'")

        if request.phone_number:
            if request.phone_number.startswith("+91") and len(request.phone_number) > 13:
                reasons.append("Unusual phone number format")
                
        if not reasons:
            reasons.append("Analyzed by ML risk model.")

        return reasons, patterns
