/**
 * Host React Query hooks.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/AuthProvider";
import {
  archiveHostListing,
  createHostListing,
  getHostBookings,
  getHostDashboard,
  getHostListing,
  getHostListings,
  restoreHostListing,
  updateHostListing,
} from "@/services/host";
import type { ListingWritePayload } from "@/types/host";
import { getErrorMessage } from "@/utils/error";

export function useHostDashboard() {
  const { isAuthenticated, isHost } = useAuth();
  return useQuery({
    queryKey: queryKeys.host.dashboard,
    queryFn: getHostDashboard,
    enabled: isAuthenticated && isHost,
  });
}

export function useHostListings() {
  const { isAuthenticated, isHost } = useAuth();
  return useQuery({
    queryKey: queryKeys.host.listings,
    queryFn: getHostListings,
    enabled: isAuthenticated && isHost,
  });
}

export function useHostListing(listingId: number) {
  const { isAuthenticated, isHost } = useAuth();
  return useQuery({
    queryKey: queryKeys.host.listing(listingId),
    queryFn: () => getHostListing(listingId),
    enabled: isAuthenticated && isHost && listingId > 0,
  });
}

export function useHostBookings() {
  const { isAuthenticated, isHost } = useAuth();
  return useQuery({
    queryKey: queryKeys.host.bookings,
    queryFn: getHostBookings,
    enabled: isAuthenticated && isHost,
  });
}

export function useCreateHostListing() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ListingWritePayload) => createHostListing(payload),
    onSuccess: (listing) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.host.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
      toast.success("Listing published");
      router.push(ROUTES.hostListingEdit(listing.id));
    },
    onError: (err) => toast.error(getErrorMessage(err, "Could not create listing")),
  });
}

export function useUpdateHostListing(listingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ListingWritePayload) => updateHostListing(listingId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.host.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(listingId) });
      toast.success("Listing updated");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Could not update listing")),
  });
}

export function useArchiveHostListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: number) => archiveHostListing(listingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.host.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
      toast.success("Listing archived");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Could not archive listing")),
  });
}

export function useRestoreHostListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: number) => restoreHostListing(listingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.host.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
      toast.success("Listing restored to explore");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Could not restore listing")),
  });
}
