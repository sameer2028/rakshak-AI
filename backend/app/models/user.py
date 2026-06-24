"""
Rakshak AI Intelligence Grid - User Document Model

MongoDB document model for platform users with role-based access.
Roles: citizen, police, bank, telecom, admin
"""

from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from beanie import Document, Indexed
from pydantic import EmailStr, Field


class UserRole(str, Enum):
    CITIZEN = "citizen"
    POLICE = "police"
    BANK = "bank"
    TELECOM = "telecom"
    ADMIN = "admin"


class User(Document):
    """User account document."""

    name: str = Field(..., min_length=2, max_length=100)
    email: Indexed(str, unique=True)  # type: ignore[valid-type]
    password: str = Field(..., description="Bcrypt hashed password")
    role: UserRole = Field(default=UserRole.CITIZEN)
    phone: Optional[str] = Field(default=None, max_length=15)
    organization: Optional[str] = Field(default=None, max_length=200)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        use_state_management = True

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Rahul Sharma",
                "email": "rahul@example.com",
                "password": "$2b$12$hashed_password",
                "role": "citizen",
                "phone": "+919876543210",
            }
        }
