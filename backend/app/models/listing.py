"""
Listing ORM model — core marketplace entity.

Why this file exists:
  Stores property metadata, pricing (in cents), location, and soft-delete status.
  Relationships wire images, amenities, bookings, reviews, and wishlists.
"""

from sqlalchemy import Enum, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.amenity import listing_amenities
from app.models.enums import ListingStatus, PropertyType


class Listing(Base, TimestampMixin):
  __tablename__ = "listings"
  __table_args__ = (
    Index("ix_listings_city", "city"),
    Index("ix_listings_price_per_night", "price_per_night"),
    Index("ix_listings_category_id", "category_id"),
    Index("ix_listings_host_id", "host_id"),
    Index("ix_listings_status", "status"),
    Index("ix_listings_lat_lng", "lat", "lng"),
  )

  id: Mapped[int] = mapped_column(primary_key=True)
  host_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
  title: Mapped[str] = mapped_column(String(255), nullable=False)
  description: Mapped[str] = mapped_column(Text, nullable=False)
  property_type: Mapped[PropertyType] = mapped_column(Enum(PropertyType), nullable=False)
  price_per_night: Mapped[int] = mapped_column(Integer, nullable=False)
  cleaning_fee: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
  service_fee_percent: Mapped[int] = mapped_column(Integer, default=12, nullable=False)
  currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
  country: Mapped[str] = mapped_column(String(100), nullable=False)
  city: Mapped[str] = mapped_column(String(100), nullable=False)
  state: Mapped[str | None] = mapped_column(String(100), nullable=True)
  address: Mapped[str] = mapped_column(String(255), nullable=False)
  lat: Mapped[float | None] = mapped_column(Float, nullable=True)
  lng: Mapped[float | None] = mapped_column(Float, nullable=True)
  max_guests: Mapped[int] = mapped_column(Integer, nullable=False)
  bedrooms: Mapped[int] = mapped_column(Integer, nullable=False)
  beds: Mapped[int] = mapped_column(Integer, nullable=False)
  bathrooms: Mapped[int] = mapped_column(Integer, nullable=False)
  status: Mapped[ListingStatus] = mapped_column(
    Enum(ListingStatus),
    default=ListingStatus.ACTIVE,
    nullable=False,
  )

  host = relationship("User", back_populates="listings")
  category = relationship("Category", back_populates="listings")
  images = relationship(
    "ListingImage",
    back_populates="listing",
    cascade="all, delete-orphan",
    order_by="ListingImage.sort_order",
  )
  amenities = relationship("Amenity", secondary=listing_amenities, back_populates="listings")
  bookings = relationship("Booking", back_populates="listing")
  reviews = relationship("Review", back_populates="listing")
  wishlists = relationship("Wishlist", back_populates="listing", cascade="all, delete-orphan")
