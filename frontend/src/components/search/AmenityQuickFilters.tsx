/**
 * Airbnb-style quick amenity filter pills (Filters + Free parking, Wifi, …).
 * Compact mode matches the See-all / search-results screenshot strip.
 */

"use client";

import { SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { FiltersModal } from "@/components/search/FiltersModal";
import { queryKeys } from "@/constants/query-keys";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { getAmenities } from "@/services/catalog";

/** Exact order/labels from Airbnb search-results header. */
const QUICK_AMENITY_SLUGS = [
  { slug: "free-parking", label: "Free parking" },
  { slug: "self-check-in", label: "Self check-in" },
  { slug: "wifi", label: "Wifi" },
  { slug: "air-conditioning", label: "Air conditioning" },
  { slug: "tv", label: "TV" },
  { slug: "washer", label: "Washing machine" },
  { slug: "kitchen", label: "Kitchen" },
  { slug: "pets-allowed", label: "Allows pets" },
] as const;

const GUEST_FAVOURITE_KEY = "guest-favourite";

interface AmenityQuickFiltersProps {
  /** Optional external opener; if omitted, opens FiltersModal internally. */
  onOpenFilters?: () => void;
  /** Compact strip for map-view header (no full-width border). */
  compact?: boolean;
  className?: string;
}

export function AmenityQuickFilters({
  onOpenFilters,
  compact = false,
  className = "",
}: AmenityQuickFiltersProps) {
  const { filters, setFilters } = useSearchFilters();
  const [modalOpen, setModalOpen] = useState(false);
  const { data: amenities = [] } = useQuery({
    queryKey: queryKeys.amenities,
    queryFn: getAmenities,
  });

  const known = new Set(amenities.map((a) => a.slug));
  // Compact (See-all) always shows screenshot pills; home strip only shows seeded ones.
  const pills = compact
    ? QUICK_AMENITY_SLUGS
    : QUICK_AMENITY_SLUGS.filter((p) => known.size === 0 || known.has(p.slug));

  const openFilters = () => {
    if (onOpenFilters) onOpenFilters();
    else setModalOpen(true);
  };

  const toggle = (slug: string) => {
    const next = filters.amenities.includes(slug)
      ? filters.amenities.filter((s) => s !== slug)
      : [...filters.amenities, slug];
    setFilters({ amenities: next, page: 1 });
  };

  const guestFavouriteActive =
    filters.amenities.includes(GUEST_FAVOURITE_KEY) || filters.sort === "rating_desc";

  const toggleGuestFavourite = () => {
    const without = filters.amenities.filter((s) => s !== GUEST_FAVOURITE_KEY);
    if (guestFavouriteActive) {
      setFilters({ amenities: without, sort: "newest", page: 1 });
    } else {
      setFilters({
        amenities: [...without, GUEST_FAVOURITE_KEY],
        sort: "rating_desc",
        page: 1,
      });
    }
  };

  const activeCount =
    filters.amenities.filter((s) => s !== GUEST_FAVOURITE_KEY).length +
    (filters.min_price != null || filters.max_price != null ? 1 : 0) +
    (filters.property_type ? 1 : 0);

  const pillClass = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition ${
      active
        ? "border-abnb-fg bg-abnb-fg text-abnb-bg font-medium"
        : "border-abnb-border bg-abnb-surface text-abnb-fg font-medium hover:border-abnb-fg"
    }`;

  return (
    <>
      <div
        className={`flex min-w-0 items-center gap-2.5 overflow-x-auto scrollbar-hide ${
          compact
            ? "justify-center"
            : "border-b border-abnb-border px-4 pb-3 pt-3 md:px-6"
        } ${className}`}
      >
        <button
          type="button"
          onClick={openFilters}
          className="flex shrink-0 items-center gap-2 rounded-full border border-abnb-border bg-abnb-surface px-4 py-2 text-sm font-medium text-abnb-fg hover:border-abnb-fg"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
          Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
        </button>
        {pills.map((pill) => {
          const active = filters.amenities.includes(pill.slug);
          return (
            <button
              key={pill.slug}
              type="button"
              onClick={() => toggle(pill.slug)}
              className={pillClass(active)}
            >
              {pill.label}
            </button>
          );
        })}
        {compact && (
          <button
            type="button"
            onClick={toggleGuestFavourite}
            className={pillClass(guestFavouriteActive)}
          >
            Guest Favourite
          </button>
        )}
      </div>
      {!onOpenFilters && <FiltersModal open={modalOpen} onClose={() => setModalOpen(false)} />}
    </>
  );
}
