"""
Host panel request/response schemas.
"""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ListingStatus, PropertyType
from app.schemas.booking import BookingPublic


class ListingImageInput(BaseModel):
  url: str = Field(min_length=8, max_length=512)
  alt_text: str | None = None


class ListingWrite(BaseModel):
  """Shared create/update fields. Money in integer cents."""

  title: str = Field(min_length=3, max_length=255)
  description: str = Field(min_length=20)
  category_id: int = Field(gt=0)
  property_type: PropertyType
  price_per_night: int = Field(gt=0, description="Cents")
  cleaning_fee: int = Field(ge=0, description="Cents")
  service_fee_percent: int = Field(ge=0, le=30, default=12)
  country: str = Field(min_length=2, max_length=100)
  city: str = Field(min_length=1, max_length=100)
  state: str | None = None
  address: str = Field(min_length=3, max_length=255)
  lat: float | None = None
  lng: float | None = None
  max_guests: int = Field(ge=1, le=50)
  bedrooms: int = Field(ge=0, le=50)
  beds: int = Field(ge=1, le=50)
  bathrooms: int = Field(ge=1, le=50)
  amenity_ids: list[int] = Field(default_factory=list)
  images: list[ListingImageInput] = Field(min_length=1)


class ListingCreate(ListingWrite):
  pass


class ListingUpdate(ListingWrite):
  pass


class HostListingCard(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  id: int
  title: str
  city: str
  country: str
  price_per_night: int
  status: ListingStatus
  property_type: PropertyType
  image_url: str | None = None
  upcoming_bookings: int = 0


class HostDashboardStats(BaseModel):
  active_listings: int
  archived_listings: int
  upcoming_bookings: int
  pending_bookings: int


class HostBookingList(BaseModel):
  items: list[BookingPublic]
