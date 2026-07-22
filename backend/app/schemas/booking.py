"""
Booking API schemas.

Why this file exists:
  Request/response shapes for create, checkout, cancel, and My Trips.
  Totals are always server-computed; clients never send money amounts.
"""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import BookingStatus


class BookingCreate(BaseModel):
  listing_id: int = Field(gt=0)
  check_in: date
  check_out: date
  guests: int = Field(ge=1)


class BookingListingSummary(BaseModel):
  """Listing snapshot embedded on trip / checkout cards."""

  model_config = ConfigDict(from_attributes=True)

  id: int
  title: str
  city: str
  country: str
  image_url: str | None = None


class BookingPublic(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  id: int
  listing_id: int
  guest_id: int
  check_in: date
  check_out: date
  guests: int
  status: BookingStatus
  nightly_rate_cents: int
  cleaning_fee_cents: int
  service_fee_cents: int
  total_cents: int
  created_at: datetime
  listing: BookingListingSummary | None = None
  has_review: bool = False
  can_review: bool = False


class TripsResponse(BaseModel):
  upcoming: list[BookingPublic]
  past: list[BookingPublic]
  cancelled: list[BookingPublic]
