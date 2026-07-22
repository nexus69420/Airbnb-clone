"""
ORM model package — import all models so Alembic sees full metadata.

Why this file exists:
  Alembic env.py imports from here; missing imports mean missing tables in migrations.
"""

from app.models.amenity import Amenity, listing_amenities
from app.models.booking import Booking
from app.models.category import Category
from app.models.enums import BookingStatus, ListingStatus, PropertyType
from app.models.listing import Listing
from app.models.listing_image import ListingImage
from app.models.review import Review
from app.models.user import User
from app.models.wishlist import Wishlist

__all__ = [
  "Amenity",
  "Booking",
  "BookingStatus",
  "Category",
  "Listing",
  "ListingImage",
  "ListingStatus",
  "PropertyType",
  "Review",
  "User",
  "Wishlist",
  "listing_amenities",
]
