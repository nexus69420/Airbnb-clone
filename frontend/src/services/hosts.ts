/**
 * Public host profile API.
 */

import { apiClient } from "@/lib/api-client";
import type { HostProfile } from "@/types/listing-detail";
import type { ListingListResponse } from "@/types/listing";

export async function getHostProfile(hostId: number): Promise<HostProfile> {
  const { data } = await apiClient.get<HostProfile>(`/api/v1/hosts/${hostId}`);
  return data;
}

export async function getHostListings(
  hostId: number,
  page = 1,
  pageSize = 24,
): Promise<ListingListResponse> {
  const { data } = await apiClient.get<ListingListResponse>(`/api/v1/hosts/${hostId}/listings`, {
    params: { page, page_size: pageSize },
  });
  return data;
}
