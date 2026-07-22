/**
 * Hook for paginated listings on the home explore grid.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { getListings } from "@/services/listings";
import type { ListingsParams } from "@/types/listing";

export function useListings(params: ListingsParams = {}) {
  return useQuery({
    queryKey: queryKeys.listings.list(params),
    queryFn: () => getListings(params),
  });
}
