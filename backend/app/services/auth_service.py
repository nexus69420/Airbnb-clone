"""
Authentication business logic.

Why this file exists:
  Register/login rules live here — not in routers (HTTP) or repositories (SQL).
"""

import jwt
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserPublic


class AuthService:
  """Handles registration, login, and token-based user resolution."""

  def __init__(self, user_repo: UserRepository) -> None:
    self._user_repo = user_repo

  def register(self, data: RegisterRequest) -> TokenResponse:
    """
    Create a new user and return an access token.

    Input: validated RegisterRequest
    Output: TokenResponse with JWT + user profile
    Raises: ConflictError if email already exists
    """
    if self._user_repo.get_by_email(data.email):
      raise ConflictError("Email already registered", code="email_taken")

    user = self._user_repo.create(
      email=data.email,
      hashed_password=hash_password(data.password),
      full_name=data.full_name,
      is_host=data.is_host,
    )
    return self._build_token_response(user)

  def login(self, data: LoginRequest) -> TokenResponse:
    """
    Authenticate credentials and return an access token.

    Input: validated LoginRequest
    Output: TokenResponse
    Raises: UnauthorizedError on bad email/password (generic message — no user enumeration)
    """
    user = self._user_repo.get_by_email(data.email)
    if user is None or not verify_password(data.password, user.hashed_password):
      raise UnauthorizedError("Invalid email or password")

    return self._build_token_response(user)

  def get_user_from_token(self, token: str) -> User:
    """
    Resolve a JWT to a User row.

    Input: bearer token string
    Output: User ORM instance
    Raises: UnauthorizedError on invalid/expired token or missing user
    """
    try:
      payload = decode_access_token(token)
      user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
      raise UnauthorizedError("Invalid or expired token") from None

    user = self._user_repo.get_by_id(user_id)
    if user is None:
      raise UnauthorizedError("User not found")
    return user

  def _build_token_response(self, user: User) -> TokenResponse:
    token = create_access_token(subject=str(user.id))
    return TokenResponse(
      access_token=token,
      user=UserPublic.model_validate(user),
    )


def get_auth_service(db: Session) -> AuthService:
  """Factory for dependency injection."""
  return AuthService(UserRepository(db))
