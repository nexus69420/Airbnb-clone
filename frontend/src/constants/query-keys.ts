/**
 * TanStack Query key factory.
 */

export const queryKeys = {
  listings: {
    all: ["listings"] as const,
    list: (params: object) => ["listings", "list", params] as const,
    detail: (id: number) => ["listings", "detail", id] as const,
    reviews: (id: number, page: number) => ["listings", "reviews", id, page] as const,
    availability: (id: number) => ["listings", "availability", id] as const,
  },
  categories: ["categories"] as const,
  amenities: ["amenities"] as const,
  wishlists: {
    all: ["wishlists"] as const,
    ids: ["wishlists", "ids"] as const,
    list: ["wishlists", "list"] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    trips: ["bookings", "trips"] as const,
    detail: (id: number) => ["bookings", "detail", id] as const,
  },
  host: {
    all: ["host"] as const,
    dashboard: ["host", "dashboard"] as const,
    listings: ["host", "listings"] as const,
    listing: (id: number) => ["host", "listing", id] as const,
    bookings: ["host", "bookings"] as const,
  },
  publicHosts: {
    profile: (id: number) => ["publicHosts", "profile", id] as const,
    listings: (id: number, page: number) => ["publicHosts", "listings", id, page] as const,
  },
} as const;
