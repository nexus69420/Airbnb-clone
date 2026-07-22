/**
 * Booking / trips TypeScript types (mirror backend BookingPublic).
 */

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface BookingListingSummary {
  id: number;
  title: string;
  city: string;
  country: string;
  image_url: string | null;
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  status: BookingStatus;
  nightly_rate_cents: number;
  cleaning_fee_cents: number;
  service_fee_cents: number;
  total_cents: number;
  created_at: string;
  listing: BookingListingSummary | null;
  has_review?: boolean;
  can_review?: boolean;
}

export interface TripsResponse {
  upcoming: Booking[];
  past: Booking[];
  cancelled: Booking[];
}

export interface CreateBookingPayload {
  listing_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}
