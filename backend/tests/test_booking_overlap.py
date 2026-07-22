"""
Booking overlap unit tests (half-open [check_in, check_out)).
"""

from datetime import date

from app.repositories.booking_repository import BookingRepository


def test_half_open_overlap_logic():
  """
  Document expected overlap without DB: ranges [A,B) and [C,D) overlap iff A < D and C < B.
  Mirrors BookingRepository.has_overlap predicate.
  """

  def overlaps(a: date, b: date, c: date, d: date) -> bool:
    return a < d and c < b

  # Adjacent nights — no overlap
  assert not overlaps(date(2026, 8, 1), date(2026, 8, 3), date(2026, 8, 3), date(2026, 8, 5))
  # Nested
  assert overlaps(date(2026, 8, 1), date(2026, 8, 10), date(2026, 8, 3), date(2026, 8, 4))
  # Partial
  assert overlaps(date(2026, 8, 1), date(2026, 8, 5), date(2026, 8, 4), date(2026, 8, 8))
  # Same start
  assert overlaps(date(2026, 8, 1), date(2026, 8, 3), date(2026, 8, 1), date(2026, 8, 2))


def test_booking_repository_exists():
  assert BookingRepository is not None
