/**
 * Rough city → lat/lng for host listing forms and map pins (demo geocode).
 */

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  bali: { lat: -8.4095, lng: 115.1889 },
  ubud: { lat: -8.5069, lng: 115.2625 },
  canggu: { lat: -8.6478, lng: 115.1385 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  london: { lat: 51.5074, lng: -0.1278 },
  rome: { lat: 41.9028, lng: 12.4964 },
  florence: { lat: 43.7696, lng: 11.2558 },
  malibu: { lat: 34.0259, lng: -118.7798 },
  "san francisco": { lat: 37.7749, lng: -122.4194 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  paris: { lat: 48.8566, lng: 2.3522 },
  "new york": { lat: 40.7128, lng: -74.006 },
  noida: { lat: 28.5355, lng: 77.391 },
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  barcelona: { lat: 41.3874, lng: 2.1686 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  berlin: { lat: 52.52, lng: 13.405 },
  sydney: { lat: -33.8688, lng: 151.2093 },
};

/** Resolve coordinates from explicit values or a known city name. */
export function resolveListingCoords(
  city: string,
  lat: number | null | undefined,
  lng: number | null | undefined,
): { lat: number | null; lng: number | null } {
  if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }
  const key = city.trim().toLowerCase();
  const hit = CITY_COORDS[key];
  if (hit) return hit;
  return { lat: lat ?? null, lng: lng ?? null };
}

/** Map pin with light jitter so same-city cards don’t stack. */
export function listingMapPin(
  listing: { city: string; lat?: number | null; lng?: number | null; id: number },
  index: number,
): { lat: number; lng: number } | null {
  const base = resolveListingCoords(listing.city, listing.lat, listing.lng);
  if (base.lat == null || base.lng == null) return null;
  const hasExact = listing.lat != null && listing.lng != null;
  if (hasExact) return { lat: base.lat, lng: base.lng };
  const j = 0.012 + (listing.id % 7) * 0.002;
  return {
    lat: base.lat + Math.sin(index * 2.3 + listing.id) * j,
    lng: base.lng + Math.cos(index * 1.7 + listing.id) * j,
  };
}
