"""
Application-specific exceptions and HTTP handlers.

Why this file exists:
  Services raise domain exceptions; handlers map them to consistent JSON responses
  so routers stay free of try/except boilerplate.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
  """Base exception with HTTP status and machine-readable code."""

  def __init__(self, detail: str, status_code: int, code: str) -> None:
    self.detail = detail
    self.status_code = status_code
    self.code = code
    super().__init__(detail)


class ConflictError(AppException):
  def __init__(self, detail: str, code: str = "conflict") -> None:
    super().__init__(detail=detail, status_code=409, code=code)


class UnauthorizedError(AppException):
  def __init__(self, detail: str = "Invalid credentials", code: str = "unauthorized") -> None:
    super().__init__(detail=detail, status_code=401, code=code)


class ForbiddenError(AppException):
  def __init__(self, detail: str = "Forbidden", code: str = "forbidden") -> None:
    super().__init__(detail=detail, status_code=403, code=code)


class NotFoundError(AppException):
  def __init__(self, detail: str = "Not found", code: str = "not_found") -> None:
    super().__init__(detail=detail, status_code=404, code=code)


class BadRequestError(AppException):
  def __init__(self, detail: str, code: str = "bad_request") -> None:
    super().__init__(detail=detail, status_code=400, code=code)


def register_exception_handlers(app: FastAPI) -> None:
  """Wire AppException → JSONResponse with { detail, code } shape."""

  @app.exception_handler(AppException)
  async def app_exception_handler(_request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
      status_code=exc.status_code,
      content={"detail": exc.detail, "code": exc.code},
    )
