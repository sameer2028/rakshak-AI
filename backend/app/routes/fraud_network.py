"""
Rakshak AI - Fraud Network Routes

GET  /api/network/graph          - Get fraud graph
GET  /api/network/node/{id}      - Get node details
POST /api/network/search         - Search nodes
POST /api/network/analyze        - Run graph algorithms
GET  /api/network/communities    - Get detected communities
"""

from fastapi import APIRouter, Depends, Query

from app.schemas.fraud_network import (
    NetworkSearchRequest,
    GraphAnalyzeRequest,
    GraphResponse,
    NodeDetailResponse,
    GraphAnalyzeResponse,
    CommunitiesListResponse,
)
from app.middleware.dependencies import require_roles
from app.models.user import User
from app.services.fraud_network_service import FraudNetworkService

router = APIRouter(prefix="/network", tags=["Fraud Network Intelligence"])


@router.get("/graph", response_model=GraphResponse)
async def get_graph(
    community_id: int = Query(default=None),
    node_type: str = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(require_roles(["police", "bank", "admin"])),
):
    """Get the full fraud network graph or a filtered subgraph."""
    service = FraudNetworkService()
    return await service.get_graph(community_id, node_type, limit)


@router.get("/node/{node_id}", response_model=NodeDetailResponse)
async def get_node(
    node_id: str,
    current_user: User = Depends(require_roles(["police", "bank", "admin"])),
):
    """Get detailed information about a specific node."""
    service = FraudNetworkService()
    return await service.get_node_detail(node_id)


@router.post("/search", response_model=GraphResponse)
async def search_nodes(
    request: NetworkSearchRequest,
    current_user: User = Depends(require_roles(["police", "bank", "admin"])),
):
    """Search for nodes by phone, UPI, account, or name."""
    service = FraudNetworkService()
    return await service.search(request)


@router.post("/analyze", response_model=GraphAnalyzeResponse)
async def analyze_graph(
    request: GraphAnalyzeRequest,
    current_user: User = Depends(require_roles(["police", "admin"])),
):
    """Run graph algorithms (Louvain, PageRank, Centrality) on the fraud network."""
    service = FraudNetworkService()
    return await service.run_algorithm(request)


@router.get("/communities", response_model=CommunitiesListResponse)
async def get_communities(
    current_user: User = Depends(require_roles(["police", "admin"])),
):
    """Get all detected fraud communities/rings."""
    service = FraudNetworkService()
    return await service.get_communities()
