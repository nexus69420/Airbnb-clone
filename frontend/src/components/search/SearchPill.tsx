/**
 * Collapsed Airbnb-style search pill (Where · When · Who + coral search).
 */

"use client";

import { Search } from "lucide-react";

import { useSearchFilters } from "@/hooks/useSearchFilters";
import { formatGuestSummary, guestsFromFilters } from "@/components/search/GuestPicker";
import { normalizeDateRange } from "@/utils/search-params";

interface SearchPillProps {
  onExpand: (segment: "where" | "when" | "who") => void;
}

function formatWhen(checkIn: string | null, checkOut: string | null): string {
  const { check_in, check_out } = normalizeDateRange(checkIn, checkOut);
  if (!check_in && !check_out) return "Add dates";
  if (check_in && check_out) return `${check_in} – ${check_out}`;
  return check_in ?? check_out ?? "Add dates";
}

export function SearchPill({ onExpand }: SearchPillProps) {
  const { filters } = useSearchFilters();

  return (
    <div className="mx-auto flex max-w-3xl items-center rounded-pill border border-abnb-border bg-abnb-surface shadow-elevated">
      <button
        type="button"
        onClick={() => onExpand("where")}
        className="min-w-0 flex-1 rounded-l-pill px-6 py-3 text-left hover:bg-abnb-surface-hover"
      >
        <span className="block text-[10px] font-bold uppercase tracking-wide text-abnb-fg">
          Where
        </span>
        <span className="block truncate text-sm text-abnb-muted">
          {filters.location.trim() || "Search destinations"}
        </span>
      </button>
      <div className="h-8 w-px bg-abnb-border" />
      <button
        type="button"
        onClick={() => onExpand("when")}
        className="min-w-[140px] px-5 py-3 text-left hover:bg-abnb-surface-hover"
      >
        <span className="block text-[10px] font-bold uppercase tracking-wide text-abnb-fg">
          When
        </span>
        <span className="block truncate text-sm text-abnb-muted">
          {formatWhen(filters.check_in, filters.check_out)}
        </span>
      </button>
      <div className="h-8 w-px bg-abnb-border" />
      <button
        type="button"
        onClick={() => onExpand("who")}
        className="flex min-w-[160px] items-center justify-between rounded-r-pill py-2 pl-5 pr-2 text-left hover:bg-abnb-surface-hover"
      >
        <span>
          <span className="block text-[10px] font-bold uppercase tracking-wide text-abnb-fg">
            Who
          </span>
          <span className="block truncate text-sm text-abnb-muted">
            {formatGuestSummary(guestsFromFilters(filters))}
          </span>
        </span>
        <span
          className="ml-3 flex h-12 w-12 items-center justify-center rounded-full bg-coral text-white hover:bg-coral-hover"
          aria-hidden
        >
          <Search className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </button>
    </div>
  );
}
