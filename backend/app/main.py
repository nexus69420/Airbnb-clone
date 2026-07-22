"""
FastAPI application entrypoint.

Why this file exists:
  Wires middleware, exception handlers (later), and versioned routers.
  Uvicorn loads `app.main:app` in local and Render deployments.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.schemas.health import HealthResponse

settings = get_settings()

app = FastAPI(
  title=settings.app_name,
  version=settings.app_version,
  docs_url="/docs",
  redoc_url="/redoc",
)

register_exception_handlers(app)

# CORS: allow localhost:3000 and :3001 (Next.js may use 3001 if 3000 is busy)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["health"],
    summary="Liveness probe (root alias)",
)
def root_health() -> HealthResponse:
    """
    Root health alias for platforms that probe `/health` by convention.

    Input: none
    Output: HealthResponse (same shape as /api/v1/health)
    Reasoning: Render/other hosts often hit /health; keep a stable alias.
    """
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )
