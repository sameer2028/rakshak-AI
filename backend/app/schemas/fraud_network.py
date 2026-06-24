"""
Rakshak AI - Fraud Network Schemas

Request/Response schemas for Fraud Network Intelligence endpoints.
"""

from typing import Optional, List, Any

from pydantic import BaseModel, Field


# ─── Requests ────────────────────────────────────────────────────

class NetworkSearchRequest(BaseModel):
    """Search nodes in the fraud network."""
    query: str = Field(..., min_length=1, max_length=200)
    node_type: Optional[str] = Field(
        default=None,
        description="victim | phone | upi | bank_account | device | suspect",
    )
    limit: int = Field(default=20, ge=1, le=100)


class GraphAnalyzeRequest(BaseModel):
    """Run graph algorithms on the fraud network."""
    algorithm: str = Field(
        ...,
        description="louvain | pagerank | centrality | all",
    )
    scope: str = Field(default="full", description="full | community")
    community_id: Optional[int] = None


# ─── Responses ───────────────────────────────────────────────────

class NodeMetrics(BaseModel):
    pagerank: Optional[float] = None
    centrality: Optional[float] = None
    community_id: Optional[int] = None
    is_money_mule: bool = False
    is_ring_leader: bool = False
    risk_score: int = 0


class GraphNode(BaseModel):
    node_id: str
    node_type: str
    label: str
    properties: dict = {}
    metrics: NodeMetrics


class GraphEdge(BaseModel):
    source: str
    target: str
    edge_type: str
    weight: float = 1.0
    properties: dict = {}


class GraphResponse(BaseModel):
    """Full or filtered fraud network graph."""
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    total_nodes: int
    total_edges: int
    communities_count: int


class NodeDetailResponse(BaseModel):
    """Detailed view of a single node."""
    node: GraphNode
    connected_nodes: List[GraphNode]
    connected_edges: List[GraphEdge]


class RankedNode(BaseModel):
    node_id: str
    label: str
    score: float


class GraphAnalyzeResponse(BaseModel):
    """Results from running graph algorithms."""
    algorithm: str
    execution_time_ms: int
    results: dict = Field(
        default_factory=dict,
        description="Algorithm-specific results (communities, leaders, mules, etc.)",
    )
    updated_nodes: int


class CommunityResponse(BaseModel):
    """Detected fraud community/ring."""
    community_id: int
    node_count: int
    total_risk_score: float
    ring_leaders: List[RankedNode]
    money_mules: List[RankedNode]
    members: List[GraphNode]


class CommunitiesListResponse(BaseModel):
    """List of all detected communities."""
    communities: List[CommunityResponse]
    total: int
