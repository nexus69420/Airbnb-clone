"""
Catalog schemas for categories and amenities filter UI.
"""

from pydantic import BaseModel, ConfigDict


class CategoryPublic(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  id: int
  name: str
  slug: str
  icon_key: str
  sort_order: int


class AmenityPublic(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  id: int
  name: str
  slug: str
  icon_key: str
  amenity_group: str
