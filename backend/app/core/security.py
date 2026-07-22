"""
Password hashing and JWT utilities.

Why this file exists:
  Shared by seed script (M1) and auth service (M2). Keeps bcrypt and JWT config in one place.
"""

from datetime import UTC, datetime, timedelta

import jwt

from app.core.config import get_settings


def hash_password(password: str) -> str:
  """
  Hash a plaintext password for storage.

  Input: plaintext password
  Output: bcrypt hash string
  Reasoning: Never store plaintext; bcrypt handles salting and cost factor.
  """
  import bcrypt

  return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
  """Check plaintext against stored bcrypt hash."""
  import bcrypt

  return bcrypt.checkpw(
    plain_password.encode("utf-8"),
    hashed_password.encode("utf-8"),
  )


def create_access_token(*, subject: str, expires_delta: timedelta | None = None) -> str:
  """
  Create a signed JWT access token.

  Input: subject (user id as string), optional expiry override
  Output: encoded JWT string
  Reasoning: Stateless auth — server validates signature without session store.
  """
  settings = get_settings()
  expire = datetime.now(UTC) + (
    expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
  )
  payload = {"sub": subject, "exp": expire}
  return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
  """
  Decode and validate a JWT access token.

  Input: bearer token string
  Output: payload dict with at least `sub`
  Raises: jwt.PyJWTError on invalid/expired token
  """
  settings = get_settings()
  return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
