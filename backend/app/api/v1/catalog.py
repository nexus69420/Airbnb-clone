"""
Categories and amenities catalog routes.

Why this file exists:
  Powers the explore category pills and filter drawer without hardcoding options in the FE.
"""

from fastapi import APIRouter
from sqlalchemy import select

from app.core.deps import DbSession
from app.models.amenity import Amenity
from app.models.category import Category
from app.schemas.catalog import AmenityPublic, CategoryPublic

router = APIRouter(tags=["catalog"])


@router.get("/categories", response_model=list[CategoryPublic])
def list_categories(db: DbSession) -> list[CategoryPublic]:
  rows = db.scalars(select(Category).order_by(Category.sort_order.asc())).all()
  return [CategoryPublic.model_validate(row) for row in rows]


@router.get("/amenities", response_model=list[AmenityPublic])
def list_amenities(db: DbSession) -> list[AmenityPublic]:
  rows = db.scalars(select(Amenity).order_by(Amenity.amenity_group.asc(), Amenity.name.asc())).all()
  return [AmenityPublic.model_validate(row) for row in rows]
