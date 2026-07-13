"""
Rakshak AI Intelligence Grid - Application Configuration

Loads settings from environment variables using pydantic-settings.
All configuration is centralized here for dependency injection.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "Rakshak AI Intelligence Grid"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "rakshak_db"

    # JWT Authentication
    JWT_SECRET_KEY: str = "rakshak-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    # File Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # ML Models
    ML_MODELS_DIR: str = "app/ml/models"

    # CC Counterfeit Detection Pipeline — model paths
    # If weights are absent, the pipeline falls back to CV heuristics automatically.
    YOLO_MODEL_PATH: str = "app/cc/models/yolo11_currency.pt"
    CLASSIFIER_MODEL_PATH: str = "app/cc/models/efficientnet_real_fake.pt"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
