"""
SQLAlchemy declarative base and shared mixins.

Why this file exists:
  Single metadata registry for Alembic autogenerate and model imports.
  TimestampMixin keeps created_at/updated_at consistent across entities.
"""

from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Root declarative base for all ORM models."""


class TimestampMixin:
    """Reusable created/updated columns for auditable entities."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
