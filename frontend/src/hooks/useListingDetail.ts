/**
 * Hooks for listing detail, reviews, and availability.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  getListing,
  getListingAvailability,
  getListingReviews,
} from "@/services/listings";

export function useListing(id: number) {
  return useQuery({
    queryKey: queryKeys.listings.detail(id),
    queryFn: () => getListing(id),
    enabled: id > 0,
  });
}

export function useListingReviews(id: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.listings.reviews(id, page),
    queryFn: () => getListingReviews(id, page),
    enabled: id > 0,
  });
}

export function useListingAvailability(id: number) {
  return useQuery({
    queryKey: queryKeys.listings.availability(id),
    queryFn: () => getListingAvailability(id),
    enabled: id > 0,
  });
}
