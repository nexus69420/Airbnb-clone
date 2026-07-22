/**
 * Wishlist API service.
 */

import { apiClient } from "@/lib/api-client";
import type { ListingCard } from "@/types/listing";

export async function getWishlist(): Promise<ListingCard[]> {
  const { data } = await apiClient.get<ListingCard[]>("/api/v1/wishlists");
  return data;
}

export async function getWishlistIds(): Promise<number[]> {
  const { data } = await apiClient.get<{ listing_ids: number[] }>("/api/v1/wishlists/ids");
  return data.listing_ids;
}

export async function addToWishlist(listingId: number): Promise<void> {
  await apiClient.post(`/api/v1/wishlists/${listingId}`);
}

export async function removeFromWishlist(listingId: number): Promise<void> {
  await apiClient.delete(`/api/v1/wishlists/${listingId}`);
}
