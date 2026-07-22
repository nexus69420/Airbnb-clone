"""
Booking API routes — reserve, mock checkout, cancel, My Trips.
"""

from fastapi import APIRouter, status

from app.core.deps import CurrentUserDep, DbSession
from app.repositories.booking_repository import BookingRepository
from app.repositories.listing_repository import ListingRepository
from app.schemas.booking import BookingCreate, BookingPublic, TripsResponse
from app.services.booking_service import BookingService

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _service(db: DbSession) -> BookingService:
  return BookingService(BookingRepository(db), ListingRepository(db))


@router.post("", response_model=BookingPublic, status_code=status.HTTP_201_CREATED)
def create_booking(
  payload: BookingCreate,
  db: DbSession,
  current_user: CurrentUserDep,
) -> BookingPublic:
  return _service(db).create(current_user.id, payload)


@router.get("/me", response_model=TripsResponse)
def list_my_trips(db: DbSession, current_user: CurrentUserDep) -> TripsResponse:
  return _service(db).list_trips(current_user.id)


@router.get("/{booking_id}", response_model=BookingPublic)
def get_booking(
  booking_id: int,
  db: DbSession,
  current_user: CurrentUserDep,
) -> BookingPublic:
  return _service(db).get(booking_id, current_user.id, is_host=current_user.is_host)


@router.post("/{booking_id}/checkout", response_model=BookingPublic)
def checkout_booking(
  booking_id: int,
  db: DbSession,
  current_user: CurrentUserDep,
) -> BookingPublic:
  return _service(db).checkout(booking_id, current_user.id)


@router.post("/{booking_id}/cancel", response_model=BookingPublic)
def cancel_booking(
  booking_id: int,
  db: DbSession,
  current_user: CurrentUserDep,
) -> BookingPublic:
  return _service(db).cancel(booking_id, current_user.id)
