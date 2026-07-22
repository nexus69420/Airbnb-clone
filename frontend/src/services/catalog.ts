/**
 * Catalog API service (categories + amenities).
 */

import { apiClient } from "@/lib/api-client";
import type { Amenity, Category } from "@/types/catalog";

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/api/v1/categories");
  return data;
}

export async function getAmenities(): Promise<Amenity[]> {
  const { data } = await apiClient.get<Amenity[]>("/api/v1/amenities");
  return data;
}
