/**
 * Public host profile hooks.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { getHostListings, getHostProfile } from "@/services/hosts";

export function useHostProfile(hostId: number) {
  return useQuery({
    queryKey: queryKeys.publicHosts.profile(hostId),
    queryFn: () => getHostProfile(hostId),
    enabled: hostId > 0,
  });
}

export function useHostListings(hostId: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.publicHosts.listings(hostId, page),
    queryFn: () => getHostListings(hostId, page),
    enabled: hostId > 0,
  });
}
