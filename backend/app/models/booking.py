"""
Booking ORM model with price snapshots and date constraints.

Why this file exists:
  Bookings persist guest stays and block availability. Price fields snapshot
  values at booking time so host price edits do not rewrite history.
"""

from datetime import date, datetime

from sqlalchemy import CheckConstraint, Date, DateTime, Enum, ForeignKey, Index, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import BookingStatus


class Booking(Base):
  __tablename__ = "bookings"
  __table_args__ = (
    CheckConstraint("check_out > check_in", name="ck_bookings_valid_date_range"),
    CheckConstraint("guests >= 1", name="ck_bookings_min_guests"),
    Index("ix_bookings_listing_dates", "listing_id", "check_in", "check_out"),
    Index("ix_bookings_guest_id", "guest_id"),
    Index("ix_bookings_status", "status"),
  )

  id: Mapped[int] = mapped_column(primary_key=True)
  listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"), nullable=False)
  guest_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
  check_in: Mapped[date] = mapped_column(Date, nullable=False)
  check_out: Mapped[date] = mapped_column(Date, nullable=False)
  guests: Mapped[int] = mapped_column(Integer, nullable=False)
  status: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus), nullable=False)
  nightly_rate_cents: Mapped[int] = mapped_column(Integer, nullable=False)
  cleaning_fee_cents: Mapped[int] = mapped_column(Integer, nullable=False)
  service_fee_cents: Mapped[int] = mapped_column(Integer, nullable=False)
  total_cents: Mapped[int] = mapped_column(Integer, nullable=False)
  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    nullable=False,
  )

  listing = relationship("Listing", back_populates="bookings")
  guest = relationship("User", back_populates="bookings")
  review = relationship("Review", back_populates="booking", uselist=False)
