"""
Rakshak AI - Auth Service

Business logic for user registration, login, and JWT token management.
"""

from datetime import datetime, timezone

from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    TokenResponse,
)
from app.middleware.security import hash_password, verify_password, create_access_token
from app.middleware.exceptions import DuplicateException, UnauthorizedException
from app.config.settings import settings


class AuthService:
    """Handles authentication business logic."""

    async def register(self, request: RegisterRequest) -> UserResponse:
        """Register a new user account."""
        # Check for existing user
        existing = await User.find_one(User.email == request.email)
        if existing:
            raise DuplicateException("User", "email")

        # Create user
        user = User(
            name=request.name,
            email=request.email,
            password=hash_password(request.password),
            role=request.role,
            phone=request.phone,
            organization=request.organization,
        )
        await user.insert()

        return UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            phone=user.phone,
            organization=user.organization,
            is_active=user.is_active,
            created_at=user.created_at,
        )

    async def login(self, request: LoginRequest) -> TokenResponse:
        """Authenticate user and return JWT token."""
        user = await User.find_one(User.email == request.email)

        if not user or not verify_password(request.password, user.password):
            raise UnauthorizedException("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedException("Account is deactivated")

        # Generate JWT token
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
        }
        access_token = create_access_token(token_data)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.JWT_EXPIRATION_MINUTES * 60,
            user=UserResponse(
                id=str(user.id),
                name=user.name,
                email=user.email,
                role=user.role,
                phone=user.phone,
                organization=user.organization,
                is_active=user.is_active,
                created_at=user.created_at,
            ),
        )
