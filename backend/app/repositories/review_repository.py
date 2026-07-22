"""
Review data-access layer.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.review import Review


class ReviewRepository:
  def __init__(self, db: Session) -> None:
    self._db = db

  def get_by_booking(self, booking_id: int) -> Review | None:
    return self._db.scalar(select(Review).where(Review.booking_id == booking_id))

  def create(self, review: Review) -> Review:
    self._db.add(review)
    self._db.commit()
    self._db.refresh(review)
    return review
