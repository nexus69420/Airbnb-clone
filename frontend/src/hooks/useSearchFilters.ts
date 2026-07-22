/**
 * Hook to read/write explore search state from the home URL query string.
 *
 * Why this file exists:
 *   URL is the source of truth for shareable filters (Airbnb-like).
 */

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import {
  DEFAULT_SEARCH,
  parseSearchParams,
  searchParamsToQuery,
  type SearchParamsState,
} from "@/utils/search-params";
import { saveStayDraft, stayDraftFromSearch, stayDraftHasValues } from "@/utils/stay-draft";

export function useSearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams],
  );

  useEffect(() => {
    // Only persist stay draft from the explore URL — never wipe it when browsing
    // /wishlists, /trips, /host, etc. (those routes have empty search params).
    if (pathname !== "/") return;
    const draft = stayDraftFromSearch(filters);
    if (stayDraftHasValues(draft)) {
      saveStayDraft(draft);
    }
  }, [filters, pathname]);

  const setFilters = useCallback(
    (patch: Partial<SearchParamsState>) => {
      const keys = Object.keys(patch);
      const onlyPage = keys.length === 1 && keys[0] === "page";
      const next: SearchParamsState = {
        ...filters,
        ...patch,
        page: onlyPage ? (patch.page ?? 1) : (patch.page ?? 1),
      };
      if (!onlyPage && patch.page === undefined) {
        next.page = 1;
      }

      saveStayDraft(stayDraftFromSearch(next));
      const q = searchParamsToQuery(next);
      // Preserve map split view when tweaking filters from See all
      if (searchParams.get("map") === "1") q.set("map", "1");
      const qs = q.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router, searchParams],
  );

  const clearFilters = useCallback(() => {
    if (pathname === "/") {
      saveStayDraft({
        check_in: null,
        check_out: null,
        guests: null,
        adults: 0,
        children: 0,
        infants: 0,
        pets: 0,
      });
    }
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return { filters, setFilters, clearFilters, defaults: DEFAULT_SEARCH };
}
