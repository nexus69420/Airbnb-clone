"""
API v1 aggregator.

Why this file exists:
  Single mount point for all v1 routers so main.py stays thin as endpoints grow.
"""

from fastapi import APIRouter

from app.api.v1 import auth, bookings, catalog, chat, health, host, hosts, listings, reviews, wishlists

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(catalog.router)
api_router.include_router(listings.router)
api_router.include_router(wishlists.router)
api_router.include_router(bookings.router)
api_router.include_router(host.router)
api_router.include_router(hosts.router)
api_router.include_router(chat.router)
api_router.include_router(reviews.router)
