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
)
from app.middleware.exceptions import NotFoundException, ValidationException
from app.config.settings import settings
from app.ml.counterfeit_detector import counterfeit_detector
from app.models.currency_check import CurrencyVerdict
from loguru import logger


class CounterfeitService:
    """Counterfeit currency detection and analysis."""

    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

    async def detect(
        self, image: UploadFile, denomination: Optional[int], user: User
    ) -> CounterfeitDetectResponse:
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

        # Use ML Computer Vision model
        result = counterfeit_detector.detect(filepath)
        
        # Convert string verdict back to enum
        verdict_enum = CurrencyVerdict(result["verdict"])

        # Persist record
        record = CurrencyCheck(
            image_path=filepath,
            denomination=denomination,
            prediction=verdict_enum,
            confidence=result["confidence"],
            watermark=result["features"]["watermark"],
            security_thread=result["features"]["security_thread"],
            micro_text=result["features"]["micro_text"],
            color_shift_ink=result["features"]["color_shift_ink"],
            serial_pattern=result["features"]["serial_pattern"],
            intaglio_print=result["features"]["intaglio_print"],
            ashoka_emblem=result["features"]["ashoka_emblem"],
            serial_number=result.get("serial_number"),
            anomaly_regions=result["anomaly_regions"],
            analyst_id=str(user.id),
        )
        await record.insert()

        return CounterfeitDetectResponse(
            record_id=str(record.id),
            prediction=verdict_enum.value,
            confidence=result["confidence"],
            denomination=denomination,
            serial_number=result.get("serial_number"),
            security_features=SecurityFeatureResult(**result["features"]),
            anomaly_regions=[AnomalyRegion(**r) for r in result["anomaly_regions"]],
            analyzed_at=record.created_at,
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


