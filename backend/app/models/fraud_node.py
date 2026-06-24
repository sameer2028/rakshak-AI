"""
Rakshak AI Intelligence Grid - Fraud Node Document Model

Graph nodes representing entities in the fraud network.
Used by: Fraud Network Intelligence (NetworkX graph analysis)
"""

from datetime import datetime, timezone
from typing import Optional, List
from enum import Enum

from beanie import Document, Indexed
from pydantic import Field


class NodeType(str, Enum):
    VICTIM = "victim"
    PHONE = "phone"
    UPI = "upi"
    BANK_ACCOUNT = "bank_account"
    DEVICE = "device"
    SUSPECT = "suspect"


class FraudNode(Document):
    """Node in the fraud intelligence graph."""

    node_id: Indexed(str, unique=True)  # type: ignore[valid-type]
    node_type: NodeType = Field(...)
    label: str = Field(..., description="Display label for the node")

    # Entity Properties
    properties: dict = Field(
        default_factory=dict,
        description="Node-specific properties (phone, upi_id, account, device_id, name, location)",
    )

    # Graph Metrics (computed by NetworkX algorithms)
    community: Optional[int] = Field(default=None, description="Louvain community ID")
    pagerank: Optional[float] = Field(default=None, description="PageRank score")
    degree_centrality: Optional[float] = Field(default=None)
    betweenness_centrality: Optional[float] = Field(default=None)

    # Fraud Classification
    risk_score: int = Field(default=0, ge=0, le=100)
    is_money_mule: bool = Field(default=False)
    is_ring_leader: bool = Field(default=False)
    is_flagged: bool = Field(default=False)

    # Connected nodes (denormalized for quick access)
    connections: List[str] = Field(
        default_factory=list,
        description="List of connected node_ids",
    )

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "fraud_nodes"
        indexes = [
            "node_id",
            "node_type",
            "community",
            "is_flagged",
            "is_money_mule",
            "is_ring_leader",
            "risk_score",
        ]
