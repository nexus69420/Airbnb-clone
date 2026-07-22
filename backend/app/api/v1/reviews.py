"""
Review API routes.
"""

from fastapi import APIRouter, status

from app.core.deps import CurrentUserDep, DbSession
from app.repositories.booking_repository import BookingRepository
from app.repositories.review_repository import ReviewRepository
from app.schemas.review import ReviewCreate, ReviewPublic
from app.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewPublic, status_code=status.HTTP_201_CREATED)
def create_review(
  payload: ReviewCreate,
  db: DbSession,
  current_user: CurrentUserDep,
) -> ReviewPublic:
  return ReviewService(ReviewRepository(db), BookingRepository(db)).create(
    current_user.id, payload
  )
