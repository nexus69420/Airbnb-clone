"""
Listing chatbot endpoint — rule-based replies from listing data.
"""

from fastapi import APIRouter

from app.core.deps import DbSession
from app.repositories.listing_repository import ListingRepository
from app.services.chat_service import ChatMessageIn, ChatMessageOut, ChatService

router = APIRouter(prefix="/chat", tags=["chat"])


def _service(db: DbSession) -> ChatService:
  return ChatService(ListingRepository(db))


@router.post("", response_model=ChatMessageOut)
def post_chat(payload: ChatMessageIn, db: DbSession) -> ChatMessageOut:
  return _service(db).reply(payload)
