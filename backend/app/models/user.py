"""
User ORM model.

Why this file exists:
  Guests and hosts share one table. is_host distinguishes host capabilities
  without a separate hosts table (per architecture decision).
"""

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
  __tablename__ = "users"

  id: Mapped[int] = mapped_column(primary_key=True)
  email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
  hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
  full_name: Mapped[str] = mapped_column(String(255), nullable=False)
  avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
  is_host: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
  is_superhost: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

  listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
  bookings = relationship("Booking", back_populates="guest")
  reviews = relationship("Review", back_populates="author")
  wishlists = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")
