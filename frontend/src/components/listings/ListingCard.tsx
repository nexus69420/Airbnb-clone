/**
 * Airbnb-style listing card — photo, heart, Guest favourite, price · rating.
 * Links carry search dates/guests so the booking widget prefills.
 */

"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import { ListingCardSkeleton } from "@/components/listings/ListingCardSkeleton";
import { useWishlistHeart } from "@/hooks/useWishlist";
import { formatLocation, formatPrice } from "@/utils/format";
import { parseSearchParams } from "@/utils/search-params";
import {
  listingHref,
  stayDraftFromSearch,
  stayDraftHasValues,
} from "@/utils/stay-draft";
import type { ListingCard as ListingCardType } from "@/types/listing";

interface ListingCardProps {
  listing: ListingCardType;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Suspense fallback={<ListingCardSkeleton />}>
      <ListingCardInner listing={listing} />
    </Suspense>
  );
}

function ListingCardInner({ listing }: ListingCardProps) {
  const { isSaved, onToggle } = useWishlistHeart();
  const searchParams = useSearchParams();
  const href = useMemo(() => {
    const fromUrl = stayDraftFromSearch(parseSearchParams(searchParams));
    return listingHref(listing.id, stayDraftHasValues(fromUrl) ? fromUrl : null);
  }, [listing.id, searchParams]);
  const wished = isSaved(listing.id);
  const location = formatLocation(listing.city, listing.state, listing.country);
  const price = formatPrice(listing.price_per_night);
  const guestFavourite =
    listing.rating != null && listing.rating >= 4.8 && listing.review_count >= 1;

  return (
    <article className="group relative min-w-0">
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden rounded-card bg-abnb-surface-hover">
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 70vw, (max-width: 1200px) 33vw, 16vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-abnb-muted">No image</div>
          )}

          {guestFavourite && (
            <span className="absolute left-3 top-3 rounded-pill bg-abnb-surface px-2.5 py-1 text-xs font-semibold text-abnb-fg shadow-sm">
              Guest favourite
            </span>
          )}
        </div>

        <div className="mt-2 space-y-0.5">
          <h3 className="truncate font-semibold text-abnb-fg">{location}</h3>
          <p className="truncate text-sm text-abnb-muted">{listing.title}</p>
          <p className="text-sm text-abnb-fg">
            <span className="font-semibold">{price}</span>
            <span className="text-abnb-muted"> for 1 night</span>
            {listing.rating != null && (
              <span className="text-abnb-muted"> · ★ {listing.rating.toFixed(2)}</span>
            )}
          </p>
        </div>
      </Link>

      <button
        type="button"
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle(listing.id);
        }}
        className="absolute right-3 top-3 rounded-full p-1.5 text-white drop-shadow-md transition hover:scale-110"
      >
        <Heart
          className={`h-6 w-6 ${wished ? "fill-coral text-coral" : "fill-black/30 stroke-white stroke-2 dark:fill-white/25"}`}
        />
      </button>
    </article>
  );
}
