"""
Database seed script.

Why this file exists:
  Populates SQLite with realistic demo data so the app is immediately usable
  after `alembic upgrade head` — required by the assignment PDF.

Usage (from backend/):
  python -m scripts.seed
  python -m scripts.seed --force   # wipe and reseed
"""

from __future__ import annotations

import argparse
from datetime import date

from sqlalchemy import delete, func, select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import (
  Amenity,
  Booking,
  Category,
  Listing,
  ListingImage,
  ListingStatus,
  Review,
  User,
  Wishlist,
)
from app.models.amenity import listing_amenities
from scripts.seed_data import (
  AMENITIES,
  BOOKINGS,
  CATEGORIES,
  DEMO_PASSWORD,
  LISTINGS,
  USERS,
  WISHLISTS,
)

# Extra Unsplash URLs used to pad listings that only have 1–2 photos.
_IMAGE_PAD = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
]


def _ensure_min_images(urls: list[str], min_count: int = 3) -> list[str]:
  """Guarantee every listing has at least `min_count` gallery photos."""
  out = list(urls)
  for pad in _IMAGE_PAD:
    if len(out) >= min_count:
      break
    if pad not in out:
      out.append(pad)
  # Absolute fallback if pad list somehow exhausted
  i = 0
  while len(out) < min_count:
    out.append(_IMAGE_PAD[i % len(_IMAGE_PAD)])
    i += 1
  return out


def _parse_date(value: str) -> date:
  return date.fromisoformat(value)


def _calculate_totals(
  price_per_night: int,
  cleaning_fee: int,
  service_fee_percent: int,
  check_in: date,
  check_out: date,
) -> tuple[int, int, int, int]:
  """
  Compute booking price snapshot fields.

  Input: listing pricing + date range
  Output: (nightly_rate_cents, cleaning_fee_cents, service_fee_cents, total_cents)
  Reasoning: Mirrors the fee logic the booking service will use in Milestone 7.
  """
  nights = (check_out - check_in).days
  subtotal = price_per_night * nights
  service_fee = int(subtotal * service_fee_percent / 100)
  total = subtotal + cleaning_fee + service_fee
  return price_per_night, cleaning_fee, service_fee, total


def _clear_all(session) -> None:
  """Delete all seeded data in FK-safe order."""
  session.execute(delete(Review))
  session.execute(delete(Booking))
  session.execute(delete(Wishlist))
  session.execute(delete(ListingImage))
  session.execute(delete(listing_amenities))
  session.execute(delete(Listing))
  session.execute(delete(Amenity))
  session.execute(delete(Category))
  session.execute(delete(User))
  session.commit()


def seed(*, force: bool = False) -> None:
  """
  Seed the database with categories, amenities, users, listings, bookings, and wishlists.

  Input: force — if True, wipe existing data first
  Output: none (commits to DB)
  Reasoning: Idempotent by default so devs can run safely after migrations.
  """
  session = SessionLocal()

  try:
    existing_users = session.scalar(select(User).limit(1))
    if existing_users and not force:
      print("Database already seeded. Use --force to wipe and reseed.")
      return

    if force:
      print("Clearing existing data...")
      _clear_all(session)

    print("Seeding categories...")
    category_by_slug: dict[str, Category] = {}
    for row in CATEGORIES:
      category = Category(**row)
      session.add(category)
      category_by_slug[row["slug"]] = category
    session.flush()

    print("Seeding amenities...")
    amenity_by_slug: dict[str, Amenity] = {}
    for row in AMENITIES:
      amenity = Amenity(**row)
      session.add(amenity)
      amenity_by_slug[row["slug"]] = amenity
    session.flush()

    print("Seeding users...")
    user_by_email: dict[str, User] = {}
    password_hash = hash_password(DEMO_PASSWORD)
    for row in USERS:
      user = User(
        email=row["email"],
        hashed_password=password_hash,
        full_name=row["full_name"],
        avatar_url=row["avatar_url"],
        is_host=row["is_host"],
        is_superhost=row["is_superhost"],
      )
      session.add(user)
      user_by_email[row["email"]] = user
    session.flush()

    print("Seeding listings...")
    listing_by_title: dict[str, Listing] = {}
    for row in LISTINGS:
      host = user_by_email[row["host_email"]]
      category = category_by_slug[row["category_slug"]]
      listing = Listing(
        host_id=host.id,
        category_id=category.id,
        title=row["title"],
        description=row["description"],
        property_type=row["property_type"],
        price_per_night=row["price_per_night"],
        cleaning_fee=row["cleaning_fee"],
        service_fee_percent=12,
        country=row["country"],
        city=row["city"],
        state=row["state"],
        address=row["address"],
        lat=row["lat"],
        lng=row["lng"],
        max_guests=row["max_guests"],
        bedrooms=row["bedrooms"],
        beds=row["beds"],
        bathrooms=row["bathrooms"],
        status=ListingStatus.ACTIVE,
      )
      listing.amenities = [amenity_by_slug[slug] for slug in row["amenity_slugs"]]
      session.add(listing)
      session.flush()

      image_urls = _ensure_min_images(row["images"], min_count=3)
      for index, url in enumerate(image_urls):
        session.add(
          ListingImage(
            listing_id=listing.id,
            url=url,
            alt_text=row["title"],
            sort_order=index,
          )
        )

      listing_by_title[row["title"]] = listing

    session.flush()

    print("Seeding bookings...")
    for row in BOOKINGS:
      listing = listing_by_title[row["listing_title"]]
      guest = user_by_email[row["guest_email"]]
      check_in = _parse_date(row["check_in"])
      check_out = _parse_date(row["check_out"])
      nightly, cleaning, service_fee, total = _calculate_totals(
        listing.price_per_night,
        listing.cleaning_fee,
        listing.service_fee_percent,
        check_in,
        check_out,
      )
      booking = Booking(
        listing_id=listing.id,
        guest_id=guest.id,
        check_in=check_in,
        check_out=check_out,
        guests=row["guests"],
        status=row["status"],
        nightly_rate_cents=nightly,
        cleaning_fee_cents=cleaning,
        service_fee_cents=service_fee,
        total_cents=total,
      )
      session.add(booking)
      session.flush()

      if row.get("with_review"):
        session.add(
          Review(
            booking_id=booking.id,
            listing_id=listing.id,
            author_id=guest.id,
            rating=row["review_rating"],
            comment=row["review_comment"],
          )
        )

    print("Seeding wishlists...")
    for row in WISHLISTS:
      session.add(
        Wishlist(
          user_id=user_by_email[row["user_email"]].id,
          listing_id=listing_by_title[row["listing_title"]].id,
        )
      )

    session.commit()

    counts = {
      "users": session.scalar(select(func.count()).select_from(User)),
      "categories": session.scalar(select(func.count()).select_from(Category)),
      "amenities": session.scalar(select(func.count()).select_from(Amenity)),
      "listings": session.scalar(select(func.count()).select_from(Listing)),
      "bookings": session.scalar(select(func.count()).select_from(Booking)),
      "reviews": session.scalar(select(func.count()).select_from(Review)),
      "wishlists": session.scalar(select(func.count()).select_from(Wishlist)),
    }

    print("Seed complete.")
    for key, value in counts.items():
      print(f"  {key}: {value}")
    print(f"\nDemo login: alex@example.com / {DEMO_PASSWORD}")

  except Exception:
    session.rollback()
    raise
  finally:
    session.close()


def main() -> None:
  parser = argparse.ArgumentParser(description="Seed the Airbnb clone database")
  parser.add_argument(
    "--force",
    action="store_true",
    help="Wipe existing data and reseed from scratch",
  )
  args = parser.parse_args()
  seed(force=args.force)


if __name__ == "__main__":
  main()
