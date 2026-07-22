"""
Domain enums stored as strings in SQLite.

Why this file exists:
  Constrains status/property values at the application layer and documents
  allowed states for services and API validation in later milestones.
"""

import enum


class PropertyType(str, enum.Enum):
  HOUSE = "house"
  APARTMENT = "apartment"
  GUESTHOUSE = "guesthouse"
  HOTEL = "hotel"
  VILLA = "villa"
  CABIN = "cabin"


class ListingStatus(str, enum.Enum):
  DRAFT = "draft"
  ACTIVE = "active"
  ARCHIVED = "archived"


class BookingStatus(str, enum.Enum):
  PENDING = "pending"
  CONFIRMED = "confirmed"
  CANCELLED = "cancelled"
  COMPLETED = "completed"
