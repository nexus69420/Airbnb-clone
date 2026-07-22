/**
 * Search / filter params synced to the home URL query string.
 */

import type { PropertyType } from "@/types/listing";

export type SortOption = "newest" | "price_asc" | "price_desc" | "rating_desc";

export interface SearchParamsState {
  location: string;
  /** Capacity filter sent to API (adults + children). */
  guests: number | null;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  min_price: number | null; // dollars (UI); converted to cents for API
  max_price: number | null;
  category: string | null;
  property_type: PropertyType | null;
  amenities: string[];
  check_in: string | null; // YYYY-MM-DD
  check_out: string | null;
  sort: SortOption;
  page: number;
}

export const DEFAULT_SEARCH: SearchParamsState = {
  location: "",
  guests: null,
  adults: 0,
  children: 0,
  infants: 0,
  pets: 0,
  min_price: null,
  max_price: null,
  category: null,
  property_type: null,
  amenities: [],
  check_in: null,
  check_out: null,
  sort: "newest",
  page: 1,
};

/** Add one calendar day to a YYYY-MM-DD string. */
function addOneDay(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Normalize stay dates for Airbnb-style [check_in, check_out) nights.
 * - Swap if reversed
 * - If same day (0 nights), bump checkout to the next day
 */
export function normalizeDateRange(
  checkIn: string | null | undefined,
  checkOut: string | null | undefined,
): { check_in: string | null; check_out: string | null } {
  let start = checkIn?.trim() || null;
  let end = checkOut?.trim() || null;

  if (start && end && end < start) {
    [start, end] = [end, start];
  }
  if (start && end && end === start) {
    end = addOneDay(start);
  }
  // Only check-in set → default one-night stay
  if (start && !end) {
    end = addOneDay(start);
  }

  return { check_in: start, check_out: end };
}

function parseCount(raw: string | null, max = 16): number {
  if (!raw) return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(max, Math.floor(n));
}

export function parseSearchParams(params: URLSearchParams): SearchParamsState {
  const amenitiesRaw = params.get("amenities");
  const dates = normalizeDateRange(params.get("check_in"), params.get("check_out"));

  let adults = parseCount(params.get("adults"));
  let children = parseCount(params.get("children"), 15);
  const infants = parseCount(params.get("infants"), 5);
  const pets = parseCount(params.get("pets"), 5);

  // Legacy `guests` only → treat as adults
  const legacyGuests = params.get("guests") ? Number(params.get("guests")) : null;
  if (!adults && !children && !infants && !pets && legacyGuests && legacyGuests > 0) {
    adults = Math.min(16, Math.floor(legacyGuests));
  }

  const capacity = adults + children;

  return {
    location: params.get("location") ?? "",
    guests: capacity > 0 ? capacity : null,
    adults,
    children,
    infants,
    pets,
    min_price: params.get("min_price") ? Number(params.get("min_price")) : null,
    max_price: params.get("max_price") ? Number(params.get("max_price")) : null,
    category: params.get("category"),
    property_type: (params.get("property_type") as PropertyType | null) ?? null,
    amenities: amenitiesRaw ? amenitiesRaw.split(",").filter(Boolean) : [],
    check_in: dates.check_in,
    check_out: dates.check_out,
    sort: (params.get("sort") as SortOption) ?? "newest",
    page: params.get("page") ? Math.max(1, Number(params.get("page"))) : 1,
  };
}

export function searchParamsToQuery(state: SearchParamsState): URLSearchParams {
  const dates = normalizeDateRange(state.check_in, state.check_out);
  const capacity = state.adults + state.children;
  const q = new URLSearchParams();
  if (state.location.trim()) q.set("location", state.location.trim());
  if (state.adults > 0) q.set("adults", String(state.adults));
  if (state.children > 0) q.set("children", String(state.children));
  if (state.infants > 0) q.set("infants", String(state.infants));
  if (state.pets > 0) q.set("pets", String(state.pets));
  // Keep `guests` for API/backward-compatible bookmarks
  if (capacity > 0) q.set("guests", String(capacity));
  if (state.min_price != null) q.set("min_price", String(state.min_price));
  if (state.max_price != null) q.set("max_price", String(state.max_price));
  if (state.category) q.set("category", state.category);
  if (state.property_type) q.set("property_type", state.property_type);
  if (state.amenities.length) q.set("amenities", state.amenities.join(","));
  if (dates.check_in) q.set("check_in", dates.check_in);
  if (dates.check_out) q.set("check_out", dates.check_out);
  if (state.sort !== "newest") q.set("sort", state.sort);
  if (state.page > 1) q.set("page", String(state.page));
  return q;
}

/** Convert UI search state → API query (prices in cents). */
export function toListingsApiParams(state: SearchParamsState) {
  const dates = normalizeDateRange(state.check_in, state.check_out);
  return {
    page: state.page,
    page_size: 12,
    sort: state.sort,
    location: state.location.trim() || undefined,
    guests: state.adults + state.children > 0 ? state.adults + state.children : state.guests ?? undefined,
    min_price: state.min_price != null ? state.min_price * 100 : undefined,
    max_price: state.max_price != null ? state.max_price * 100 : undefined,
    category: state.category ?? undefined,
    property_type: state.property_type ?? undefined,
    amenities: state.amenities.length ? state.amenities : undefined,
    check_in: dates.check_in ?? undefined,
    check_out: dates.check_out ?? undefined,
  };
}

export function countActiveFilters(state: SearchParamsState): number {
  let n = 0;
  if (state.min_price != null) n += 1;
  if (state.max_price != null) n += 1;
  if (state.property_type) n += 1;
  if (state.amenities.length) n += 1;
  if (state.adults + state.children + state.infants + state.pets > 0 || state.guests) n += 1;
  return n;
}
