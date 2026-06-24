"""
Rakshak AI Intelligence Grid - Device Document Model

Tracks devices used in fraudulent activities.
Used by: Fraud Network Intelligence
"""

from datetime import datetime, timezone
from typing import Optional, List

from beanie import Document, Indexed
from pydantic import Field


class Device(Document):
    """Device entity linked to fraud network analysis."""

    device_id: Indexed(str, unique=True)  # type: ignore[valid-type]
    device_type: str = Field(default="mobile", description="mobile | desktop | tablet")
    os: Optional[str] = Field(default=None, description="Android | iOS | Windows")
    imei: Optional[str] = Field(default=None)

    # Linked Entities
    phone_numbers: List[str] = Field(default_factory=list)
    accounts: List[str] = Field(default_factory=list)
    upi_ids: List[str] = Field(default_factory=list)

    # Risk Assessment
    risk_score: int = Field(default=0, ge=0, le=100)
    is_flagged: bool = Field(default=False)
    flag_reason: Optional[str] = Field(default=None)

    # Location History
    last_known_location: Optional[dict] = Field(default=None)

    # Timestamps
    first_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "devices"
        indexes = [
            "device_id",
            "is_flagged",
            "risk_score",
        ]
