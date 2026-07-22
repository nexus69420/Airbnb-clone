"""
Listing image ORM model.

Why this file exists:
  Gallery order is data (sort_order), not a JSON blob — supports reordering in host CRUD.
"""

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ListingImage(Base):
  __tablename__ = "listing_images"

  id: Mapped[int] = mapped_column(primary_key=True)
  listing_id: Mapped[int] = mapped_column(
    ForeignKey("listings.id", ondelete="CASCADE"),
    nullable=False,
    index=True,
  )
  url: Mapped[str] = mapped_column(String(512), nullable=False)
  alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
  sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

  listing = relationship("Listing", back_populates="images")
