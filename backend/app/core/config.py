"""
Application settings loaded from environment variables.

Why this file exists:
  Centralizes configuration so routers/services never hardcode env-specific
  values (CORS origins, app name). Uses pydantic-settings for typed, validated
  config — the FastAPI-recommended pattern for production apps.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed runtime configuration for the API process."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Airbnb Clone API"
    app_version: str = "0.1.0"
    environment: str = "development"

    # Comma-separated list in .env, e.g. "http://localhost:3000,http://localhost:3001"
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    # SQLite by default; swap for Postgres URL in production without code changes.
    database_url: str = "sqlite:///./airbnb_clone.db"

    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    @property
    def cors_origin_list(self) -> list[str]:
        """Split CORS_ORIGINS into a list FastAPI CORSMiddleware expects."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings singleton.

    Input: none (reads process env / .env)
    Output: Settings instance
    Reasoning: lru_cache avoids re-parsing env on every Depends() call.
    """
    return Settings()
