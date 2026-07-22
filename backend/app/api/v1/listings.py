"""
Public listings API routes.

Why this file exists:
  HTTP layer for browse/explore — delegates to ListingService.
"""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import DbSession
from app.repositories.listing_repository import ListingRepository
from app.schemas.common import PaginatedResponse
from app.schemas.listing import AvailabilityResponse, ListingCard, ListingDetail, ReviewPublic
from app.schemas.listing_filters import ListingFilters
from app.services.listing_service import ListingService

router = APIRouter(prefix="/listings", tags=["listings"])

SortParam = Annotated[
  str,
  Query(description="price_asc | price_desc | rating_desc | newest"),
]


def _service(db: DbSession) -> ListingService:
  return ListingService(ListingRepository(db))


@router.get("", response_model=PaginatedResponse[ListingCard])
def list_listings(
  db: DbSession,
  page: Annotated[int, Query(ge=1)] = 1,
  page_size: Annotated[int, Query(ge=1, le=100)] = 12,
  sort: SortParam = "newest",
  location: Annotated[str | None, Query()] = None,
  guests: Annotated[int | None, Query(ge=1)] = None,
  min_price: Annotated[int | None, Query(ge=0, description="Min nightly price in cents")] = None,
  max_price: Annotated[int | None, Query(ge=0, description="Max nightly price in cents")] = None,
  category: Annotated[str | None, Query(description="Category slug")] = None,
  property_type: Annotated[str | None, Query()] = None,
  amenities: Annotated[list[str] | None, Query(description="Amenity slugs")] = None,
  check_in: Annotated[date | None, Query()] = None,
  check_out: Annotated[date | None, Query()] = None,
) -> PaginatedResponse[ListingCard]:
  if (check_in is None) ^ (check_out is None):
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Both check_in and check_out are required when filtering by dates",
    )
  if check_in and check_out and check_out <= check_in:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="check_out must be after check_in",
    )
  if min_price is not None and max_price is not None and min_price > max_price:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="min_price cannot exceed max_price",
    )

  filters = ListingFilters(
    location=location,
    guests=guests,
    min_price=min_price,
    max_price=max_price,
    category=category,
    property_type=property_type,
    amenities=tuple(amenities or ()),
    check_in=check_in,
    check_out=check_out,
    sort=sort,
    page=page,
    page_size=page_size,
  )
  return _service(db).list_listings(filters)


@router.get("/{listing_id}", response_model=ListingDetail)
def get_listing(listing_id: int, db: DbSession) -> ListingDetail:
  return _service(db).get_listing(listing_id)


@router.get("/{listing_id}/reviews", response_model=PaginatedResponse[ReviewPublic])
def list_listing_reviews(
  listing_id: int,
  db: DbSession,
  page: Annotated[int, Query(ge=1)] = 1,
  page_size: Annotated[int, Query(ge=1, le=50)] = 10,
) -> PaginatedResponse[ReviewPublic]:
  return _service(db).list_reviews(listing_id, page=page, page_size=page_size)


@router.get("/{listing_id}/availability", response_model=AvailabilityResponse)
def get_listing_availability(
  listing_id: int,
  db: DbSession,
  date_from: Annotated[date | None, Query(alias="from")] = None,
  date_to: Annotated[date | None, Query(alias="to")] = None,
) -> AvailabilityResponse:
  return _service(db).get_availability(listing_id, date_from=date_from, date_to=date_to)
