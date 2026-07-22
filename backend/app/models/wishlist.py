"""
Wishlist ORM model — saved listings per user.

Why this file exists:
  Simple favorites table with UNIQUE(user_id, listing_id) prevents duplicate hearts.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Wishlist(Base):
  __tablename__ = "wishlists"
  __table_args__ = (
    UniqueConstraint("user_id", "listing_id", name="uq_wishlists_user_listing"),
  )

  id: Mapped[int] = mapped_column(primary_key=True)
  user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  listing_id: Mapped[int] = mapped_column(
    ForeignKey("listings.id", ondelete="CASCADE"),
    nullable=False,
    index=True,
  )
  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    nullable=False,
  )

  user = relationship("User", back_populates="wishlists")
  listing = relationship("Listing", back_populates="wishlists")
