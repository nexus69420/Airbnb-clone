"""
Health check response schema.

Why this file exists:
  Documents the /health contract in code so frontend types and OpenAPI stay aligned.
"""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Payload returned by GET /health and GET /api/v1/health."""

    status: str = Field(..., examples=["ok"])
    service: str = Field(..., examples=["Airbnb Clone API"])
    version: str = Field(..., examples=["0.1.0"])
    environment: str = Field(..., examples=["development"])
