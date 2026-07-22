"""
Public host profile endpoints — view a host and their active listings.
"""

from typing import Annotated

from fastapi import APIRouter, Query

from app.core.deps import DbSession
from app.repositories.listing_repository import ListingRepository
from app.repositories.user_repository import UserRepository
from app.schemas.common import PaginatedResponse
from app.schemas.host_public import HostProfilePublic
from app.schemas.listing import ListingCard
from app.services.public_host_service import PublicHostService

router = APIRouter(prefix="/hosts", tags=["hosts"])


def _service(db: DbSession) -> PublicHostService:
  return PublicHostService(UserRepository(db), ListingRepository(db))


@router.get("/{host_id}", response_model=HostProfilePublic)
def get_host_profile(host_id: int, db: DbSession) -> HostProfilePublic:
  return _service(db).get_profile(host_id)


@router.get("/{host_id}/listings", response_model=PaginatedResponse[ListingCard])
def list_host_listings(
  host_id: int,
  db: DbSession,
  page: Annotated[int, Query(ge=1)] = 1,
  page_size: Annotated[int, Query(ge=1, le=48)] = 24,
) -> PaginatedResponse[ListingCard]:
  return _service(db).list_listings(host_id, page=page, page_size=page_size)
