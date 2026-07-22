"""
Auth request/response schemas.

Why this file exists:
  Validates login/register input and documents the token response contract.
"""

from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserPublic


class RegisterRequest(BaseModel):
  email: EmailStr
  password: str = Field(min_length=8, max_length=128)
  full_name: str = Field(min_length=1, max_length=255)
  is_host: bool = False


class LoginRequest(BaseModel):
  email: EmailStr
  password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
  access_token: str
  token_type: str = "bearer"
  user: UserPublic
