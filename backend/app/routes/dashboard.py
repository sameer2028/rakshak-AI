"""
Rakshak AI - Dashboard Routes (Police Command Center)

GET   /api/dashboard/overview          - Dashboard summary stats
GET   /api/dashboard/alerts            - Live alerts feed
GET   /api/dashboard/high-risk         - Flagged accounts
GET   /api/dashboard/complaints        - Recent complaints
PATCH /api/dashboard/alerts/{id}/resolve - Resolve an alert
"""

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from typing import Optional

from app.services.websocket_service import websocket_manager
from app.schemas.dashboard import (
    DashboardOverview,
    AlertsResponse,
    HighRiskAccountsResponse,
    RecentComplaintsResponse,
    AlertEvidenceResponse,
)
from app.schemas.auth import MessageResponse
from app.middleware.dependencies import require_roles
from app.models.user import User
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Police Command Center"])


@router.get("/overview", response_model=DashboardOverview)
async def get_overview(
    current_user: User = Depends(require_roles(["police", "admin"])),
):
    """Get command center overview statistics."""
    service = DashboardService()
    return await service.get_overview()


@router.get("/alerts", response_model=AlertsResponse)
async def get_alerts(
    severity: Optional[str] = Query(default=None),
    is_resolved: Optional[bool] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(require_roles(["police", "admin"])),
):
    """Get live alerts feed with optional filters."""
    service = DashboardService()
    return await service.get_alerts(severity, is_resolved, limit)


@router.get("/high-risk", response_model=HighRiskAccountsResponse)
async def get_high_risk_accounts(
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_roles(["police", "admin"])),
):
    """Get list of flagged high-risk accounts."""
    service = DashboardService()
    return await service.get_high_risk_accounts(limit)


@router.get("/complaints", response_model=RecentComplaintsResponse)
async def get_recent_complaints(
    limit: int = Query(default=30, ge=1, le=100),
    state: Optional[str] = Query(default=None),
    current_user: User = Depends(require_roles(["police", "admin"])),
):
    """Get most recent complaints."""
    service = DashboardService()
    return await service.get_recent_complaints(limit, state)


@router.patch("/alerts/{alert_id}/resolve", response_model=MessageResponse)
async def resolve_alert(
    alert_id: str,
    current_user: User = Depends(require_roles(["police", "admin"])),
):
    """Mark an alert as resolved."""
    service = DashboardService()
    return await service.resolve_alert(alert_id, current_user)

@router.get("/alerts/{alert_id}/evidence", response_model=AlertEvidenceResponse)
async def get_alert_evidence(
    alert_id: str,
    current_user: User = Depends(require_roles(["police", "admin"])),
):
    """Fetch raw evidence (like transcript) for an alert."""
    service = DashboardService()
    return await service.get_alert_evidence(alert_id)

@router.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    """Real-time alerts via WebSocket."""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from the client, just keep connection open
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

