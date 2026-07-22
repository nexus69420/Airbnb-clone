"""
Booking data-access layer.

Why this file exists:
  Isolates SQL for bookings so the service can focus on overlap rules and pricing.
"""

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.booking import Booking
from app.models.enums import BookingStatus
from app.models.listing import Listing


class BookingRepository:
  def __init__(self, db: Session) -> None:
    self._db = db

  def get_by_id(self, booking_id: int) -> Booking | None:
    return self._db.scalar(
      select(Booking)
      .where(Booking.id == booking_id)
      .options(
        selectinload(Booking.listing).selectinload(Listing.images),
        selectinload(Booking.guest),
        selectinload(Booking.review),
      )
    )

  def list_for_guest(self, guest_id: int) -> list[Booking]:
    return list(
      self._db.scalars(
        select(Booking)
        .where(Booking.guest_id == guest_id)
        .options(
          selectinload(Booking.listing).selectinload(Listing.images),
          selectinload(Booking.review),
        )
        .order_by(Booking.check_in.desc())
      ).all()
    )

  def list_for_host(self, host_id: int) -> list[Booking]:
    return list(
      self._db.scalars(
        select(Booking)
        .join(Listing, Booking.listing_id == Listing.id)
        .where(Listing.host_id == host_id)
        .options(selectinload(Booking.listing).selectinload(Listing.images))
        .order_by(Booking.check_in.desc())
      ).all()
    )

  def list_for_listing(self, listing_id: int) -> list[Booking]:
    return list(
      self._db.scalars(
        select(Booking)
        .where(Booking.listing_id == listing_id)
        .options(selectinload(Booking.listing).selectinload(Listing.images))
        .order_by(Booking.check_in.desc())
      ).all()
    )

  def count_upcoming_for_host(self, host_id: int, today: date) -> int:
    from sqlalchemy import func

    return (
      self._db.scalar(
        select(func.count())
        .select_from(Booking)
        .join(Listing, Booking.listing_id == Listing.id)
        .where(
          Listing.host_id == host_id,
          Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
          Booking.check_out > today,
        )
      )
      or 0
    )

  def count_pending_for_host(self, host_id: int) -> int:
    from sqlalchemy import func

    return (
      self._db.scalar(
        select(func.count())
        .select_from(Booking)
        .join(Listing, Booking.listing_id == Listing.id)
        .where(Listing.host_id == host_id, Booking.status == BookingStatus.PENDING)
      )
      or 0
    )

  def has_overlap(
    self,
    listing_id: int,
    check_in: date,
    check_out: date,
    *,
    exclude_booking_id: int | None = None,
  ) -> bool:
    """True if any pending/confirmed booking overlaps [check_in, check_out)."""
    q = select(Booking.id).where(
      Booking.listing_id == listing_id,
      Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
      Booking.check_in < check_out,
      Booking.check_out > check_in,
    )
    if exclude_booking_id is not None:
      q = q.where(Booking.id != exclude_booking_id)
    return self._db.scalar(q.limit(1)) is not None

  def create(self, booking: Booking) -> Booking:
    self._db.add(booking)
    self._db.commit()
    self._db.refresh(booking)
    # Reload with listing for response mapping
    loaded = self.get_by_id(booking.id)
    assert loaded is not None
    return loaded

  def save(self, booking: Booking) -> Booking:
    self._db.add(booking)
    self._db.commit()
    self._db.refresh(booking)
    loaded = self.get_by_id(booking.id)
    assert loaded is not None
    return loaded
