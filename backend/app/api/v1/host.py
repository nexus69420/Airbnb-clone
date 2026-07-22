"""
Host API routes — dashboard, listing CRUD, incoming bookings.
"""

from fastapi import APIRouter, Response, status

from app.core.deps import CurrentHostDep, DbSession
from app.repositories.booking_repository import BookingRepository
from app.repositories.listing_repository import ListingRepository
from app.schemas.booking import BookingPublic
from app.schemas.host import (
  HostDashboardStats,
  HostListingCard,
  ListingCreate,
  ListingUpdate,
)
from app.schemas.listing import ListingDetail
from app.services.host_service import HostService

router = APIRouter(prefix="/host", tags=["host"])


def _service(db: DbSession) -> HostService:
  return HostService(ListingRepository(db), BookingRepository(db))


@router.get("/dashboard", response_model=HostDashboardStats)
def host_dashboard(db: DbSession, host: CurrentHostDep) -> HostDashboardStats:
  return _service(db).dashboard(host.id)


@router.get("/listings", response_model=list[HostListingCard])
def host_listings(db: DbSession, host: CurrentHostDep) -> list[HostListingCard]:
  return _service(db).list_listings(host.id)


@router.post("/listings", response_model=ListingDetail, status_code=status.HTTP_201_CREATED)
def create_host_listing(
  payload: ListingCreate,
  db: DbSession,
  host: CurrentHostDep,
) -> ListingDetail:
  return _service(db).create_listing(host.id, payload)


@router.get("/listings/{listing_id}", response_model=ListingDetail)
def get_host_listing(
  listing_id: int,
  db: DbSession,
  host: CurrentHostDep,
) -> ListingDetail:
  return _service(db).get_listing(host.id, listing_id)


@router.patch("/listings/{listing_id}", response_model=ListingDetail)
def update_host_listing(
  listing_id: int,
  payload: ListingUpdate,
  db: DbSession,
  host: CurrentHostDep,
) -> ListingDetail:
  return _service(db).update_listing(host.id, listing_id, payload)


@router.delete("/listings/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_host_listing(
  listing_id: int,
  db: DbSession,
  host: CurrentHostDep,
) -> Response:
  _service(db).archive_listing(host.id, listing_id)
  return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/listings/{listing_id}/restore", response_model=ListingDetail)
def restore_host_listing(
  listing_id: int,
  db: DbSession,
  host: CurrentHostDep,
) -> ListingDetail:
  return _service(db).restore_listing(host.id, listing_id)


@router.get("/bookings", response_model=list[BookingPublic])
def host_bookings(db: DbSession, host: CurrentHostDep) -> list[BookingPublic]:
  return _service(db).list_bookings(host.id)


@router.get("/listings/{listing_id}/bookings", response_model=list[BookingPublic])
def host_listing_bookings(
  listing_id: int,
  db: DbSession,
  host: CurrentHostDep,
) -> list[BookingPublic]:
  return _service(db).list_listing_bookings(host.id, listing_id)
