"""Rakshak AI Intelligence Grid - Pydantic Schemas Package"""

from app.schemas.auth import (
    RegisterRequest, LoginRequest,
    UserResponse, TokenResponse, MessageResponse,
)
from app.schemas.citizen_shield import (
    FraudCheckRequest, FraudCheckResponse,
    FraudReportSummary, FraudHistoryResponse,
)
from app.schemas.scam_detection import (
    ScamAnalyzeRequest, ScamStatusUpdateRequest,
    ThreatIndicator, ScamAnalyzeResponse,
    ScamDetectionSummary, ScamDetectionListResponse,
)
from app.schemas.fraud_network import (
    NetworkSearchRequest, GraphAnalyzeRequest,
    GraphNode, GraphEdge, GraphResponse,
    NodeDetailResponse, GraphAnalyzeResponse,
    CommunityResponse, CommunitiesListResponse,
)
from app.schemas.crime_heatmap import (
    HeatmapPoint, HeatmapResponse,
    DistrictRisk, DistrictRiskResponse, HeatmapStatsResponse,
)
from app.schemas.counterfeit import (
    CounterfeitDetectResponse, SecurityFeatureResult,
    AnomalyRegion, CounterfeitRecordSummary, CounterfeitHistoryResponse,
)
from app.schemas.dashboard import (
    DashboardOverview, AlertItem, AlertsResponse,
    HighRiskAccount, HighRiskAccountsResponse,
    RecentComplaint, RecentComplaintsResponse,
)
