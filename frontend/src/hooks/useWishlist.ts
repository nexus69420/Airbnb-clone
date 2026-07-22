/**
 * Wishlist React Query hooks with optimistic heart toggles.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/AuthProvider";
import {
  addToWishlist,
  getWishlist,
  getWishlistIds,
  removeFromWishlist,
} from "@/services/wishlist";
import type { ListingCard } from "@/types/listing";

export function useWishlistIds() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.wishlists.ids,
    queryFn: getWishlistIds,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.wishlists.list,
    queryFn: getWishlist,
    enabled: isAuthenticated,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      currentlySaved,
    }: {
      listingId: number;
      currentlySaved: boolean;
    }) => {
      if (currentlySaved) {
        await removeFromWishlist(listingId);
      } else {
        await addToWishlist(listingId);
      }
    },
    onMutate: async ({ listingId, currentlySaved }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.wishlists.ids });
      const previousIds = queryClient.getQueryData<number[]>(queryKeys.wishlists.ids) ?? [];

      queryClient.setQueryData<number[]>(queryKeys.wishlists.ids, (old = []) =>
        currentlySaved ? old.filter((id) => id !== listingId) : [...old, listingId],
      );

      return { previousIds };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData(queryKeys.wishlists.ids, context.previousIds);
      }
      toast.error("Could not update wishlist");
    },
    onSuccess: (_data, { currentlySaved }) => {
      toast.success(currentlySaved ? "Removed from wishlist" : "Saved to wishlist");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlists.all });
    },
    meta: { requiresAuth: true },
  });
}

/** Helper used by cards — sends logged-out users to login with return path. */
export function useWishlistHeart() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { data: ids = [] } = useWishlistIds();
  const toggle = useToggleWishlist();
  const savedSet = new Set(ids);

  const isSaved = (listingId: number) => savedSet.has(listingId);

  const onToggle = (listingId: number) => {
    if (!isAuthenticated) {
      toast.error("Log in to save homes");
      const next = encodeURIComponent(pathname || ROUTES.home);
      router.push(`${ROUTES.login}?next=${next}`);
      return;
    }
    toggle.mutate({ listingId, currentlySaved: isSaved(listingId) });
  };

  return { isSaved, onToggle, isAuthenticated };
}

export type { ListingCard };
