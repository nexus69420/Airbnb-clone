"""
Rule-based listing chatbot service — deterministic FAQ from listing facts.
"""

from pydantic import BaseModel, Field

from app.repositories.listing_repository import ListingRepository
from app.services.listing_service import ListingService

DEFAULT_SUGGESTIONS = [
  "What's the price?",
  "How many guests?",
  "What amenities are included?",
  "Where is it located?",
  "Tell me about the host",
]


class ChatMessageIn(BaseModel):
  listing_id: int
  message: str = Field(min_length=1, max_length=1000)


class ChatMessageOut(BaseModel):
  reply: str
  suggestions: list[str] = Field(default_factory=list)


class ChatService:
  def __init__(self, listing_repo: ListingRepository) -> None:
    self._listings = ListingService(listing_repo)

  def reply(self, payload: ChatMessageIn) -> ChatMessageOut:
    listing = self._listings.get_listing(payload.listing_id)
    text = payload.message.strip().lower()
    return ChatMessageOut(reply=self._match(text, listing), suggestions=DEFAULT_SUGGESTIONS)

  def _match(self, text: str, listing) -> str:
    price = listing.price_per_night / 100
    cleaning = listing.cleaning_fee / 100
    amenity_names = [a.name for a in listing.amenities]
    amenity_preview = ", ".join(amenity_names[:8]) if amenity_names else "standard amenities"
    location = ", ".join(p for p in [listing.city, listing.state, listing.country] if p)
    host = listing.host.full_name
    superhost = " (Superhost)" if listing.host.is_superhost else ""

    if any(k in text for k in ("price", "cost", "rate", "night", "fee", "how much")):
      return (
        f"This stay is ${price:,.0f} per night"
        f"{f' plus a ${cleaning:,.0f} cleaning fee' if cleaning else ''}"
        f" (service fee {listing.service_fee_percent}% is added at checkout). "
        "You won't be charged until you reserve and confirm."
      )

    if any(k in text for k in ("guest", "people", "capacity", "how many", "sleep")):
      return (
        f"Up to {listing.max_guests} guests can stay. "
        f"There are {listing.bedrooms} bedroom(s), {listing.beds} bed(s), "
        f"and {listing.bathrooms} bathroom(s)."
      )

    if any(k in text for k in ("amenit", "wifi", "parking", "kitchen", "offer", "include")):
      return (
        f"Here's what this place offers: {amenity_preview}"
        f"{'…' if len(amenity_names) > 8 else ''}. "
        "Open “What this place offers” on the listing for the full list."
      )

    if any(k in text for k in ("where", "location", "address", "map", "area", "city")):
      return (
        f"You'll be in {location}. "
        "Exact address is shared after booking confirmation for privacy."
      )

    if any(k in text for k in ("host", "superhost", "owner", "who hosts", "message")):
      return (
        f"You're chatting about a stay hosted by {host}{superhost}. "
        "I can answer listing questions anytime. To see all of their homes, "
        "open their profile from Meet your host."
      )

    if any(k in text for k in ("cancel", "refund", "policy")):
      return (
        "Free cancellation is available until 24 hours before check-in for this demo. "
        "After that, the first night may be non-refundable. "
        "See Things to know on the listing for house rules."
      )

    if any(k in text for k in ("check-in", "check in", "checkout", "check out", "arrive")):
      return (
        "Typical house rules for this demo: check-in after 3:00 PM, "
        f"checkout before 11:00 AM, max {listing.max_guests} guests. "
        "Self check-in details are sent after you confirm a reservation."
      )

    if any(k in text for k in ("review", "rating", "star")):
      if listing.review_count and listing.rating is not None:
        return (
          f"Guests rate this place {listing.rating:.2f} ★ "
          f"across {listing.review_count} review"
          f"{'' if listing.review_count == 1 else 's'}."
        )
      return "This listing doesn't have reviews yet — be one of the first guests!"

    if any(k in text for k in ("hi", "hello", "hey", "help")):
      return (
        f"Hi! I'm the StayBot assistant for “{listing.title}”. "
        "Ask me about price, guests, amenities, location, the host, or cancellation."
      )

    return (
      f"I'm the assistant for “{listing.title}” in {listing.city}. "
      "Try asking about price, guest capacity, amenities, location, the host, "
      "or cancellation — or tap a suggestion below."
    )
