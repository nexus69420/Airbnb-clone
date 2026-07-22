/**
 * Host API service.
 */

import { apiClient } from "@/lib/api-client";
import type { Booking } from "@/types/booking";
import type {
  HostDashboardStats,
  HostListingCard,
  ListingWritePayload,
} from "@/types/host";
import type { ListingDetail } from "@/types/listing-detail";

export async function getHostDashboard(): Promise<HostDashboardStats> {
  const { data } = await apiClient.get<HostDashboardStats>("/api/v1/host/dashboard");
  return data;
}

export async function getHostListings(): Promise<HostListingCard[]> {
  const { data } = await apiClient.get<HostListingCard[]>("/api/v1/host/listings");
  return data;
}

export async function getHostListing(listingId: number): Promise<ListingDetail> {
  const { data } = await apiClient.get<ListingDetail>(`/api/v1/host/listings/${listingId}`);
  return data;
}

export async function createHostListing(payload: ListingWritePayload): Promise<ListingDetail> {
  const { data } = await apiClient.post<ListingDetail>("/api/v1/host/listings", payload);
  return data;
}

export async function updateHostListing(
  listingId: number,
  payload: ListingWritePayload,
): Promise<ListingDetail> {
  const { data } = await apiClient.patch<ListingDetail>(
    `/api/v1/host/listings/${listingId}`,
    payload,
  );
  return data;
}

export async function archiveHostListing(listingId: number): Promise<void> {
  await apiClient.delete(`/api/v1/host/listings/${listingId}`);
}

export async function restoreHostListing(listingId: number): Promise<ListingDetail> {
  const { data } = await apiClient.post<ListingDetail>(
    `/api/v1/host/listings/${listingId}/restore`,
  );
  return data;
}

export async function getHostBookings(): Promise<Booking[]> {
  const { data } = await apiClient.get<Booking[]>("/api/v1/host/bookings");
  return data;
}
