/**
 * Compact search pill for See-all / map header — matches Airbnb search-results chrome.
 * Single-line segments: location · dates · guests + coral search.
 */

"use client";

import { Home, Search } from "lucide-react";

import { formatGuestSummary, guestsFromFilters } from "@/components/search/GuestPicker";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { normalizeDateRange } from "@/utils/search-params";

interface MapSearchPillProps {
  onExpand: (segment: "where" | "when" | "who") => void;
}

function formatWhenCompact(checkIn: string | null, checkOut: string | null): string {
  const { check_in, check_out } = normalizeDateRange(checkIn, checkOut);
  if (!check_in && !check_out) return "Any weekend";
  if (check_in && check_out) {
    try {
      const a = new Date(`${check_in}T12:00:00`);
      const b = new Date(`${check_out}T12:00:00`);
      const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
      return `${a.toLocaleDateString("en-US", opts)} – ${b.toLocaleDateString("en-US", opts)}`;
    } catch {
      return `${check_in} – ${check_out}`;
    }
  }
  return check_in ?? check_out ?? "Any weekend";
}

export function MapSearchPill({ onExpand }: MapSearchPillProps) {
  const { filters } = useSearchFilters();
  const location = filters.location.trim();
  const guestLabel = formatGuestSummary(guestsFromFilters(filters));
  const whereLabel = location ? `Homes in ${location}` : "Anywhere";

  return (
    <div className="flex h-12 w-full items-center rounded-full border border-abnb-border bg-abnb-surface shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]">
      <button
        type="button"
        onClick={() => onExpand("where")}
        className="flex min-w-0 flex-[1.35] items-center gap-2 rounded-l-full px-4 py-2 text-left hover:bg-abnb-surface-hover"
      >
        <Home className="h-4 w-4 shrink-0 text-abnb-fg" strokeWidth={2} />
        <span className="truncate text-sm font-semibold text-abnb-fg">{whereLabel}</span>
      </button>
      <div className="h-6 w-px shrink-0 bg-abnb-border" />
      <button
        type="button"
        onClick={() => onExpand("when")}
        className="min-w-0 flex-1 px-4 py-2 text-left hover:bg-abnb-surface-hover"
      >
        <span className="block truncate text-sm font-semibold text-abnb-fg">
          {formatWhenCompact(filters.check_in, filters.check_out)}
        </span>
      </button>
      <div className="h-6 w-px shrink-0 bg-abnb-border" />
      <button
        type="button"
        onClick={() => onExpand("who")}
        className="flex min-w-0 flex-1 items-center justify-between rounded-r-full py-1.5 pl-4 pr-1.5 text-left hover:bg-abnb-surface-hover"
      >
        <span
          className={`truncate text-sm ${guestLabel === "Add guests" ? "font-normal text-abnb-muted" : "font-semibold text-abnb-fg"}`}
        >
          {guestLabel === "Add guests" ? "Add guests" : guestLabel}
        </span>
        <span
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral text-white hover:bg-coral-hover"
          aria-hidden
        >
          <Search className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
      </button>
    </div>
  );
}
