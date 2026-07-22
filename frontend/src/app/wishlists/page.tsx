/**
 * Wishlists page — saved homes for the logged-in user.
 */

"use client";

import Link from "next/link";

import { ListingCard } from "@/components/listings/ListingCard";
import { ListingCardSkeleton } from "@/components/listings/ListingCardSkeleton";
import { ROUTES } from "@/constants/routes";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/providers/AuthProvider";

export default function WishlistsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data = [], isLoading, isError } = useWishlist();

  if (authLoading) {
    return (
      <main className="mx-auto max-w-[1760px] px-6 py-10 md:px-10">
        <div className="h-8 w-48 animate-pulse rounded bg-abnb-surface-hover" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-abnb-fg">Log in to see your wishlists</h1>
        <p className="mt-2 text-abnb-muted">Save homes you love and find them here later.</p>
        <Link
          href={`${ROUTES.login}?next=/wishlists`}
          className="mt-6 rounded-pill bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral-hover"
        >
          Log in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1760px] px-6 py-8 md:px-10">
      <h1 className="text-3xl font-semibold text-abnb-fg">Wishlists</h1>
      <p className="mt-1 text-abnb-muted">Homes you&apos;ve saved</p>

      {isLoading && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <p className="mt-10 text-sm text-red-600">Could not load wishlists. Is the API running?</p>
      )}

      {!isLoading && !isError && data.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-abnb-fg">No saved homes yet</p>
          <p className="mt-2 text-sm text-abnb-muted">Tap the heart on any listing to save it.</p>
          <Link href={ROUTES.home} className="mt-6 inline-block text-sm font-semibold text-coral underline">
            Explore homes
          </Link>
        </div>
      )}

      {!isLoading && data.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}
