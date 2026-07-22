"""
Auth API routes: register, login, me.

Why this file exists:
  HTTP layer only — delegates all logic to AuthService.
"""

from fastapi import APIRouter, status

from app.core.deps import AuthServiceDep, CurrentUserDep
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
  "/register",
  response_model=TokenResponse,
  status_code=status.HTTP_201_CREATED,
  summary="Create account",
)
def register(data: RegisterRequest, auth_service: AuthServiceDep) -> TokenResponse:
  return auth_service.register(data)


@router.post(
  "/login",
  response_model=TokenResponse,
  summary="Sign in",
)
def login(data: LoginRequest, auth_service: AuthServiceDep) -> TokenResponse:
  return auth_service.login(data)


@router.get(
  "/me",
  response_model=UserPublic,
  summary="Current user profile",
)
def get_me(current_user: CurrentUserDep) -> UserPublic:
  return UserPublic.model_validate(current_user)
