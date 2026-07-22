"""
Review business logic — only after a completed stay, one per booking.
"""

from datetime import datetime, timezone

from app.core.exceptions import BadRequestError, ConflictError, ForbiddenError, NotFoundError
from app.models.enums import BookingStatus
from app.models.review import Review
from app.repositories.booking_repository import BookingRepository
from app.repositories.review_repository import ReviewRepository
from app.schemas.review import ReviewCreate, ReviewPublic


class ReviewService:
  def __init__(
    self,
    review_repo: ReviewRepository,
    booking_repo: BookingRepository,
  ) -> None:
    self._review_repo = review_repo
    self._booking_repo = booking_repo

  def create(self, author_id: int, payload: ReviewCreate) -> ReviewPublic:
    booking = self._booking_repo.get_by_id(payload.booking_id)
    if booking is None:
      raise NotFoundError("Booking not found", code="booking_not_found")
    if booking.guest_id != author_id:
      raise ForbiddenError("Not your booking", code="booking_forbidden")

    today = datetime.now(timezone.utc).date()
    if booking.check_out > today:
      raise BadRequestError(
        "You can review after checkout",
        code="stay_not_completed",
      )
    if booking.status == BookingStatus.CANCELLED:
      raise BadRequestError("Cancelled stays cannot be reviewed", code="invalid_booking_status")
    if booking.status not in (BookingStatus.CONFIRMED, BookingStatus.COMPLETED):
      raise BadRequestError(
        "Only confirmed stays can be reviewed",
        code="invalid_booking_status",
      )

    if self._review_repo.get_by_booking(booking.id) is not None:
      raise ConflictError("You already reviewed this stay", code="review_exists")

    if booking.status == BookingStatus.CONFIRMED:
      booking.status = BookingStatus.COMPLETED
      self._booking_repo.save(booking)

    review = Review(
      booking_id=booking.id,
      listing_id=booking.listing_id,
      author_id=author_id,
      rating=payload.rating,
      comment=payload.comment.strip(),
    )
    saved = self._review_repo.create(review)
    return ReviewPublic(
      id=saved.id,
      rating=saved.rating,
      comment=saved.comment,
      created_at=saved.created_at.date() if saved.created_at else None,
      author_name=booking.guest.full_name if booking.guest else "",
      author_avatar_url=booking.guest.avatar_url if booking.guest else None,
      listing_id=saved.listing_id,
      booking_id=saved.booking_id,
    )
