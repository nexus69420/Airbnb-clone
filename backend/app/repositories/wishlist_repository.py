"""
Wishlist data-access layer.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.listing import Listing
from app.models.wishlist import Wishlist


class WishlistRepository:
  def __init__(self, db: Session) -> None:
    self._db = db

  def list_for_user(self, user_id: int) -> list[Wishlist]:
    return list(
      self._db.scalars(
        select(Wishlist)
        .where(Wishlist.user_id == user_id)
        .options(selectinload(Wishlist.listing).selectinload(Listing.images))
        .order_by(Wishlist.created_at.desc())
      ).all()
    )

  def list_listing_ids(self, user_id: int) -> list[int]:
    rows = self._db.scalars(
      select(Wishlist.listing_id).where(Wishlist.user_id == user_id)
    ).all()
    return list(rows)

  def get(self, user_id: int, listing_id: int) -> Wishlist | None:
    return self._db.scalar(
      select(Wishlist).where(
        Wishlist.user_id == user_id,
        Wishlist.listing_id == listing_id,
      )
    )

  def add(self, user_id: int, listing_id: int) -> Wishlist:
    existing = self.get(user_id, listing_id)
    if existing:
      return existing
    row = Wishlist(user_id=user_id, listing_id=listing_id)
    self._db.add(row)
    self._db.commit()
    self._db.refresh(row)
    return row

  def remove(self, user_id: int, listing_id: int) -> bool:
    row = self.get(user_id, listing_id)
    if row is None:
      return False
    self._db.delete(row)
    self._db.commit()
    return True
