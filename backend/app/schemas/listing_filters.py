"""
Listing search filter DTO.

Why this file exists:
  Keeps filter fields typed and shared between router → service → repository.
"""

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class ListingFilters:
  location: str | None = None
  guests: int | None = None
  min_price: int | None = None  # cents
  max_price: int | None = None  # cents
  category: str | None = None  # slug
  property_type: str | None = None
  amenities: tuple[str, ...] = ()  # amenity slugs
  check_in: date | None = None
  check_out: date | None = None
  sort: str = "newest"
  page: int = 1
  page_size: int = 12
