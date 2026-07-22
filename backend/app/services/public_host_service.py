"""
Public host profile service — profile + active listings for /hosts/{id}.
"""

import math

from app.core.exceptions import NotFoundError
from app.models.enums import ListingStatus
from app.repositories.listing_repository import ListingRepository
from app.repositories.user_repository import UserRepository
from app.schemas.common import PaginatedResponse
from app.schemas.host_public import HostProfilePublic
from app.schemas.listing import ListingCard
from app.services.listing_service import ListingService


class PublicHostService:
  def __init__(self, user_repo: UserRepository, listing_repo: ListingRepository) -> None:
    self._user_repo = user_repo
    self._listing_repo = listing_repo

  def get_profile(self, host_id: int) -> HostProfilePublic:
    user = self._user_repo.get_by_id(host_id)
    if user is None or not user.is_host:
      raise NotFoundError("Host not found", code="host_not_found")

    listing_count = self._listing_repo.count_by_host_status(host_id, ListingStatus.ACTIVE)
    if listing_count == 0:
      raise NotFoundError("Host not found", code="host_not_found")

    avg, review_count = self._listing_repo.host_review_aggregates(host_id)
    rating = round(float(avg), 2) if avg is not None else None

    return HostProfilePublic(
      id=user.id,
      full_name=user.full_name,
      avatar_url=user.avatar_url,
      is_superhost=user.is_superhost,
      created_at=user.created_at,
      listing_count=listing_count,
      review_count=review_count,
      rating=rating,
    )

  def list_listings(
    self,
    host_id: int,
    *,
    page: int = 1,
    page_size: int = 24,
  ) -> PaginatedResponse[ListingCard]:
    # Ensures host exists / has public listings
    self.get_profile(host_id)

    rows, total = self._listing_repo.list_active_for_host(
      host_id, page=page, page_size=page_size
    )
    items = [
      ListingService._to_card(listing, avg_rating, review_count)
      for listing, avg_rating, review_count in rows
    ]
    pages = math.ceil(total / page_size) if page_size else 0
    return PaginatedResponse(
      items=items,
      total=total,
      page=page,
      page_size=page_size,
      pages=pages,
    )
