"""
Listing API schemas.

Why this file exists:
  Card vs detail shapes — home grid uses ListingCard; detail page uses ListingDetail.
"""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import PropertyType
from app.schemas.catalog import AmenityPublic, CategoryPublic


class ListingImagePublic(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  id: int
  url: str
  alt_text: str | None
  sort_order: int


class HostPublic(BaseModel):
  """Host fields shown on the listing detail page."""

  model_config = ConfigDict(from_attributes=True)

  id: int
  full_name: str
  avatar_url: str | None
  is_superhost: bool
  created_at: datetime | None = None


class ListingCard(BaseModel):
  """Minimal listing shape for explore grid cards."""

  model_config = ConfigDict(from_attributes=True)

  id: int
  title: str
  city: str
  state: str | None
  country: str
  price_per_night: int = Field(description="Nightly rate in cents")
  property_type: PropertyType
  image_url: str | None
  image_urls: list[str] = Field(default_factory=list)
  rating: float | None = Field(default=None, description="Average review rating 1–5")
  review_count: int = 0
  lat: float | None = None
  lng: float | None = None


class ListingDetail(BaseModel):
  """Full listing payload for the detail page."""

  model_config = ConfigDict(from_attributes=True)

  id: int
  title: str
  description: str
  city: str
  state: str | None
  country: str
  address: str
  lat: float | None
  lng: float | None
  price_per_night: int
  cleaning_fee: int
  service_fee_percent: int
  currency: str
  property_type: PropertyType
  max_guests: int
  bedrooms: int
  beds: int
  bathrooms: int
  rating: float | None
  review_count: int
  images: list[ListingImagePublic]
  amenities: list[AmenityPublic]
  category: CategoryPublic
  host: HostPublic


class ReviewPublic(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  id: int
  rating: int
  comment: str
  created_at: date | None = None
  author_name: str
  author_avatar_url: str | None = None


class BlockedRange(BaseModel):
  check_in: date
  check_out: date


class AvailabilityResponse(BaseModel):
  listing_id: int
  blocked: list[BlockedRange]
