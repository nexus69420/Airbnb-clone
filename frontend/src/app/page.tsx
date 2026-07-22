/**
 * Home — Airbnb India style: carousel rows by city, or filtered grid / map split.
 */

"use client";

import { SlidersHorizontal } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ListingCarouselRow } from "@/components/listings/ListingCarouselRow";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { SearchMapSplit } from "@/components/listings/SearchMapSplit";
import { CategoryRow } from "@/components/search/CategoryRow";
import { FiltersModal } from "@/components/search/FiltersModal";
import { useListings } from "@/hooks/useListings";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { countActiveFilters, toListingsApiParams } from "@/utils/search-params";

const CITY_ROWS = [
  { city: "Tokyo", title: "Popular homes in Tokyo" },
  { city: "Bali", title: "Stays in Bali" },
  { city: "London", title: "Stay in London" },
  { city: "Rome", title: "Available in Rome" },
  { city: "Malibu", title: "Beach homes in Malibu" },
];

function hasActiveSearch(filters: ReturnType<typeof useSearchFilters>["filters"]): boolean {
  return Boolean(
    filters.location.trim() ||
      filters.category ||
      filters.guests ||
      filters.min_price != null ||
      filters.max_price != null ||
      filters.property_type ||
      filters.amenities.length ||
      filters.check_in ||
      filters.check_out ||
      filters.sort !== "newest",
  );
}

function seeAllHref(city?: string) {
  const q = new URLSearchParams();
  if (city) q.set("location", city);
  q.set("map", "1");
  return `/?${q.toString()}`;
}

function HomeCarousels() {
  const { data, isLoading, isError, refetch } = useListings({
    page: 1,
    page_size: 100,
    sort: "newest",
  });

  const rows = useMemo(() => {
    const items = data?.items ?? [];
    return CITY_ROWS.map((row) => {
      const cityKey = row.city.toLowerCase();
      const listings = items.filter(
        (l) =>
          l.city.toLowerCase() === cityKey || l.state?.toLowerCase() === cityKey,
      );
      return { ...row, listings };
    }).filter((r) => r.listings.length > 0);
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-7 w-72 animate-pulse rounded bg-abnb-surface-hover" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 7 }).map((__, j) => (
                <div
                  key={j}
                  className="aspect-square w-[calc((100%-1rem)/2)] min-w-0 shrink-0 animate-pulse rounded-[12px] bg-abnb-surface-hover sm:w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-4*1rem)/5)] lg:w-[calc((100%-6*1rem)/7)]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-card border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900 dark:bg-red-950/40">
        <p className="font-medium text-red-800 dark:text-red-200">Could not load homes</p>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">
          Check that the API is running on port 8015.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 text-sm font-semibold text-coral hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="rounded-card border border-abnb-border px-6 py-16 text-center">
        <p className="text-lg font-medium text-abnb-fg">No listings yet</p>
        <p className="mt-2 text-sm text-abnb-muted">Seed the database or create a listing as a host.</p>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      {rows.map((row) => (
        <ListingCarouselRow
          key={row.city}
          title={row.title}
          location={row.city}
          seeAllHref={seeAllHref(row.city)}
          listings={row.listings}
        />
      ))}
      <ListingCarouselRow
        title="Homes guests love"
        location="featured"
        seeAllHref={seeAllHref()}
        listings={data.items.slice(0, 9)}
      />
    </div>
  );
}

function MapExplore() {
  const { filters } = useSearchFilters();
  const base = toListingsApiParams(filters);
  const { data, isLoading, isError } = useListings(
    filters.location.trim()
      ? { ...base, page: 1, page_size: 40 }
      : { page: 1, page_size: 40, sort: "rating_desc" },
  );

  const label = filters.location.trim() || "featured stays";
  const title = filters.location.trim()
    ? `${data?.total ?? "…"} homes in ${filters.location}`
    : "Homes guests love";

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-abnb-muted">
        Loading map view…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 py-10 text-center text-sm text-red-600">Could not load listings for the map.</div>
    );
  }

  return (
    <SearchMapSplit
      title={title}
      locationLabel={label}
      listings={data?.items ?? []}
    />
  );
}

function HomeContent() {
  const { filters } = useSearchFilters();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(filters);
  const showMap = searchParams.get("map") === "1";
  const searching = hasActiveSearch(filters) && !showMap;

  return (
    <main
      className={
        showMap
          ? "w-full"
          : "mx-auto w-full max-w-[1760px] px-6 py-6 sm:px-10 md:px-16 lg:px-20 xl:px-24"
      }
    >
      {!showMap && (
        <div className="mb-10 flex items-end justify-between gap-3 md:gap-6">
          <div className="min-w-0 flex-1 overflow-hidden border-b border-abnb-border">
            <CategoryRow />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="mb-3 flex shrink-0 items-center gap-2 rounded-pill border border-abnb-border px-4 py-2.5 text-sm font-semibold text-abnb-fg hover:border-abnb-fg hover:shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
          </button>
        </div>
      )}

      {showMap ? (
        <MapExplore />
      ) : searching ? (
        <>
          <p className="mb-6 text-sm text-abnb-muted">
            {filters.location && (
              <span>
                Stays in <strong className="text-abnb-fg">{filters.location}</strong>
              </span>
            )}
            {filters.category && (
              <span>
                {filters.location ? " · " : ""}
                <strong className="text-abnb-fg">{filters.category}</strong>
              </span>
            )}
          </p>
          <ListingGrid />
        </>
      ) : (
        <HomeCarousels />
      )}

      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-[1760px] px-6 py-8 sm:px-10 md:px-16 lg:px-20 xl:px-24">
          <div className="h-12 animate-pulse rounded bg-abnb-surface-hover" />
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
