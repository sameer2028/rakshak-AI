"""
Rakshak AI Intelligence Grid - FastAPI Application

Main entry point for the backend API server.
Mounts all routers, middleware, CORS, and lifecycle events.

Run with:
    uvicorn app.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.config.settings import settings
from app.config.database import connect_to_mongodb, close_mongodb_connection
from app.middleware.request_logging import RequestLoggingMiddleware
from app.routes import api_router
from app.ml.fraud_classifier import fraud_classifier
from app.ml.scam_nlp import nlp_engine
from app.ml.counterfeit_detector import counterfeit_detector


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    # ─── Startup ─────────────────────────────────────────
    logger.info("🛡️  Starting Rakshak AI Intelligence Grid...")
    logger.info(f"   Version: {settings.APP_VERSION}")
    logger.info(f"   Debug: {settings.DEBUG}")

    await connect_to_mongodb()
    
    # Load ML Models
    fraud_classifier.load_model()
    nlp_engine.load_model()
    counterfeit_detector.load_model()

    logger.info("🚀 Rakshak AI is ready!")
    logger.info(f"   API Docs: http://localhost:8000/docs")

    yield

    # ─── Shutdown ────────────────────────────────────────
    logger.info("🛑 Shutting down Rakshak AI...")
    await close_mongodb_connection()
    logger.info("👋 Goodbye!")


# ─── Create FastAPI App ──────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI Powered Digital Public Safety Intelligence Platform. "
        "Detects scams, discovers fraud rings, tracks counterfeit currency, "
        "and provides intelligence to law enforcement agencies."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ─── CORS Middleware ─────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Custom Middleware ───────────────────────────────────────────

app.add_middleware(RequestLoggingMiddleware)


# ─── Mount Routers ───────────────────────────────────────────────

app.include_router(api_router)


# ─── Health Check ────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "message": "Rakshak AI Intelligence Grid is running",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "database": "connected",
        "modules": {
            "citizen_shield": "active",
            "scam_detection": "active",
            "fraud_network": "active",
            "crime_heatmap": "active",
            "counterfeit_detection": "active",
            "command_center": "active",
        },
    }
