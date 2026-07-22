/**
 * Listings API service.
 */

import { apiClient } from "@/lib/api-client";
import type {
  AvailabilityResponse,
  ListingDetail,
  ReviewListResponse,
} from "@/types/listing-detail";
import type { ListingListResponse, ListingsParams } from "@/types/listing";

export async function getListings(params: ListingsParams = {}): Promise<ListingListResponse> {
  const { amenities, ...rest } = params;
  const query: Record<string, string | number | string[]> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null && value !== "") {
      query[key] = value as string | number;
    }
  }
  if (amenities?.length) {
    query.amenities = amenities;
  }

  const { data } = await apiClient.get<ListingListResponse>("/api/v1/listings", {
    params: query,
    paramsSerializer: (p) => {
      const sp = new URLSearchParams();
      for (const [key, value] of Object.entries(p)) {
        if (Array.isArray(value)) {
          value.forEach((v) => sp.append(key, String(v)));
        } else if (value !== undefined && value !== null) {
          sp.append(key, String(value));
        }
      }
      return sp.toString();
    },
  });
  return data;
}

export async function getListing(id: number): Promise<ListingDetail> {
  const { data } = await apiClient.get<ListingDetail>(`/api/v1/listings/${id}`);
  return data;
}

export async function getListingReviews(
  id: number,
  page = 1,
  pageSize = 10,
): Promise<ReviewListResponse> {
  const { data } = await apiClient.get<ReviewListResponse>(`/api/v1/listings/${id}/reviews`, {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function getListingAvailability(id: number): Promise<AvailabilityResponse> {
  const { data } = await apiClient.get<AvailabilityResponse>(
    `/api/v1/listings/${id}/availability`,
  );
  return data;
}
