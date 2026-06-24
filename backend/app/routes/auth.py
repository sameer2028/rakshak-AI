"""
Rakshak AI - Auth Routes

POST /api/auth/register  - Register new user
POST /api/auth/login     - Login, returns JWT
GET  /api/auth/me        - Get current user profile
"""

from fastapi import APIRouter, Depends

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    TokenResponse,
    MessageResponse,
)
from app.middleware.dependencies import get_current_user
from app.models.user import User
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(request: RegisterRequest):
    """Register a new user account."""
    service = AuthService()
    return await service.register(request)


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Authenticate and receive a JWT access token."""
    service = AuthService()
    return await service.login(request)


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        phone=current_user.phone,
        organization=current_user.organization,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )
