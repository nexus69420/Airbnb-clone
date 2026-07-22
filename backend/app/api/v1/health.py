"""
Health router.

Why this file exists:
  Provides a cheap liveness probe for local dev, Render health checks, and
  Milestone 0 frontend verification — no DB dependency yet.
"""

from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Liveness probe",
)
def get_health() -> HealthResponse:
    """
    Return process liveness metadata.

    Input: none
    Output: HealthResponse
    Reasoning: Confirms the ASGI app is up before we wire DB/auth in later milestones.
    """
    settings = get_settings()
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )
