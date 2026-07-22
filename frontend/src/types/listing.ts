/**
 * Listing types mirroring backend ListingCard schema.
 */

import type { PaginatedResponse } from "@/types/api";

export type PropertyType =
  | "house"
  | "apartment"
  | "guesthouse"
  | "hotel"
  | "villa"
  | "cabin";

export interface ListingCard {
  id: number;
  title: string;
  city: string;
  state: string | null;
  country: string;
  price_per_night: number;
  property_type: PropertyType;
  image_url: string | null;
  /** All photo URLs for card carousel (falls back to image_url). */
  image_urls?: string[];
  rating: number | null;
  review_count: number;
  lat?: number | null;
  lng?: number | null;
}

export type ListingListResponse = PaginatedResponse<ListingCard>;

export interface ListingsParams {
  page?: number;
  page_size?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "rating_desc";
  location?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  category?: string;
  property_type?: string;
  amenities?: string[];
  check_in?: string;
  check_out?: string;
}
