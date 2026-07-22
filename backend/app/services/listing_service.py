"""
Listing business logic.

Why this file exists:
  Maps ORM rows to public schemas; computes derived fields (primary image, pages).
"""

import math
from datetime import date

from app.core.exceptions import NotFoundError
from app.repositories.listing_repository import ListingRepository
from app.schemas.common import PaginatedResponse
from app.schemas.listing import (
  AvailabilityResponse,
  BlockedRange,
  HostPublic,
  ListingCard,
  ListingDetail,
  ListingImagePublic,
  ReviewPublic,
)
from app.schemas.catalog import AmenityPublic, CategoryPublic
from app.schemas.listing_filters import ListingFilters


class ListingService:
  """Listing read operations for public API."""

  def __init__(self, listing_repo: ListingRepository) -> None:
    self._listing_repo = listing_repo

  def list_listings(self, filters: ListingFilters) -> PaginatedResponse[ListingCard]:
    rows, total = self._listing_repo.list_active(filters)
    items = [
      self._to_card(listing, avg_rating, review_count)
      for listing, avg_rating, review_count in rows
    ]
    pages = math.ceil(total / filters.page_size) if filters.page_size else 0
    return PaginatedResponse(
      items=items,
      total=total,
      page=filters.page,
      page_size=filters.page_size,
      pages=pages,
    )

  def get_listing(self, listing_id: int) -> ListingDetail:
    listing = self._listing_repo.get_by_id(listing_id)
    if listing is None:
      raise NotFoundError("Listing not found", code="listing_not_found")

    avg_rating, review_count = self._listing_repo.get_rating_stats(listing_id)
    return self._to_detail(listing, avg_rating, review_count)

  def list_reviews(
    self,
    listing_id: int,
    *,
    page: int = 1,
    page_size: int = 10,
  ) -> PaginatedResponse[ReviewPublic]:
    if self._listing_repo.get_by_id(listing_id) is None:
      raise NotFoundError("Listing not found", code="listing_not_found")

    rows, total = self._listing_repo.list_reviews(listing_id, page=page, page_size=page_size)
    items = [
      ReviewPublic(
        id=r.id,
        rating=r.rating,
        comment=r.comment,
        created_at=r.created_at.date() if r.created_at else None,
        author_name=r.author.full_name,
        author_avatar_url=r.author.avatar_url,
      )
      for r in rows
    ]
    pages = math.ceil(total / page_size) if page_size else 0
    return PaginatedResponse(
      items=items,
      total=total,
      page=page,
      page_size=page_size,
      pages=pages,
    )

  def get_availability(
    self,
    listing_id: int,
    *,
    date_from: date | None = None,
    date_to: date | None = None,
  ) -> AvailabilityResponse:
    if self._listing_repo.get_by_id(listing_id) is None:
      raise NotFoundError("Listing not found", code="listing_not_found")

    bookings = self._listing_repo.list_blocked_ranges(
      listing_id, date_from=date_from, date_to=date_to
    )
    return AvailabilityResponse(
      listing_id=listing_id,
      blocked=[
        BlockedRange(check_in=b.check_in, check_out=b.check_out) for b in bookings
      ],
    )

  @staticmethod
  def _to_card(listing, avg_rating: float | None, review_count: int) -> ListingCard:
    image_urls = [img.url for img in (listing.images or [])]
    image_url = image_urls[0] if image_urls else None
    rating = round(float(avg_rating), 2) if avg_rating is not None else None
    return ListingCard(
      id=listing.id,
      title=listing.title,
      city=listing.city,
      state=listing.state,
      country=listing.country,
      price_per_night=listing.price_per_night,
      property_type=listing.property_type,
      image_url=image_url,
      image_urls=image_urls,
      rating=rating,
      review_count=review_count,
      lat=listing.lat,
      lng=listing.lng,
    )

  @staticmethod
  def _to_detail(listing, avg_rating: float | None, review_count: int) -> ListingDetail:
    rating = round(float(avg_rating), 2) if avg_rating is not None else None
    return ListingDetail(
      id=listing.id,
      title=listing.title,
      description=listing.description,
      city=listing.city,
      state=listing.state,
      country=listing.country,
      address=listing.address,
      lat=listing.lat,
      lng=listing.lng,
      price_per_night=listing.price_per_night,
      cleaning_fee=listing.cleaning_fee,
      service_fee_percent=listing.service_fee_percent,
      currency=listing.currency,
      property_type=listing.property_type,
      max_guests=listing.max_guests,
      bedrooms=listing.bedrooms,
      beds=listing.beds,
      bathrooms=listing.bathrooms,
      rating=rating,
      review_count=review_count,
      images=[ListingImagePublic.model_validate(img) for img in listing.images],
      amenities=[AmenityPublic.model_validate(a) for a in listing.amenities],
      category=CategoryPublic.model_validate(listing.category),
      host=HostPublic.model_validate(listing.host),
    )
