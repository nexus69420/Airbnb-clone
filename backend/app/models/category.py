"""
Category ORM model for Airbnb-style explore pills.

Why this file exists:
  Normalized categories enable filter UI and seed data without hardcoded strings.
"""

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Category(Base):
  __tablename__ = "categories"

  id: Mapped[int] = mapped_column(primary_key=True)
  name: Mapped[str] = mapped_column(String(100), nullable=False)
  slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
  icon_key: Mapped[str] = mapped_column(String(50), nullable=False)
  sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

  listings = relationship("Listing", back_populates="category")
