"""
Rakshak AI Intelligence Grid - Fraud Edge Document Model

Graph edges representing relationships between fraud network entities.
Used by: Fraud Network Intelligence
"""

from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from beanie import Document, Indexed
from pydantic import Field


class EdgeType(str, Enum):
    TRANSFERRED_TO = "transferred_to"
    CALLED_BY = "called_by"
    USES_DEVICE = "uses_device"
    LINKED_UPI = "linked_upi"
    SAME_BENEFICIARY = "same_beneficiary"
    BELONGS_TO = "belongs_to"


class FraudEdge(Document):
    """Edge (relationship) in the fraud intelligence graph."""

    source_node_id: Indexed(str)  # type: ignore[valid-type]
    target_node_id: Indexed(str)  # type: ignore[valid-type]
    edge_type: EdgeType = Field(...)
    weight: float = Field(default=1.0, ge=0.0)

    # Edge Properties
    properties: dict = Field(
        default_factory=dict,
        description="Edge-specific properties (amount, timestamp, frequency)",
    )

    # Metadata
    amount: Optional[float] = Field(default=None, ge=0)
    frequency: Optional[int] = Field(default=None, ge=0)

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "fraud_edges"
        indexes = [
            "source_node_id",
            "target_node_id",
            "edge_type",
            [("source_node_id", 1), ("target_node_id", 1)],
        ]
