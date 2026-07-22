/**
 * Amenity grid for listing detail.
 */

import type { Amenity } from "@/types/catalog";

interface AmenityListProps {
  amenities: Amenity[];
}

export function AmenityList({ amenities }: AmenityListProps) {
  if (!amenities.length) {
    return <p className="text-sm text-abnb-muted">No amenities listed.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {amenities.map((a) => (
        <li key={a.id} className="flex items-center gap-3 text-abnb-fg">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-abnb-surface-hover text-xs font-medium uppercase text-abnb-muted">
            {a.name.charAt(0)}
          </span>
          <span>{a.name}</span>
        </li>
      ))}
    </ul>
  );
}
