/**
 * Expanded search overlay — Where / When / Who panels (Airbnb-like).
 */

"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useSearchFilters } from "@/hooks/useSearchFilters";
import {
  GuestPicker,
  capacityGuests,
  guestsFromFilters,
  type GuestCounts,
} from "@/components/search/GuestPicker";
import {
  normalizeDateRange,
  searchParamsToQuery,
  type SearchParamsState,
} from "@/utils/search-params";
import { saveStayDraft, stayDraftFromSearch } from "@/utils/stay-draft";

const SUGGESTED_DESTINATIONS = [
  "Bali",
  "Tokyo",
  "London",
  "Rome",
  "Malibu",
  "San Francisco",
  "Florence",
  "Kyoto",
];

type Segment = "where" | "when" | "who";

interface SearchExpandedProps {
  initialSegment: Segment;
  onClose: () => void;
}

export function SearchExpanded({ initialSegment, onClose }: SearchExpandedProps) {
  const router = useRouter();
  const { filters } = useSearchFilters();
  const [segment, setSegment] = useState<Segment>(initialSegment);
  const [location, setLocation] = useState(filters.location);
  const [checkIn, setCheckIn] = useState(filters.check_in ?? "");
  const [checkOut, setCheckOut] = useState(filters.check_out ?? "");
  const [guestCounts, setGuestCounts] = useState<GuestCounts>(() => guestsFromFilters(filters));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const apply = () => {
    const dates = normalizeDateRange(checkIn, checkOut);
    const capacity = capacityGuests(guestCounts);
    const next: SearchParamsState = {
      ...filters,
      location,
      check_in: dates.check_in,
      check_out: dates.check_out,
      adults: guestCounts.adults,
      children: guestCounts.children,
      infants: guestCounts.infants,
      pets: guestCounts.pets,
      guests: capacity > 0 ? capacity : null,
      page: 1,
    };
    const qs = searchParamsToQuery(next).toString();
    saveStayDraft(stayDraftFromSearch(next));
    router.push(qs ? `/?${qs}` : "/");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close search"
        onClick={onClose}
      />
      <div className="relative mx-auto mt-4 max-w-4xl px-4 md:mt-6">
        <div className="rounded-3xl border border-abnb-border bg-abnb-surface p-4 shadow-elevated md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              {(
                [
                  ["where", "Where"],
                  ["when", "When"],
                  ["who", "Who"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSegment(key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    segment === key
                      ? "bg-abnb-fg text-abnb-bg"
                      : "text-abnb-muted hover:bg-abnb-surface-hover"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-abnb-muted hover:bg-abnb-surface-hover"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {segment === "where" && (
            <div>
              <input
                autoFocus
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && apply()}
                placeholder="Search destinations"
                className="w-full rounded-2xl border border-abnb-border bg-abnb-bg px-4 py-4 text-base outline-none focus:border-abnb-fg"
              />
              <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-abnb-muted">
                Suggested destinations
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_DESTINATIONS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setLocation(city);
                      setSegment("when");
                    }}
                    className="rounded-full border border-abnb-border px-4 py-2 text-sm hover:border-abnb-fg"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {segment === "when" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase text-abnb-muted">
                  Check-in
                </span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => {
                    const nextIn = e.target.value;
                    setCheckIn(nextIn);
                    if (nextIn && (!checkOut || checkOut <= nextIn)) {
                      const d = new Date(`${nextIn}T12:00:00`);
                      d.setDate(d.getDate() + 1);
                      const yyyy = d.getFullYear();
                      const mm = String(d.getMonth() + 1).padStart(2, "0");
                      const dd = String(d.getDate()).padStart(2, "0");
                      setCheckOut(`${yyyy}-${mm}-${dd}`);
                    }
                  }}
                  className="w-full rounded-2xl border border-abnb-border bg-abnb-bg px-4 py-3 text-abnb-fg outline-none focus:border-abnb-fg"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase text-abnb-muted">
                  Checkout
                </span>
                <input
                  type="date"
                  value={checkOut}
                  min={
                    checkIn
                      ? (() => {
                          const d = new Date(`${checkIn}T12:00:00`);
                          d.setDate(d.getDate() + 1);
                          const yyyy = d.getFullYear();
                          const mm = String(d.getMonth() + 1).padStart(2, "0");
                          const dd = String(d.getDate()).padStart(2, "0");
                          return `${yyyy}-${mm}-${dd}`;
                        })()
                      : undefined
                  }
                  onChange={(e) => {
                    const nextOut = e.target.value;
                    if (checkIn && nextOut && nextOut <= checkIn) {
                      const dates = normalizeDateRange(checkIn, nextOut);
                      setCheckIn(dates.check_in ?? "");
                      setCheckOut(dates.check_out ?? "");
                      return;
                    }
                    setCheckOut(nextOut);
                  }}
                  className="w-full rounded-2xl border border-abnb-border bg-abnb-bg px-4 py-3 text-abnb-fg outline-none focus:border-abnb-fg"
                />
              </label>
              <p className="text-xs text-abnb-muted sm:col-span-2">
                Stays are overnight — checkout must be at least the day after check-in.
              </p>
            </div>
          )}

          {segment === "who" && (
            <div className="mx-auto max-w-md">
              <GuestPicker value={guestCounts} onChange={setGuestCounts} />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={apply}
              className="flex items-center gap-2 rounded-pill bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral-hover"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
