"""
Public user response schema.

Why this file exists:
  API never exposes hashed_password. This is the safe user shape for all responses.
"""

from pydantic import BaseModel, ConfigDict, EmailStr


class UserPublic(BaseModel):
  """User data safe to return to clients."""

  model_config = ConfigDict(from_attributes=True)

  id: int
  email: EmailStr
  full_name: str
  avatar_url: str | None
  is_host: bool
  is_superhost: bool
