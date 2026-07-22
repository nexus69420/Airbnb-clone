"""
Review ORM model — one review per completed booking.

Why this file exists:
  Enforces booking_id UNIQUE so guests cannot spam reviews; ties ratings to real stays.
"""

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Review(Base):
  __tablename__ = "reviews"
  __table_args__ = (
    CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating_range"),
  )

  id: Mapped[int] = mapped_column(primary_key=True)
  booking_id: Mapped[int] = mapped_column(
    ForeignKey("bookings.id", ondelete="CASCADE"),
    unique=True,
    nullable=False,
  )
  listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"), nullable=False, index=True)
  author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
  rating: Mapped[int] = mapped_column(Integer, nullable=False)
  comment: Mapped[str] = mapped_column(Text, nullable=False)
  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    nullable=False,
  )

  booking = relationship("Booking", back_populates="review")
  listing = relationship("Listing", back_populates="reviews")
  author = relationship("User", back_populates="reviews")
