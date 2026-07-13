"""Rakshak AI Intelligence Grid - API Routes Package"""

from fastapi import APIRouter

from app.routes.auth import router as auth_router
from app.routes.citizen_shield import router as citizen_router
from app.routes.scam_detection import router as scam_router
from app.routes.fraud_network import router as network_router
from app.routes.crime_heatmap import router as heatmap_router
from app.routes.counterfeit import router as counterfeit_router
from app.routes.cc_counterfeit import router as cc_counterfeit_router
from app.routes.dashboard import router as dashboard_router

# Master router that aggregates all module routers
api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(citizen_router)
api_router.include_router(network_router)
api_router.include_router(scam_router)
api_router.include_router(heatmap_router)
api_router.include_router(counterfeit_router)       # Legacy: /api/currency/*
api_router.include_router(cc_counterfeit_router)    # New CC pipeline: /api/cc/*
api_router.include_router(dashboard_router)

__all__ = ["api_router"]
