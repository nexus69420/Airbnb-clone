/**
 * Horizontal category pills (Airbnb explore row) — fills space until Filters.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { getCategories } from "@/services/catalog";

export function CategoryRow() {
  const { filters, setFilters } = useSearchFilters();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  });

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 w-24 shrink-0 animate-pulse rounded bg-abnb-surface-hover" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full items-end gap-1 overflow-x-auto pb-0 scrollbar-hide">
      <button
        type="button"
        onClick={() => setFilters({ category: null })}
        className={`shrink-0 border-b-2 px-4 pb-3.5 pt-2.5 text-sm font-semibold ${
          !filters.category
            ? "border-abnb-fg text-abnb-fg"
            : "border-transparent text-abnb-muted hover:border-abnb-border hover:text-abnb-fg"
        }`}
      >
        All
      </button>
      {categories.map((cat) => {
        const active = filters.category === cat.slug;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilters({ category: active ? null : cat.slug })}
            className={`shrink-0 whitespace-nowrap border-b-2 px-4 pb-3.5 pt-2.5 text-sm font-semibold ${
              active
                ? "border-abnb-fg text-abnb-fg"
                : "border-transparent text-abnb-muted hover:border-abnb-border hover:text-abnb-fg"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
