"""
Wishlist business logic.
"""

from app.core.exceptions import NotFoundError
from app.repositories.listing_repository import ListingRepository
from app.repositories.wishlist_repository import WishlistRepository
from app.schemas.listing import ListingCard
from app.services.listing_service import ListingService


class WishlistService:
  def __init__(
    self,
    wishlist_repo: WishlistRepository,
    listing_repo: ListingRepository,
  ) -> None:
    self._wishlist_repo = wishlist_repo
    self._listing_repo = listing_repo

  def list_ids(self, user_id: int) -> list[int]:
    return self._wishlist_repo.list_listing_ids(user_id)

  def list_cards(self, user_id: int) -> list[ListingCard]:
    rows = self._wishlist_repo.list_for_user(user_id)
    cards: list[ListingCard] = []
    for row in rows:
      listing = row.listing
      if listing is None:
        continue
      avg, count = self._listing_repo.get_rating_stats(listing.id)
      cards.append(ListingService._to_card(listing, avg, count))
    return cards

  def add(self, user_id: int, listing_id: int) -> None:
    if self._listing_repo.get_by_id(listing_id) is None:
      raise NotFoundError("Listing not found", code="listing_not_found")
    self._wishlist_repo.add(user_id, listing_id)

  def remove(self, user_id: int, listing_id: int) -> None:
    removed = self._wishlist_repo.remove(user_id, listing_id)
    if not removed:
      # Idempotent delete — treat missing as success for UX
      return
