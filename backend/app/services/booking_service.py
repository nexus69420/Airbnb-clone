"""
Booking business logic — pricing, overlap prevention, checkout, trips.

Why this file exists:
  Money and calendar integrity live here. Routers stay thin; the repository
  only persists. Overlap is re-checked at write time (SQLite has no exclusion
  constraints — Postgres EXCLUDE would be the production upgrade).
"""

from datetime import date, datetime, timezone

from app.core.exceptions import BadRequestError, ConflictError, ForbiddenError, NotFoundError
from app.models.booking import Booking
from app.models.enums import BookingStatus
from app.repositories.booking_repository import BookingRepository
from app.repositories.listing_repository import ListingRepository
from app.schemas.booking import (
  BookingCreate,
  BookingListingSummary,
  BookingPublic,
  TripsResponse,
)


class BookingService:
  def __init__(
    self,
    booking_repo: BookingRepository,
    listing_repo: ListingRepository,
  ) -> None:
    self._booking_repo = booking_repo
    self._listing_repo = listing_repo

  def create(self, guest_id: int, payload: BookingCreate) -> BookingPublic:
    listing = self._listing_repo.get_by_id(payload.listing_id)
    if listing is None:
      raise NotFoundError("Listing not found", code="listing_not_found")

    if listing.host_id == guest_id:
      raise ForbiddenError("You cannot book your own listing", code="cannot_book_own_listing")

    self._validate_dates(payload.check_in, payload.check_out)
    if payload.guests > listing.max_guests:
      raise BadRequestError(
        f"Guests must be between 1 and {listing.max_guests}",
        code="guests_exceed_max",
      )

    if self._booking_repo.has_overlap(listing.id, payload.check_in, payload.check_out):
      raise ConflictError(
        "Those dates overlap an existing booking",
        code="booking_overlap",
      )

    nights = (payload.check_out - payload.check_in).days
    nightly = listing.price_per_night
    cleaning = listing.cleaning_fee
    nightly_subtotal = nightly * nights
    service_fee = (nightly_subtotal * listing.service_fee_percent) // 100
    total = nightly_subtotal + cleaning + service_fee

    booking = Booking(
      listing_id=listing.id,
      guest_id=guest_id,
      check_in=payload.check_in,
      check_out=payload.check_out,
      guests=payload.guests,
      status=BookingStatus.PENDING,
      nightly_rate_cents=nightly,
      cleaning_fee_cents=cleaning,
      service_fee_cents=service_fee,
      total_cents=total,
    )
    saved = self._booking_repo.create(booking)
    return self._to_public(saved)

  def checkout(self, booking_id: int, guest_id: int) -> BookingPublic:
    """Mock payment — pending → confirmed. No real charge."""
    booking = self._require_guest_booking(booking_id, guest_id)
    if booking.status != BookingStatus.PENDING:
      raise BadRequestError(
        "Only pending bookings can be checked out",
        code="invalid_booking_status",
      )

    # Re-check overlap in case another guest confirmed in the meantime
    if self._booking_repo.has_overlap(
      booking.listing_id,
      booking.check_in,
      booking.check_out,
      exclude_booking_id=booking.id,
    ):
      raise ConflictError(
        "Those dates were just booked by someone else",
        code="booking_overlap",
      )

    booking.status = BookingStatus.CONFIRMED
    return self._to_public(self._booking_repo.save(booking))

  def cancel(self, booking_id: int, guest_id: int) -> BookingPublic:
    booking = self._require_guest_booking(booking_id, guest_id)
    if booking.status not in (BookingStatus.PENDING, BookingStatus.CONFIRMED):
      raise BadRequestError(
        "This booking cannot be cancelled",
        code="invalid_booking_status",
      )
    booking.status = BookingStatus.CANCELLED
    return self._to_public(self._booking_repo.save(booking))

  def get(self, booking_id: int, user_id: int, *, is_host: bool) -> BookingPublic:
    booking = self._booking_repo.get_by_id(booking_id)
    if booking is None:
      raise NotFoundError("Booking not found", code="booking_not_found")

    is_guest = booking.guest_id == user_id
    is_listing_host = booking.listing is not None and booking.listing.host_id == user_id
    if not is_guest and not (is_host and is_listing_host):
      raise ForbiddenError("Not allowed to view this booking", code="booking_forbidden")

    return self._to_public(booking)

  def list_trips(self, guest_id: int) -> TripsResponse:
    today = datetime.now(timezone.utc).date()
    upcoming: list[BookingPublic] = []
    past: list[BookingPublic] = []
    cancelled: list[BookingPublic] = []

    for booking in self._booking_repo.list_for_guest(guest_id):
      public = self._to_public(booking)
      if booking.status == BookingStatus.CANCELLED:
        cancelled.append(public)
      elif booking.status == BookingStatus.COMPLETED or booking.check_out <= today:
        past.append(public)
      else:
        upcoming.append(public)

    # Upcoming: soonest first; past/cancelled already newest-first from repo
    upcoming.sort(key=lambda b: b.check_in)
    return TripsResponse(upcoming=upcoming, past=past, cancelled=cancelled)

  def _require_guest_booking(self, booking_id: int, guest_id: int) -> Booking:
    booking = self._booking_repo.get_by_id(booking_id)
    if booking is None:
      raise NotFoundError("Booking not found", code="booking_not_found")
    if booking.guest_id != guest_id:
      raise ForbiddenError("Not your booking", code="booking_forbidden")
    return booking

  @staticmethod
  def _validate_dates(check_in: date, check_out: date) -> None:
    today = datetime.now(timezone.utc).date()
    if check_out <= check_in:
      raise BadRequestError("check_out must be after check_in", code="invalid_date_range")
    if check_in < today:
      raise BadRequestError("check_in cannot be in the past", code="check_in_in_past")

  @staticmethod
  def _to_public(booking: Booking) -> BookingPublic:
    listing_summary: BookingListingSummary | None = None
    if booking.listing is not None:
      image_url = booking.listing.images[0].url if booking.listing.images else None
      listing_summary = BookingListingSummary(
        id=booking.listing.id,
        title=booking.listing.title,
        city=booking.listing.city,
        country=booking.listing.country,
        image_url=image_url,
      )

    today = datetime.now(timezone.utc).date()
    has_review = booking.review is not None
    can_review = (
      not has_review
      and booking.check_out <= today
      and booking.status in (BookingStatus.CONFIRMED, BookingStatus.COMPLETED)
    )

    return BookingPublic(
      id=booking.id,
      listing_id=booking.listing_id,
      guest_id=booking.guest_id,
      check_in=booking.check_in,
      check_out=booking.check_out,
      guests=booking.guests,
      status=booking.status,
      nightly_rate_cents=booking.nightly_rate_cents,
      cleaning_fee_cents=booking.cleaning_fee_cents,
      service_fee_cents=booking.service_fee_cents,
      total_cents=booking.total_cents,
      created_at=booking.created_at,
      listing=listing_summary,
      has_review=has_review,
      can_review=can_review,
    )
