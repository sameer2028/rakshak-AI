"""
Rakshak AI - Citizen Shield Service

Business logic for citizen fraud analysis.
Orchestrates ML models to analyze messages, phone numbers, UPIs, and emails.
"""

from datetime import datetime, timezone
import time
import re
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
from app.services.websocket_service import websocket_manager
from app.services.graph_auto_expander import graph_expander
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

        # ─── Query active Fraud Network Intelligence graph ──────────────────
        fraud_network_match = {
            "matched": False,
            "entity_type": None,
            "entity_value": None,
            "community_name": None
        }

        # Normalize phone number
        raw_phone = request.phone_number
        normalized_phone = None
        if raw_phone:
            cleaned = "".join(c for c in raw_phone if c.isdigit())
            if len(cleaned) == 10:
                normalized_phone = f"+91{cleaned}"
            elif len(cleaned) == 12 and cleaned.startswith("91"):
                normalized_phone = f"+{cleaned}"
            elif raw_phone.startswith("+"):
                normalized_phone = f"+{cleaned}"
            else:
                normalized_phone = raw_phone

        COMMUNITY_NAMES = {
            0: "Jamtara Digital Arrest Ring",
            1: "Mumbai UPI Fraud Syndicate",
            2: "Delhi Fake CBI Gang",
            3: "Hyderabad Phishing Network",
            4: "Kolkata Counterfeit Ring",
        }

        from app.models.fraud_node import FraudNode
        match_found = False
        matched_node = None
        matched_type = None
        matched_val = None

        if normalized_phone:
            matched_node = await FraudNode.find_one({
                "node_type": "phone",
                "$or": [
                    {"properties.phone_number": normalized_phone},
                    {"properties.phone_number": raw_phone}
                ]
            })
            if matched_node:
                match_found = True
                matched_type = "phone"
                matched_val = raw_phone

        if not match_found and request.upi_id:
            upi_clean = request.upi_id.strip().lower()
            matched_node = await FraudNode.find_one({
                "node_type": "upi",
                "properties.upi_id": upi_clean
            })
            if matched_node:
                match_found = True
                matched_type = "upi"
                matched_val = request.upi_id

        if not match_found and request.email:
            email_clean = request.email.strip().lower()
            matched_node = await FraudNode.find_one({
                "properties.email": email_clean
            })
            if matched_node:
                match_found = True
                matched_type = "email"
                matched_val = request.email

        # If matching node exists in graph, elevate status
        if match_found and matched_node:
            comm_id = matched_node.community
            comm_name = COMMUNITY_NAMES.get(comm_id, "Unknown Syndicate") if comm_id is not None else "Active Scam Network"
            
            fraud_network_match = {
                "matched": True,
                "entity_type": matched_type,
                "entity_value": matched_val,
                "community_name": comm_name
            }
            
            verdict = VerdictType.SCAM
            risk_score = max(risk_score, 95)
            confidence = max(confidence, 0.98)
            
            warning_msg = f"Linked entity found in active active fraud network: {comm_name}"
            if warning_msg not in reasons:
                reasons.insert(0, warning_msg)
            if comm_name not in patterns:
                patterns.append(comm_name)

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
            fraud_network_match=fraud_network_match,
        )
        await complaint.insert()

        if verdict == VerdictType.SCAM or (verdict == VerdictType.SUSPICIOUS and risk_score >= 70):
            alert_title = "Citizen Shield: Scam Detected" if verdict == VerdictType.SCAM else "Citizen Shield: Suspicious Activity"
            alert = Alert(
                alert_type=AlertType.SCAM_DETECTED,
                severity=AlertSeverity.HIGH if risk_score > 85 else AlertSeverity.MEDIUM,
                title=f"{alert_title} ({request.source})",
                description=f"Risk Score: {risk_score}. {reasons[0] if reasons else 'Suspicious activity reported.'}",
                source_module="citizen_shield",
                reference_id=str(complaint.id),
            )
            await alert.insert()
            
            # Broadcast the live alert via WebSockets
            try:
                alert_data = alert.model_dump(mode="json")
                alert_data["id"] = str(alert.id)
                alert_data["type"] = "new_alert"
                await websocket_manager.broadcast(alert_data)
            except Exception as e:
                logger.error(f"Failed to broadcast websocket alert: {e}")

        # ─── Auto-expand fraud graph with new nodes/edges ──────────────
        try:
            await graph_expander.expand_from_complaint(
                complaint=complaint,
                reporter_name=user.name,
                reporter_id=str(user.id),
            )
        except Exception as e:
            logger.error(f"Graph auto-expansion failed (non-fatal): {e}")

        return FraudCheckResponse(
            report_id=str(complaint.id),
            verdict=verdict.value,
            risk_score=risk_score,
            confidence=confidence,
            reasons=reasons,
            matched_patterns=patterns,
            response_time_ms=response_time_ms,
            analyzed_at=complaint.created_at,
            fraud_network_match=fraud_network_match,
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
            fraud_network_match=complaint.fraud_network_match,
        )

    def _extract_reasons_and_patterns(self, request: FraudCheckRequest):
        """Extract patterns to show user why a verdict was given."""
        reasons = []
        patterns = []

        if request.message:
            msg_lower = request.message.lower()
            scam_keywords = ["digital arrest", "cbi", "ed", "customs", "warrant", "transfer money", "lakh", "urgent", "freeze"]
            for keyword in scam_keywords:
                if re.search(rf"\b{keyword}\b", msg_lower):
                    patterns.append(keyword)
                    reasons.append(f"Contains suspicious keyword: '{keyword}'")

        if request.phone_number:
            if request.phone_number.startswith("+91") and len(request.phone_number) > 13:
                reasons.append("Unusual phone number format")
                
        if not reasons:
            reasons.append("Analyzed by ML risk model.")

        return reasons, patterns


