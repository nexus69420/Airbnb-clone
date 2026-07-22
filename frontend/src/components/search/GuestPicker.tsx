/**
 * Airbnb-style guest counters: Adults, Children, Infants, Pets.
 * Adults + children count toward listing capacity; infants/pets are display-only for search.
 */

"use client";

import type { ReactNode } from "react";

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export const EMPTY_GUESTS: GuestCounts = {
  adults: 0,
  children: 0,
  infants: 0,
  pets: 0,
};

const ROWS: {
  key: keyof GuestCounts;
  label: string;
  description: ReactNode;
  min: number;
  max: number;
}[] = [
  {
    key: "adults",
    label: "Adults",
    description: "Ages 13 or above",
    min: 0,
    max: 16,
  },
  {
    key: "children",
    label: "Children",
    description: "Ages 2–12",
    min: 0,
    max: 15,
  },
  {
    key: "infants",
    label: "Infants",
    description: "Under 2",
    min: 0,
    max: 5,
  },
  {
    key: "pets",
    label: "Pets",
    description: (
      <span className="underline decoration-abnb-muted underline-offset-2">
        Bringing a service animal?
      </span>
    ),
    min: 0,
    max: 5,
  },
];

interface GuestPickerProps {
  value: GuestCounts;
  onChange: (next: GuestCounts) => void;
}

export function GuestPicker({ value, onChange }: GuestPickerProps) {
  const bump = (key: keyof GuestCounts, delta: number) => {
    const row = ROWS.find((r) => r.key === key)!;
    let nextVal = Math.min(row.max, Math.max(row.min, value[key] + delta));

    // Airbnb: if you add children/infants/pets with 0 adults, auto-set 1 adult
    let adults = value.adults;
    if (key !== "adults" && delta > 0 && adults === 0) {
      adults = 1;
    }
    // Don't allow removing the last adult while other people/pets remain
    if (key === "adults" && delta < 0) {
      const others = value.children + value.infants + value.pets;
      if (nextVal < 1 && others > 0) nextVal = 1;
    }

    onChange({ ...value, adults, [key]: nextVal });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-abnb-border bg-abnb-surface">
      {ROWS.map((row, i) => {
        const count = value[row.key];
        const canDec =
          count > row.min &&
          !(row.key === "adults" && count <= 1 && value.children + value.infants + value.pets > 0);
        const canInc = count < row.max;

        return (
          <div
            key={row.key}
            className={`flex items-center justify-between gap-4 px-5 py-5 ${
              i > 0 ? "border-t border-abnb-border" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="font-semibold text-abnb-fg">{row.label}</p>
              <p className="text-sm text-abnb-muted">{row.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                disabled={!canDec}
                onClick={() => bump(row.key, -1)}
                aria-label={`Fewer ${row.label.toLowerCase()}`}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-abnb-border text-lg text-abnb-muted transition enabled:hover:border-abnb-fg enabled:hover:text-abnb-fg disabled:opacity-30"
              >
                −
              </button>
              <span className="w-5 text-center text-base tabular-nums text-abnb-fg">{count}</span>
              <button
                type="button"
                disabled={!canInc}
                onClick={() => bump(row.key, 1)}
                aria-label={`More ${row.label.toLowerCase()}`}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-abnb-border text-lg text-abnb-muted transition enabled:hover:border-abnb-fg enabled:hover:text-abnb-fg disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** People who need beds (API capacity filter). */
export function capacityGuests(counts: GuestCounts): number {
  return counts.adults + counts.children;
}

export function formatGuestSummary(counts: GuestCounts): string {
  const people = capacityGuests(counts);
  const parts: string[] = [];
  if (people > 0) {
    parts.push(`${people} guest${people === 1 ? "" : "s"}`);
  }
  if (counts.infants > 0) {
    parts.push(`${counts.infants} infant${counts.infants === 1 ? "" : "s"}`);
  }
  if (counts.pets > 0) {
    parts.push(`${counts.pets} pet${counts.pets === 1 ? "" : "s"}`);
  }
  return parts.length ? parts.join(", ") : "Add guests";
}

export function guestsFromFilters(filters: {
  guests: number | null;
  adults: number;
  children: number;
  infants: number;
  pets: number;
}): GuestCounts {
  const hasBreakdown =
    filters.adults > 0 || filters.children > 0 || filters.infants > 0 || filters.pets > 0;
  if (hasBreakdown) {
    return {
      adults: filters.adults,
      children: filters.children,
      infants: filters.infants,
      pets: filters.pets,
    };
  }
  if (filters.guests && filters.guests > 0) {
    return { ...EMPTY_GUESTS, adults: filters.guests };
  }
  return { ...EMPTY_GUESTS };
}
