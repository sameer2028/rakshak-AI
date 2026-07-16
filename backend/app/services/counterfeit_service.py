"""
Rakshak AI - Counterfeit Detection Service

Business logic for counterfeit currency detection.
Orchestrates OpenCV + PyTorch models to analyze currency images.
"""

import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import UploadFile

from app.models.currency_check import CurrencyCheck, CurrencyVerdict
from app.models.user import User
from app.schemas.counterfeit import (
    CounterfeitDetectResponse,
    SecurityFeatureResult,
    AnomalyRegion,
    CounterfeitRecordSummary,
    CounterfeitHistoryResponse,
    CCVerifyResponse
)
from app.middleware.exceptions import NotFoundException, ValidationException
from app.config.settings import settings

# Import the new currency_ai pipeline components
from app.ml.currency_ai.quality import assess_image_quality
from app.ml.currency_ai.preprocessing import apply_preprocessing_filters
from app.ml.currency_ai.detector import detect_security_features
from app.ml.currency_ai.ocr import extract_banknote_text
from app.ml.currency_ai.classifier import classify_note
from app.ml.currency_ai.decision import evaluate_verdict
from app.ml.currency_ai.explainability import generate_grad_cam_overlay

from app.models.alert import Alert, AlertType, AlertSeverity
from app.services.websocket_service import websocket_manager
from loguru import logger


class CounterfeitService:
    """Counterfeit currency detection and analysis."""

    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

    async def detect(
        self, image: UploadFile, denomination: Optional[int], user: User
    ) -> CCVerifyResponse:
        """Analyze an uploaded currency image for counterfeiting."""
        # Validate file type
        ext = os.path.splitext(image.filename or "")[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise ValidationException(
                f"Invalid file type '{ext}'. Allowed: {', '.join(self.ALLOWED_EXTENSIONS)}"
            )

        # Save uploaded file
        upload_dir = settings.UPLOAD_DIR
        os.makedirs(upload_dir, exist_ok=True)
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(upload_dir, filename)

        content = await image.read()
        with open(filepath, "wb") as f:
            f.write(content)

        # --- New Currency.AI Pipeline ---
        # 1. Quality
        quality_report = assess_image_quality(content)
        
        # 2. Preprocessing
        preprocessed_images = apply_preprocessing_filters(content)
        
        # Init vars
        denom_val = denomination or 500
        yolo_detections = []
        ocr_results = {
            "serial_number": None,
            "serial_number_valid": False,
            "rbi_text_detected": False,
            "rbi_text": None,
            "governor_signature_detected": False,
            "denomination_text": None,
            "denomination_match": False
        }
        classification = {"real_probability": 0.0, "fake_probability": 1.0}
        
        if quality_report["is_valid"]:
            yolo_detections = detect_security_features(content, denom_val)
            ocr_results = extract_banknote_text(content, denom_val)
            classification = classify_note(content, yolo_detections, ocr_results)
            decision = evaluate_verdict(quality_report, yolo_detections, ocr_results, classification)
            grad_cam_heatmap = generate_grad_cam_overlay(content, yolo_detections)
        else:
            decision = evaluate_verdict(quality_report, yolo_detections, ocr_results, classification)
            grad_cam_heatmap = preprocessed_images.get("original", "")

        # Convert decision to enum for our legacy CurrencyCheck history
        verdict_enum = CurrencyVerdict.GENUINE if decision["is_genuine"] else CurrencyVerdict.COUNTERFEIT

        # Persist record (optional wrapper in our DB)
        record = CurrencyCheck(
            image_path=filepath,
            denomination=denom_val,
            prediction=verdict_enum,
            confidence=decision["confidence"] / 100.0,
            # We map the checklist broadly for legacy compatibility if needed
            watermark="pass" if decision["checklist"].get("Mahatma Gandhi Watermark") else "fail",
            security_thread="pass" if decision["checklist"].get("Security Thread") else "fail",
            micro_text="inconclusive",
            color_shift_ink="inconclusive",
            serial_pattern="pass" if ocr_results["serial_number_valid"] else "fail",
            intaglio_print="inconclusive",
            ashoka_emblem="pass" if decision["checklist"].get("Ashoka Pillar") else "fail",
            serial_number=ocr_results["serial_number"],
            anomaly_regions=[],
            analyst_id=str(user.id),
        )
        await record.insert()

        if verdict_enum == CurrencyVerdict.COUNTERFEIT:
            alert = Alert(
                alert_type=AlertType.COUNTERFEIT,
                severity=AlertSeverity.HIGH if decision["confidence"] > 90 else AlertSeverity.MEDIUM,
                title="Counterfeit Currency Detected",
                description=f"Confidence: {decision['confidence']:.1f}%. Denomination: {denom_val}",
                source_module="counterfeit",
                reference_id=str(record.id),
            )
            await alert.insert()
            
            # Broadcast the live alert via WebSockets
            try:
                alert_data = alert.model_dump(mode="json")
                alert_data["id"] = str(alert.id)
                alert_data["type"] = "new_alert"
                await websocket_manager.broadcast(alert_data)
            except Exception as e:
                logger.error(f"Failed to broadcast counterfeit alert via WebSocket: {e}")

        # Return the new CCVerifyResponse required by the frontend
        return CCVerifyResponse(
            filename=filename,
            denomination=denom_val,
            quality_report=quality_report,
            preprocessed_images=preprocessed_images,
            yolo_detections=yolo_detections,
            ocr_results=ocr_results,
            decision=decision,
            grad_cam_heatmap=grad_cam_heatmap,
            created_at=datetime.now(timezone.utc)
        )

    async def get_history(
        self, page: int, page_size: int, prediction: Optional[str]
    ) -> CounterfeitHistoryResponse:
        """Get paginated counterfeit detection history."""
        query = CurrencyCheck.find()
        if prediction:
            query = query.find(CurrencyCheck.prediction == prediction)

        total = await query.count()
        skip = (page - 1) * page_size
        records = await query.sort(-CurrencyCheck.created_at).skip(skip).limit(page_size).to_list()

        return CounterfeitHistoryResponse(
            records=[
                CounterfeitRecordSummary(
                    record_id=str(r.id),
                    prediction=r.prediction.value,
                    confidence=r.confidence,
                    denomination=r.denomination,
                    serial_number=r.serial_number,
                    created_at=r.created_at,
                )
                for r in records
            ],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_record(self, record_id: str) -> CounterfeitDetectResponse:
        """Get a specific counterfeit detection record."""
        record = await CurrencyCheck.get(record_id)
        if not record:
            raise NotFoundException("Counterfeit record", record_id)

        return CounterfeitDetectResponse(
            record_id=str(record.id),
            prediction=record.prediction.value,
            confidence=record.confidence,
            denomination=record.denomination,
            serial_number=record.serial_number,
            security_features=SecurityFeatureResult(
                watermark=record.watermark or "inconclusive",
                security_thread=record.security_thread or "inconclusive",
                micro_text=record.micro_text or "inconclusive",
                color_shift_ink=record.color_shift_ink or "inconclusive",
                serial_pattern=record.serial_pattern or "inconclusive",
                intaglio_print=record.intaglio_print or "inconclusive",
                ashoka_emblem=record.ashoka_emblem or "inconclusive",
            ),
            anomaly_regions=[AnomalyRegion(**r) for r in record.anomaly_regions],
            analyzed_at=record.created_at,
        )


