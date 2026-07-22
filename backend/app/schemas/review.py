"""
Review create / read schemas.
"""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
  booking_id: int = Field(gt=0)
  rating: int = Field(ge=1, le=5)
  comment: str = Field(min_length=10, max_length=2000)


class ReviewPublic(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  id: int
  rating: int
  comment: str
  created_at: date | None = None
  author_name: str
  author_avatar_url: str | None = None
  listing_id: int | None = None
  booking_id: int | None = None
