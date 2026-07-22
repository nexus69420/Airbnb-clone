/**
 * Responsive grid of listing cards driven by URL search filters.
 */

"use client";

import { ListingCard } from "@/components/listings/ListingCard";
import { ListingCardSkeleton } from "@/components/listings/ListingCardSkeleton";
import { useListings } from "@/hooks/useListings";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { toListingsApiParams } from "@/utils/search-params";

const SKELETON_COUNT = 12;

export function ListingGrid() {
  const { filters, setFilters } = useSearchFilters();
  const apiParams = toListingsApiParams(filters);
  const { data, isLoading, isError, error, isFetching } = useListings(apiParams);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-card border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-900 dark:bg-red-950/40">
        <p className="font-medium text-red-800 dark:text-red-200">Could not load listings</p>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">
          {error instanceof Error
            ? error.message
            : "Check that the backend is running (port 8015)."}
        </p>
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="rounded-card border border-abnb-border bg-abnb-surface px-6 py-16 text-center">
        <p className="text-lg font-medium text-abnb-fg">No stays match your search</p>
        <p className="mt-2 text-sm text-abnb-muted">Try adjusting filters or clearing the search.</p>
        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
          className="mt-6 text-sm font-semibold text-coral hover:underline"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className={isFetching ? "opacity-70 transition-opacity" : ""}>
      <p className="mb-6 text-sm text-abnb-muted">
        {data.total} stay{data.total === 1 ? "" : "s"}
      </p>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {data.items.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {data.pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={filters.page <= 1}
            onClick={() => setFilters({ page: filters.page - 1 })}
            className="rounded-lg border border-abnb-border px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-abnb-muted">
            Page {data.page} of {data.pages}
          </span>
          <button
            type="button"
            disabled={filters.page >= data.pages}
            onClick={() => setFilters({ page: filters.page + 1 })}
            className="rounded-lg border border-abnb-border px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
