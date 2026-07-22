/**
 * Listing detail / review / availability types.
 */

import type { Amenity, Category } from "@/types/catalog";
import type { PaginatedResponse } from "@/types/api";
import type { PropertyType } from "@/types/listing";

export interface ListingImage {
  id: number;
  url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface HostPublic {
  id: number;
  full_name: string;
  avatar_url: string | null;
  is_superhost: boolean;
  created_at?: string | null;
}

export interface HostProfile {
  id: number;
  full_name: string;
  avatar_url: string | null;
  is_superhost: boolean;
  created_at: string;
  listing_count: number;
  review_count: number;
  rating: number | null;
  response_rate: number;
  response_time: string;
}

export interface ListingDetail {
  id: number;
  title: string;
  description: string;
  city: string;
  state: string | null;
  country: string;
  address: string;
  lat: number | null;
  lng: number | null;
  price_per_night: number;
  cleaning_fee: number;
  service_fee_percent: number;
  currency: string;
  property_type: PropertyType;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  rating: number | null;
  review_count: number;
  images: ListingImage[];
  amenities: Amenity[];
  category: Category;
  host: HostPublic;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string | null;
  author_name: string;
  author_avatar_url: string | null;
}

export type ReviewListResponse = PaginatedResponse<Review>;

export interface BlockedRange {
  check_in: string;
  check_out: string;
}

export interface AvailabilityResponse {
  listing_id: number;
  blocked: BlockedRange[];
}
