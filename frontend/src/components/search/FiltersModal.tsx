/**
 * Full-screen-style filters modal (Airbnb Filters button).
 */

"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { queryKeys } from "@/constants/query-keys";
import { useListings } from "@/hooks/useListings";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { getAmenities } from "@/services/catalog";
import type { PropertyType } from "@/types/listing";
import { toListingsApiParams } from "@/utils/search-params";

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "cabin", label: "Cabin" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "hotel", label: "Hotel" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating_desc", label: "Top rated" },
] as const;

interface FiltersModalProps {
  open: boolean;
  onClose: () => void;
}

export function FiltersModal({ open, onClose }: FiltersModalProps) {
  const { filters, setFilters, clearFilters } = useSearchFilters();
  const { data: amenities = [] } = useQuery({
    queryKey: queryKeys.amenities,
    queryFn: getAmenities,
    enabled: open,
  });

  const [minPrice, setMinPrice] = useState(filters.min_price?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(filters.max_price?.toString() ?? "");
  const [propertyType, setPropertyType] = useState(filters.property_type);
  const [selectedAmenities, setSelectedAmenities] = useState(filters.amenities);
  const [sort, setSort] = useState(filters.sort);

  useEffect(() => {
    if (!open) return;
    setMinPrice(filters.min_price?.toString() ?? "");
    setMaxPrice(filters.max_price?.toString() ?? "");
    setPropertyType(filters.property_type);
    setSelectedAmenities(filters.amenities);
    setSort(filters.sort);
  }, [open, filters]);

  const previewFilters = {
    ...filters,
    min_price: minPrice ? Number(minPrice) : null,
    max_price: maxPrice ? Number(maxPrice) : null,
    property_type: propertyType,
    amenities: selectedAmenities,
    sort,
    page: 1,
  };
  const { data: preview } = useListings(toListingsApiParams(previewFilters));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const apply = () => {
    setFilters({
      min_price: minPrice ? Number(minPrice) : null,
      max_price: maxPrice ? Number(maxPrice) : null,
      property_type: propertyType,
      amenities: selectedAmenities,
      sort,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center">
          <motion.button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-label="Filters"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-t-3xl border border-abnb-border bg-abnb-surface shadow-elevated md:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-abnb-border px-6 py-4">
              <h2 className="text-lg font-semibold text-abnb-fg">Filters</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 hover:bg-abnb-surface-hover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
              <section>
                <h3 className="mb-3 text-lg font-semibold">Price range</h3>
                <p className="mb-3 text-sm text-abnb-muted">Nightly prices before fees</p>
                <div className="flex gap-3">
                  <label className="flex-1 text-sm">
                    <span className="text-abnb-muted">Minimum</span>
                    <div className="mt-1 flex items-center rounded-xl border border-abnb-border px-3">
                      <span className="text-abnb-muted">$</span>
                      <input
                        type="number"
                        min={0}
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-transparent py-3 outline-none"
                      />
                    </div>
                  </label>
                  <label className="flex-1 text-sm">
                    <span className="text-abnb-muted">Maximum</span>
                    <div className="mt-1 flex items-center rounded-xl border border-abnb-border px-3">
                      <span className="text-abnb-muted">$</span>
                      <input
                        type="number"
                        min={0}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-transparent py-3 outline-none"
                      />
                    </div>
                  </label>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold">Type of place</h3>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((pt) => (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() =>
                        setPropertyType(propertyType === pt.value ? null : pt.value)
                      }
                      className={`rounded-pill border px-4 py-2 text-sm ${
                        propertyType === pt.value
                          ? "border-abnb-fg bg-abnb-fg text-abnb-bg"
                          : "border-abnb-border text-abnb-fg hover:border-abnb-fg"
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold">Sort by</h3>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="w-full rounded-xl border border-abnb-border bg-abnb-bg px-3 py-3 text-sm"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(a.slug)}
                        onChange={() =>
                          setSelectedAmenities((prev) =>
                            prev.includes(a.slug)
                              ? prev.filter((s) => s !== a.slug)
                              : [...prev, a.slug],
                          )
                        }
                        className="h-4 w-4 rounded border-abnb-border"
                      />
                      {a.name}
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex gap-3 border-t border-abnb-border px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  clearFilters();
                  onClose();
                }}
                className="flex-1 rounded-xl py-3 text-sm font-semibold underline"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={apply}
                className="flex-[2] rounded-xl bg-abnb-fg py-3 text-sm font-semibold text-abnb-bg"
              >
                Show {preview?.total ?? "…"} places
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
