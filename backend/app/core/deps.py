"""
FastAPI dependency injection helpers.

Why this file exists:
  Centralizes get_db → repository → service → current_user wiring for all routers.
"""

from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import UnauthorizedError
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService

bearer_scheme = HTTPBearer(auto_error=False)

DbSession = Annotated[Session, Depends(get_db)]


def get_user_repository(db: DbSession) -> UserRepository:
  return UserRepository(db)


def get_auth_service(db: DbSession) -> AuthService:
  return AuthService(UserRepository(db))


UserRepoDep = Annotated[UserRepository, Depends(get_user_repository)]
AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


def get_current_user(
  credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
  auth_service: AuthServiceDep,
) -> User:
  """
  Require a valid Bearer JWT and return the authenticated user.

  Input: Authorization header via HTTPBearer
  Output: User ORM instance
  Raises: UnauthorizedError if header missing or token invalid
  """
  if credentials is None or credentials.scheme.lower() != "bearer":
    raise UnauthorizedError("Not authenticated")
  return auth_service.get_user_from_token(credentials.credentials)


CurrentUserDep = Annotated[User, Depends(get_current_user)]


def get_current_host(current_user: CurrentUserDep) -> User:
  """Require the authenticated user to be a host."""
  from app.core.exceptions import ForbiddenError

  if not current_user.is_host:
    raise ForbiddenError("Host account required", code="host_required")
  return current_user


CurrentHostDep = Annotated[User, Depends(get_current_host)]
