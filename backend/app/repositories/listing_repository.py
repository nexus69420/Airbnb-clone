"""
Listing data-access layer.

Why this file exists:
  SQLAlchemy queries for listings — no business logic, no HTTP concerns.
"""

from datetime import date

from sqlalchemy import exists, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.amenity import Amenity, listing_amenities
from app.models.booking import Booking
from app.models.category import Category
from app.models.enums import BookingStatus, ListingStatus, PropertyType
from app.models.listing import Listing
from app.models.review import Review
from app.schemas.listing_filters import ListingFilters


class ListingRepository:
  """Read queries for active listings."""

  def __init__(self, db: Session) -> None:
    self._db = db

  def list_active(
    self,
    filters: ListingFilters,
  ) -> tuple[list[tuple[Listing, float | None, int]], int]:
    """
    Paginated active listings with rating aggregates and search filters.

    Input: ListingFilters
    Output: ([(listing, avg_rating, review_count), ...], total_count)
    """
    rating_subq = (
      select(
        Review.listing_id,
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("review_count"),
      )
      .group_by(Review.listing_id)
      .subquery()
    )

    base = (
      select(
        Listing,
        rating_subq.c.avg_rating,
        func.coalesce(rating_subq.c.review_count, 0).label("review_count"),
      )
      .outerjoin(rating_subq, Listing.id == rating_subq.c.listing_id)
      .where(Listing.status == ListingStatus.ACTIVE)
    )

    base = self._apply_filters(base, filters)

    count_base = select(Listing.id).where(Listing.status == ListingStatus.ACTIVE)
    count_base = self._apply_filters(count_base, filters)
    total = self._db.scalar(select(func.count()).select_from(count_base.subquery())) or 0

    if filters.sort == "price_asc":
      base = base.order_by(Listing.price_per_night.asc())
    elif filters.sort == "price_desc":
      base = base.order_by(Listing.price_per_night.desc())
    elif filters.sort == "rating_desc":
      base = base.order_by(rating_subq.c.avg_rating.desc().nullslast())
    else:
      base = base.order_by(Listing.created_at.desc())

    offset = (filters.page - 1) * filters.page_size
    rows = self._db.execute(
      base.options(selectinload(Listing.images)).offset(offset).limit(filters.page_size)
    ).all()

    return [(row[0], row[1], int(row[2])) for row in rows], total

  def _apply_filters(self, query, filters: ListingFilters):
    """Apply WHERE clauses for search filters onto a Listing-based select."""
    if filters.location:
      term = f"%{filters.location.strip()}%"
      query = query.where(
        or_(
          Listing.city.ilike(term),
          Listing.state.ilike(term),
          Listing.country.ilike(term),
          Listing.title.ilike(term),
        )
      )

    if filters.guests is not None:
      query = query.where(Listing.max_guests >= filters.guests)

    if filters.min_price is not None:
      query = query.where(Listing.price_per_night >= filters.min_price)

    if filters.max_price is not None:
      query = query.where(Listing.price_per_night <= filters.max_price)

    if filters.category:
      query = query.join(Category, Listing.category_id == Category.id).where(
        Category.slug == filters.category
      )

    if filters.property_type:
      try:
        prop = PropertyType(filters.property_type)
        query = query.where(Listing.property_type == prop)
      except ValueError:
        query = query.where(False)

    if filters.amenities:
      for slug in filters.amenities:
        amenity_exists = (
          select(listing_amenities.c.listing_id)
          .join(Amenity, Amenity.id == listing_amenities.c.amenity_id)
          .where(
            listing_amenities.c.listing_id == Listing.id,
            Amenity.slug == slug,
          )
          .exists()
        )
        query = query.where(amenity_exists)

    if filters.check_in and filters.check_out:
      overlap = exists(
        select(Booking.id).where(
          Booking.listing_id == Listing.id,
          Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
          Booking.check_in < filters.check_out,
          Booking.check_out > filters.check_in,
        )
      )
      query = query.where(~overlap)

    return query

  def get_by_id(self, listing_id: int) -> Listing | None:
    return self._db.scalar(
      select(Listing)
      .where(Listing.id == listing_id, Listing.status == ListingStatus.ACTIVE)
      .options(
        selectinload(Listing.images),
        selectinload(Listing.amenities),
        selectinload(Listing.category),
        selectinload(Listing.host),
      )
    )

  def get_rating_stats(self, listing_id: int) -> tuple[float | None, int]:
    row = self._db.execute(
      select(func.avg(Review.rating), func.count(Review.id)).where(Review.listing_id == listing_id)
    ).one()
    avg, count = row[0], int(row[1])
    return (float(avg) if avg is not None else None, count)

  def list_reviews(
    self,
    listing_id: int,
    *,
    page: int,
    page_size: int,
  ) -> tuple[list[Review], int]:
    total = (
      self._db.scalar(select(func.count()).select_from(Review).where(Review.listing_id == listing_id))
      or 0
    )
    rows = self._db.scalars(
      select(Review)
      .where(Review.listing_id == listing_id)
      .options(selectinload(Review.author))
      .order_by(Review.created_at.desc())
      .offset((page - 1) * page_size)
      .limit(page_size)
    ).all()
    return list(rows), total

  def list_blocked_ranges(
    self,
    listing_id: int,
    *,
    date_from: date | None = None,
    date_to: date | None = None,
  ) -> list[Booking]:
    q = select(Booking).where(
      Booking.listing_id == listing_id,
      Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
    )
    if date_from is not None:
      q = q.where(Booking.check_out > date_from)
    if date_to is not None:
      q = q.where(Booking.check_in < date_to)
    return list(self._db.scalars(q.order_by(Booking.check_in.asc())).all())

  def get_by_id_for_host(self, listing_id: int) -> Listing | None:
    """Any status — host edit/archive needs drafts/archived too."""
    return self._db.scalar(
      select(Listing)
      .where(Listing.id == listing_id)
      .options(
        selectinload(Listing.images),
        selectinload(Listing.amenities),
        selectinload(Listing.category),
        selectinload(Listing.host),
      )
    )

  def list_active_for_host(
    self,
    host_id: int,
    *,
    page: int = 1,
    page_size: int = 24,
  ) -> tuple[list[tuple[Listing, float | None, int]], int]:
    """Paginated active listings for a public host profile."""
    rating_subq = (
      select(
        Review.listing_id,
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("review_count"),
      )
      .group_by(Review.listing_id)
      .subquery()
    )

    base = (
      select(
        Listing,
        rating_subq.c.avg_rating,
        func.coalesce(rating_subq.c.review_count, 0).label("review_count"),
      )
      .outerjoin(rating_subq, Listing.id == rating_subq.c.listing_id)
      .where(Listing.status == ListingStatus.ACTIVE, Listing.host_id == host_id)
      .order_by(Listing.created_at.desc())
    )

    total = (
      self._db.scalar(
        select(func.count())
        .select_from(Listing)
        .where(Listing.status == ListingStatus.ACTIVE, Listing.host_id == host_id)
      )
      or 0
    )

    offset = (page - 1) * page_size
    rows = self._db.execute(
      base.options(selectinload(Listing.images)).offset(offset).limit(page_size)
    ).all()

    return [(row[0], row[1], int(row[2])) for row in rows], total

  def list_for_host(self, host_id: int) -> list[Listing]:
    return list(
      self._db.scalars(
        select(Listing)
        .where(Listing.host_id == host_id)
        .options(selectinload(Listing.images))
        .order_by(Listing.updated_at.desc())
      ).all()
    )

  def host_review_aggregates(self, host_id: int) -> tuple[float | None, int]:
    """Average rating + review count across a host's active listings."""
    row = self._db.execute(
      select(func.avg(Review.rating), func.count(Review.id))
      .select_from(Review)
      .join(Listing, Listing.id == Review.listing_id)
      .where(Listing.host_id == host_id, Listing.status == ListingStatus.ACTIVE)
    ).one()
    avg, count = row[0], int(row[1])
    return (float(avg) if avg is not None else None, count)

  def count_by_host_status(self, host_id: int, status: ListingStatus) -> int:
    return (
      self._db.scalar(
        select(func.count())
        .select_from(Listing)
        .where(Listing.host_id == host_id, Listing.status == status)
      )
      or 0
    )

  def create_listing(self, listing: Listing) -> Listing:
    self._db.add(listing)
    self._db.commit()
    self._db.refresh(listing)
    loaded = self.get_by_id_for_host(listing.id)
    assert loaded is not None
    return loaded

  def save_listing(self, listing: Listing) -> Listing:
    self._db.add(listing)
    self._db.commit()
    self._db.refresh(listing)
    loaded = self.get_by_id_for_host(listing.id)
    assert loaded is not None
    return loaded

  def get_amenities_by_ids(self, amenity_ids: list[int]) -> list[Amenity]:
    if not amenity_ids:
      return []
    return list(self._db.scalars(select(Amenity).where(Amenity.id.in_(amenity_ids))).all())

  def get_category(self, category_id: int) -> Category | None:
    return self._db.get(Category, category_id)
