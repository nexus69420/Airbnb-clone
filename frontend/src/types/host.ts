/**
 * Host panel TypeScript types.
 */

import type { Booking } from "@/types/booking";
import type { ListingDetail } from "@/types/listing-detail";
import type { PropertyType } from "@/types/listing";

export type ListingStatus = "draft" | "active" | "archived";

export interface HostDashboardStats {
  active_listings: number;
  archived_listings: number;
  upcoming_bookings: number;
  pending_bookings: number;
}

export interface HostListingCard {
  id: number;
  title: string;
  city: string;
  country: string;
  price_per_night: number;
  status: ListingStatus;
  property_type: PropertyType;
  image_url: string | null;
  upcoming_bookings: number;
}

export interface ListingImageInput {
  url: string;
  alt_text?: string | null;
}

export interface ListingWritePayload {
  title: string;
  description: string;
  category_id: number;
  property_type: PropertyType;
  price_per_night: number;
  cleaning_fee: number;
  service_fee_percent: number;
  country: string;
  city: string;
  state: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenity_ids: number[];
  images: ListingImageInput[];
}

export type { Booking, ListingDetail };
