"""
User data-access layer.

Why this file exists:
  Encapsulates SQLAlchemy queries for users. Services call this — never raw ORM in routers.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
  """CRUD and lookup operations for the users table."""

  def __init__(self, db: Session) -> None:
    self._db = db

  def get_by_email(self, email: str) -> User | None:
    return self._db.scalar(select(User).where(User.email == email.lower()))

  def get_by_id(self, user_id: int) -> User | None:
    return self._db.get(User, user_id)

  def create(
    self,
    *,
    email: str,
    hashed_password: str,
    full_name: str,
    is_host: bool = False,
    avatar_url: str | None = None,
  ) -> User:
    user = User(
      email=email.lower(),
      hashed_password=hashed_password,
      full_name=full_name,
      is_host=is_host,
      avatar_url=avatar_url,
    )
    self._db.add(user)
    self._db.commit()
    self._db.refresh(user)
    return user
