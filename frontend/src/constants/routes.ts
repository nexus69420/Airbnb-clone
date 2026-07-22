/**
 * Application route paths.
 *
 * Why this file exists:
 *   Avoid magic strings in links and redirects across the app.
 */

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  wishlists: "/wishlists",
  trips: "/trips",
  tripConfirm: (bookingId: number) => `/trips/${bookingId}/confirm` as const,
  bookingCheckout: (bookingId: number) => `/bookings/${bookingId}/checkout` as const,
  listing: (id: number) => `/listings/${id}` as const,
  hostProfile: (id: number) => `/hosts/${id}` as const,
  host: "/host",
  hostListings: "/host/listings",
  hostListingsNew: "/host/listings/new",
  hostListingEdit: (id: number) => `/host/listings/${id}/edit` as const,
  hostBookings: "/host/bookings",
} as const;
