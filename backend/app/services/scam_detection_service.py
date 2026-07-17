"""
Rakshak AI - Scam Detection Service

Business logic for digital arrest scam detection.
Orchestrates NLP models to analyze call transcripts for scam patterns.
"""

from datetime import datetime, timezone
import time
from typing import Optional, List

from app.models.complaint import Complaint, ScamType, VerdictType
from app.models.alert import Alert, AlertType, AlertSeverity
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
from app.services.websocket_service import websocket_manager
from app.services.graph_auto_expander import graph_expander
from loguru import logger


class ScamDetectionService:
    """Scam transcript analysis and detection logic."""

    async def analyze(self, request: ScamAnalyzeRequest, user: User) -> ScamAnalyzeResponse:
        """Analyze a call transcript for digital arrest scam patterns."""
        start_time = time.time()

        # ML NLP scam classifier
        result = self._ml_scam_analysis(request)

        # Cross-reference with Fraud Network Intelligence
        network_match = await self._check_fraud_network(request, result)

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
            fraud_network_match=network_match,
        )
        await complaint.insert()

        if result["is_scam"]:
            alert = Alert(
                alert_type=AlertType.SCAM_DETECTED,
                severity=AlertSeverity.CRITICAL if result["risk_score"] > 85 else AlertSeverity.HIGH,
                title=f"Digital Arrest Scam Detected via Transcript",
                description=f"Risk Score: {result['risk_score']}. {result['threat_indicators'][0]['indicator'] if result['threat_indicators'] else 'Impersonation scam detected.'}",
                source_module="scam_detection",
                reference_id=str(complaint.id),
                metadata={
                    "transcript_preview": request.transcript[:300] + ("..." if len(request.transcript) > 300 else ""),
                    "detected_type": result["scam_type_enum"],
                }
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

        # ─── Auto-expand fraud graph ─────────────────────────────────
        try:
            await graph_expander.expand_from_complaint(
                complaint=complaint,
                reporter_name=user.name if hasattr(user, 'name') else "Unknown",
                reporter_id=str(user.id) if hasattr(user, 'id') else "system",
            )
        except Exception as e:
            logger.error(f"Graph auto-expansion failed (non-fatal): {e}")

        return ScamAnalyzeResponse(
            detection_id=str(complaint.id),
            is_scam=result["is_scam"],
            scam_type=result["scam_type"],
            risk_score=result["risk_score"],
            confidence=result["confidence"],
            threat_indicators=[ThreatIndicator(**ti) for ti in result["threat_indicators"]],
            recommended_actions=result["recommended_actions"],
            analyzed_at=complaint.created_at,
            fraud_network_match=network_match,
        )

    async def analyze_live(self, request: ScamAnalyzeRequest) -> ScamAnalyzeResponse:
        """Analyze a call transcript in real-time without persisting to DB."""
        start_time = time.time()

        # ML NLP scam classifier
        result = self._ml_scam_analysis(request)

        # Cross-reference with Fraud Network Intelligence
        network_match = await self._check_fraud_network(request, result)

        return ScamAnalyzeResponse(
            detection_id="live-analysis-simulated",
            is_scam=result["is_scam"],
            scam_type=result["scam_type"],
            risk_score=result["risk_score"],
            confidence=result["confidence"],
            threat_indicators=[ThreatIndicator(**ti) for ti in result["threat_indicators"]],
            recommended_actions=result["recommended_actions"],
            analyzed_at=datetime.now(timezone.utc),
            fraud_network_match=network_match,
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
            "ed": "Fake ED Impersonation",
            "customs": "Fake Customs Impersonation",
            "police": "Government Impersonation",
            "sbi": "Bank Impersonation",
            "paytm": "Wallet Impersonation",
            "bank": "Bank Impersonation",
        }

        import re
        for keyword, label in impersonation_patterns.items():
            if re.search(rf"\b{re.escape(keyword)}\b", transcript_lower):
                threat_indicators.append({
                    "indicator": label,
                    "category": "impersonation",
                    "severity": "critical",
                    "evidence": f"Contains keyword: '{keyword}'",
                })

        # Fear language
        fear_words = ["arrest", "warrant", "jail", "prison", "case filed", "fir", "digital arrest", "blocked", "deactivated", "illegal", "narcotics", "penalty"]
        for word in fear_words:
            if re.search(rf"\b{re.escape(word.lower())}\b", transcript_lower):
                threat_indicators.append({
                    "indicator": f"Fear language: '{word}'",
                    "category": "fear_language",
                    "severity": "high",
                    "evidence": f"Transcript contains fear-inducing term: '{word}'",
                })

        # Money demand
        money_words = ["transfer", "pay", "lakh", "crore", "send money", "neft", "rtgs", "upi", "deposit"]
        for word in money_words:
            if re.search(rf"\b{re.escape(word.lower())}\b", transcript_lower):
                threat_indicators.append({
                    "indicator": f"Urgent money demand: '{word}'",
                    "category": "money_demand",
                    "severity": "high",
                    "evidence": f"Financial transaction term detected: '{word}'",
                })
                
        # Sensitive info demand
        sensitive_words = ["otp", "share", "cvv", "pin", "password"]
        for word in sensitive_words:
            if re.search(rf"\b{re.escape(word.lower())}\b", transcript_lower):
                threat_indicators.append({
                    "indicator": f"Sensitive info demand: '{word}'",
                    "category": "sensitive_info",
                    "severity": "critical",
                    "evidence": f"Request for confidential data detected: '{word}'",
                })

        # VoIP detection
        if request.phone_metadata and request.phone_metadata.is_voip:
            threat_indicators.append({
                "indicator": "VoIP/Spoofed call detected",
                "category": "spoofing",
                "severity": "medium",
                "evidence": "Call originated from VoIP service",
            })

        # Boost risk score if the ML model suspects a scam and severe indicators are present
        if is_scam and threat_indicators:
            for indicator in threat_indicators:
                if indicator["severity"] == "critical":
                    risk_score += 25
                elif indicator["severity"] == "high":
                    risk_score += 15
                    
            risk_score = min(risk_score, 99)
            
            has_critical = any(ind["severity"] == "critical" for ind in threat_indicators)
            has_high = any(ind["severity"] == "high" for ind in threat_indicators)
            
            if has_critical:
                risk_score = max(risk_score, 85)
            elif has_high:
                risk_score = max(risk_score, 75)

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

    async def _check_fraud_network(self, request: ScamAnalyzeRequest, result: dict) -> dict:
        """Cross-reference entities from transcript/metadata against the Fraud Network graph."""
        from app.models.fraud_node import FraudNode

        COMMUNITY_NAMES = {
            0: "Jamtara Digital Arrest Ring",
            1: "Mumbai UPI Fraud Syndicate",
            2: "Delhi Fake CBI Gang",
            3: "Hyderabad Phishing Network",
            4: "Kolkata Counterfeit Ring",
        }

        network_match = {
            "matched": False,
            "entity_type": None,
            "entity_value": None,
            "community_name": None,
            "node_label": None,
            "risk_score": None,
        }

        try:
            # 1. Check caller phone number from metadata
            caller_number = None
            if request.phone_metadata and request.phone_metadata.caller_number:
                raw = request.phone_metadata.caller_number
                cleaned = "".join(c for c in raw if c.isdigit())
                if len(cleaned) == 10:
                    caller_number = f"+91{cleaned}"
                elif len(cleaned) == 12 and cleaned.startswith("91"):
                    caller_number = f"+{cleaned}"
                else:
                    caller_number = raw

                matched_node = await FraudNode.find_one({
                    "node_type": "phone",
                    "$or": [
                        {"properties.phone_number": caller_number},
                        {"properties.phone_number": raw},
                    ]
                })
                if matched_node:
                    network_match = self._build_network_match(matched_node, "phone", raw, COMMUNITY_NAMES)

            # 2. Extract phone numbers from transcript and check
            if not network_match["matched"]:
                import re
                phone_pattern = r'(?:\+91[\-\s]?)?[6789]\d{9}'
                phones = list(set(re.findall(phone_pattern, request.transcript)))
                for phone in phones:
                    cleaned = "".join(c for c in phone if c.isdigit())
                    if len(cleaned) == 10:
                        normalized = f"+91{cleaned}"
                    else:
                        normalized = phone
                    matched_node = await FraudNode.find_one({
                        "node_type": "phone",
                        "$or": [
                            {"properties.phone_number": normalized},
                            {"properties.phone_number": phone},
                        ]
                    })
                    if matched_node:
                        network_match = self._build_network_match(matched_node, "phone", phone, COMMUNITY_NAMES)
                        break

            # 3. Extract UPI IDs from transcript and check
            if not network_match["matched"]:
                import re
                upi_pattern = r'[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,64}'
                upis = list(set(re.findall(upi_pattern, request.transcript)))
                for upi in upis:
                    matched_node = await FraudNode.find_one({
                        "node_type": "upi",
                        "properties.upi_id": upi.lower()
                    })
                    if matched_node:
                        network_match = self._build_network_match(matched_node, "upi", upi, COMMUNITY_NAMES)
                        break

            # 4. Extract bank accounts from transcript and check
            if not network_match["matched"]:
                import re
                account_pattern = r'\b\d{9,18}\b'
                accounts = list(set(re.findall(account_pattern, request.transcript)))
                for acc in accounts:
                    matched_node = await FraudNode.find_one({
                        "node_type": "bank_account",
                        "properties.bank_account": acc
                    })
                    if matched_node:
                        network_match = self._build_network_match(matched_node, "bank_account", acc, COMMUNITY_NAMES)
                        break

            # If match found, boost the result
            if network_match["matched"]:
                comm_name = network_match["community_name"]
                result["is_scam"] = True
                result["risk_score"] = max(result["risk_score"], 95)
                result["confidence"] = max(result["confidence"], 0.98)

                # Add a critical threat indicator at the top
                result["threat_indicators"].insert(0, {
                    "indicator": f"⚠️ FRAUD NETWORK MATCH: Entity linked to '{comm_name}'",
                    "category": "fraud_network",
                    "severity": "critical",
                    "evidence": f"The {network_match['entity_type']} '{network_match['entity_value']}' was found in the active fraud intelligence network, linked to known syndicate: {comm_name}",
                })

                if "Report to cybercrime.gov.in" not in result.get("recommended_actions", []):
                    result["recommended_actions"] = [
                        "Do NOT transfer any money",
                        "Disconnect the call immediately",
                        "Report to cybercrime.gov.in",
                        "Call 1930 (Cyber Crime Helpline)",
                        "Block the caller's number",
                    ]

        except Exception as e:
            logger.warning(f"Fraud network cross-check failed (non-fatal): {e}")

        return network_match

    def _build_network_match(self, node, entity_type: str, entity_value: str, community_names: dict) -> dict:
        """Build a fraud network match result dict from a matched FraudNode."""
        comm_id = node.community
        comm_name = community_names.get(comm_id, "Unknown Syndicate") if comm_id is not None else "Active Scam Network"
        return {
            "matched": True,
            "entity_type": entity_type,
            "entity_value": entity_value,
            "community_name": comm_name,
            "node_label": node.label,
            "risk_score": node.risk_score,
        }
