"""
Public host profile schemas.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class HostProfilePublic(BaseModel):
  """Public host page + Meet your host section."""

  model_config = ConfigDict(from_attributes=True)

  id: int
  full_name: str
  avatar_url: str | None
  is_superhost: bool
  created_at: datetime
  listing_count: int = 0
  review_count: int = 0
  rating: float | None = None
  response_rate: int = Field(default=95, description="Demo response rate %")
  response_time: str = Field(default="within an hour")
