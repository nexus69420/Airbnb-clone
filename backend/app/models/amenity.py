"""
Amenity ORM model and listing association table.

Why this file exists:
  M2M amenities support filter-by-amenity search without JSON arrays on listings.
"""

from sqlalchemy import ForeignKey, String, Table, Column, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

listing_amenities = Table(
  "listing_amenities",
  Base.metadata,
  Column("listing_id", ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
  Column("amenity_id", ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class Amenity(Base):
  __tablename__ = "amenities"

  id: Mapped[int] = mapped_column(primary_key=True)
  name: Mapped[str] = mapped_column(String(100), nullable=False)
  slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
  icon_key: Mapped[str] = mapped_column(String(50), nullable=False)
  amenity_group: Mapped[str] = mapped_column(String(50), nullable=False)

  listings = relationship("Listing", secondary=listing_amenities, back_populates="amenities")
