/**
 * Catalog types for categories and amenities.
 */

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon_key: string;
  sort_order: number;
}

export interface Amenity {
  id: number;
  name: string;
  slug: string;
  icon_key: string;
  amenity_group: string;
}
