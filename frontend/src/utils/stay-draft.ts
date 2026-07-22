/**
 * Stay draft (dates + guests) carried from search → listing booking widget.
 * URL query on listing pages + sessionStorage so cards work from any page.
 */

import {
  normalizeDateRange,
  parseSearchParams,
  type SearchParamsState,
} from "@/utils/search-params";

const STORAGE_KEY = "abnb_stay_draft";

export interface StayDraft {
  check_in: string | null;
  check_out: string | null;
  guests: number | null;
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export function stayDraftFromSearch(state: SearchParamsState): StayDraft {
  const dates = normalizeDateRange(state.check_in, state.check_out);
  const capacity = state.adults + state.children;
  return {
    check_in: dates.check_in,
    check_out: dates.check_out,
    guests: capacity > 0 ? capacity : state.guests,
    adults: state.adults,
    children: state.children,
    infants: state.infants,
    pets: state.pets,
  };
}

export function stayDraftHasValues(draft: StayDraft): boolean {
  return Boolean(
    draft.check_in ||
      draft.check_out ||
      (draft.guests && draft.guests > 0) ||
      draft.adults > 0 ||
      draft.children > 0 ||
      draft.infants > 0 ||
      draft.pets > 0,
  );
}

export function saveStayDraft(draft: StayDraft): void {
  if (typeof window === "undefined") return;
  try {
    if (!stayDraftHasValues(draft)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadStayDraft(): StayDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StayDraft;
    const dates = normalizeDateRange(parsed.check_in, parsed.check_out);
    return {
      check_in: dates.check_in,
      check_out: dates.check_out,
      guests: parsed.guests ?? null,
      adults: parsed.adults ?? 0,
      children: parsed.children ?? 0,
      infants: parsed.infants ?? 0,
      pets: parsed.pets ?? 0,
    };
  } catch {
    return null;
  }
}

/** Build query string for listing URLs (only stay-related keys). */
export function stayDraftToQuery(draft: StayDraft): URLSearchParams {
  const dates = normalizeDateRange(draft.check_in, draft.check_out);
  const capacity =
    draft.adults + draft.children > 0
      ? draft.adults + draft.children
      : draft.guests && draft.guests > 0
        ? draft.guests
        : null;
  const q = new URLSearchParams();
  if (dates.check_in) q.set("check_in", dates.check_in);
  if (dates.check_out) q.set("check_out", dates.check_out);
  if (draft.adults > 0) q.set("adults", String(draft.adults));
  if (draft.children > 0) q.set("children", String(draft.children));
  if (draft.infants > 0) q.set("infants", String(draft.infants));
  if (draft.pets > 0) q.set("pets", String(draft.pets));
  if (capacity) q.set("guests", String(capacity));
  return q;
}

export function listingHref(listingId: number, draft?: StayDraft | null): string {
  const resolved =
    draft && stayDraftHasValues(draft) ? draft : loadStayDraft();
  if (!resolved || !stayDraftHasValues(resolved)) {
    return `/listings/${listingId}`;
  }
  const qs = stayDraftToQuery(resolved).toString();
  return qs ? `/listings/${listingId}?${qs}` : `/listings/${listingId}`;
}

/** Prefer URL params on the listing page; fall back to session draft. */
export function resolveStayDraft(searchParams: URLSearchParams): StayDraft {
  const fromUrl = stayDraftFromSearch(parseSearchParams(searchParams));
  if (stayDraftHasValues(fromUrl)) return fromUrl;
  return (
    loadStayDraft() ?? {
      check_in: null,
      check_out: null,
      guests: null,
      adults: 0,
      children: 0,
      infants: 0,
      pets: 0,
    }
  );
}

export function guestCountFromDraft(draft: StayDraft, maxGuests: number): number {
  const raw =
    draft.adults + draft.children > 0
      ? draft.adults + draft.children
      : draft.guests && draft.guests > 0
        ? draft.guests
        : 1;
  return Math.min(maxGuests, Math.max(1, raw));
}
