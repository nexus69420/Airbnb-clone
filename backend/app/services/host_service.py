"""
Host panel business logic — CRUD listings + dashboard + incoming bookings.

Why this file exists:
  Ownership checks and soft-archive live here so routers stay thin.
"""

from datetime import datetime, timezone

from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.models.enums import ListingStatus
from app.models.listing import Listing
from app.models.listing_image import ListingImage
from app.repositories.booking_repository import BookingRepository
from app.repositories.listing_repository import ListingRepository
from app.schemas.host import (
  HostDashboardStats,
  HostListingCard,
  ListingCreate,
  ListingUpdate,
)
from app.schemas.booking import BookingPublic
from app.schemas.listing import ListingDetail
from app.services.booking_service import BookingService
from app.services.listing_service import ListingService


class HostService:
  def __init__(
    self,
    listing_repo: ListingRepository,
    booking_repo: BookingRepository,
  ) -> None:
    self._listing_repo = listing_repo
    self._booking_repo = booking_repo

  def dashboard(self, host_id: int) -> HostDashboardStats:
    today = datetime.now(timezone.utc).date()
    return HostDashboardStats(
      active_listings=self._listing_repo.count_by_host_status(host_id, ListingStatus.ACTIVE),
      archived_listings=self._listing_repo.count_by_host_status(host_id, ListingStatus.ARCHIVED),
      upcoming_bookings=self._booking_repo.count_upcoming_for_host(host_id, today),
      pending_bookings=self._booking_repo.count_pending_for_host(host_id),
    )

  def list_listings(self, host_id: int) -> list[HostListingCard]:
    today = datetime.now(timezone.utc).date()
    cards: list[HostListingCard] = []
    for listing in self._listing_repo.list_for_host(host_id):
      upcoming = sum(
        1
        for b in self._booking_repo.list_for_listing(listing.id)
        if b.status.value in ("pending", "confirmed") and b.check_out > today
      )
      image_url = listing.images[0].url if listing.images else None
      cards.append(
        HostListingCard(
          id=listing.id,
          title=listing.title,
          city=listing.city,
          country=listing.country,
          price_per_night=listing.price_per_night,
          status=listing.status,
          property_type=listing.property_type,
          image_url=image_url,
          upcoming_bookings=upcoming,
        )
      )
    return cards

  def get_listing(self, host_id: int, listing_id: int) -> ListingDetail:
    listing = self._require_owned(host_id, listing_id)
    avg, count = self._listing_repo.get_rating_stats(listing.id)
    return ListingService(self._listing_repo)._to_detail(listing, avg, count)

  def create_listing(self, host_id: int, payload: ListingCreate) -> ListingDetail:
    listing = self._build_listing(host_id, payload)
    listing.status = ListingStatus.ACTIVE
    saved = self._listing_repo.create_listing(listing)
    avg, count = self._listing_repo.get_rating_stats(saved.id)
    return ListingService(self._listing_repo)._to_detail(saved, avg, count)

  def update_listing(self, host_id: int, listing_id: int, payload: ListingUpdate) -> ListingDetail:
    listing = self._require_owned(host_id, listing_id)
    if listing.status == ListingStatus.ARCHIVED:
      raise BadRequestError("Unarchive before editing", code="listing_archived")

    self._apply_write(listing, payload)
    saved = self._listing_repo.save_listing(listing)
    avg, count = self._listing_repo.get_rating_stats(saved.id)
    return ListingService(self._listing_repo)._to_detail(saved, avg, count)

  def archive_listing(self, host_id: int, listing_id: int) -> None:
    listing = self._require_owned(host_id, listing_id)
    listing.status = ListingStatus.ARCHIVED
    self._listing_repo.save_listing(listing)

  def restore_listing(self, host_id: int, listing_id: int) -> ListingDetail:
    listing = self._require_owned(host_id, listing_id)
    if listing.status != ListingStatus.ARCHIVED:
      raise BadRequestError("Listing is not archived", code="listing_not_archived")
    listing.status = ListingStatus.ACTIVE
    saved = self._listing_repo.save_listing(listing)
    avg, count = self._listing_repo.get_rating_stats(saved.id)
    return ListingService(self._listing_repo)._to_detail(saved, avg, count)

  def list_bookings(self, host_id: int) -> list[BookingPublic]:
    return [BookingService._to_public(b) for b in self._booking_repo.list_for_host(host_id)]

  def list_listing_bookings(self, host_id: int, listing_id: int) -> list[BookingPublic]:
    self._require_owned(host_id, listing_id)
    return [BookingService._to_public(b) for b in self._booking_repo.list_for_listing(listing_id)]

  def _require_owned(self, host_id: int, listing_id: int) -> Listing:
    listing = self._listing_repo.get_by_id_for_host(listing_id)
    if listing is None:
      raise NotFoundError("Listing not found", code="listing_not_found")
    if listing.host_id != host_id:
      raise ForbiddenError("Not your listing", code="listing_forbidden")
    return listing

  def _build_listing(self, host_id: int, payload: ListingCreate) -> Listing:
    if self._listing_repo.get_category(payload.category_id) is None:
      raise BadRequestError("Invalid category", code="invalid_category")

    amenities = self._listing_repo.get_amenities_by_ids(payload.amenity_ids)
    if len(amenities) != len(set(payload.amenity_ids)):
      raise BadRequestError("One or more amenities are invalid", code="invalid_amenities")

    listing = Listing(
      host_id=host_id,
      category_id=payload.category_id,
      title=payload.title,
      description=payload.description,
      property_type=payload.property_type,
      price_per_night=payload.price_per_night,
      cleaning_fee=payload.cleaning_fee,
      service_fee_percent=payload.service_fee_percent,
      country=payload.country,
      city=payload.city,
      state=payload.state,
      address=payload.address,
      lat=payload.lat,
      lng=payload.lng,
      max_guests=payload.max_guests,
      bedrooms=payload.bedrooms,
      beds=payload.beds,
      bathrooms=payload.bathrooms,
    )
    listing.amenities = amenities
    listing.images = [
      ListingImage(url=img.url, alt_text=img.alt_text, sort_order=i)
      for i, img in enumerate(payload.images)
    ]
    return listing

  def _apply_write(self, listing: Listing, payload: ListingUpdate) -> None:
    if self._listing_repo.get_category(payload.category_id) is None:
      raise BadRequestError("Invalid category", code="invalid_category")

    amenities = self._listing_repo.get_amenities_by_ids(payload.amenity_ids)
    if len(amenities) != len(set(payload.amenity_ids)):
      raise BadRequestError("One or more amenities are invalid", code="invalid_amenities")

    listing.category_id = payload.category_id
    listing.title = payload.title
    listing.description = payload.description
    listing.property_type = payload.property_type
    listing.price_per_night = payload.price_per_night
    listing.cleaning_fee = payload.cleaning_fee
    listing.service_fee_percent = payload.service_fee_percent
    listing.country = payload.country
    listing.city = payload.city
    listing.state = payload.state
    listing.address = payload.address
    listing.lat = payload.lat
    listing.lng = payload.lng
    listing.max_guests = payload.max_guests
    listing.bedrooms = payload.bedrooms
    listing.beds = payload.beds
    listing.bathrooms = payload.bathrooms
    listing.amenities = amenities
    listing.images.clear()
    for i, img in enumerate(payload.images):
      listing.images.append(ListingImage(url=img.url, alt_text=img.alt_text, sort_order=i))
