"""
Shared API response wrappers.

Why this file exists:
  Consistent pagination envelope across all list endpoints.
"""

from pydantic import BaseModel


class PaginatedResponse[T](BaseModel):
  items: list[T]
  total: int
  page: int
  page_size: int
  pages: int
