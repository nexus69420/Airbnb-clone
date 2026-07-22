"""
Wishlist API routes — save / unsave listings.
"""

from fastapi import APIRouter, Response, status
from pydantic import BaseModel

from app.core.deps import CurrentUserDep, DbSession
from app.repositories.listing_repository import ListingRepository
from app.repositories.wishlist_repository import WishlistRepository
from app.schemas.listing import ListingCard
from app.services.wishlist_service import WishlistService

router = APIRouter(prefix="/wishlists", tags=["wishlists"])


class WishlistIdsResponse(BaseModel):
  listing_ids: list[int]


def _service(db: DbSession) -> WishlistService:
  return WishlistService(WishlistRepository(db), ListingRepository(db))


@router.get("", response_model=list[ListingCard])
def list_wishlists(db: DbSession, current_user: CurrentUserDep) -> list[ListingCard]:
  return _service(db).list_cards(current_user.id)


@router.get("/ids", response_model=WishlistIdsResponse)
def list_wishlist_ids(db: DbSession, current_user: CurrentUserDep) -> WishlistIdsResponse:
  return WishlistIdsResponse(listing_ids=_service(db).list_ids(current_user.id))


@router.post("/{listing_id}", status_code=status.HTTP_201_CREATED)
def add_wishlist(listing_id: int, db: DbSession, current_user: CurrentUserDep) -> dict[str, str]:
  _service(db).add(current_user.id, listing_id)
  return {"status": "saved"}


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_wishlist(listing_id: int, db: DbSession, current_user: CurrentUserDep) -> Response:
  _service(db).remove(current_user.id, listing_id)
  return Response(status_code=status.HTTP_204_NO_CONTENT)
