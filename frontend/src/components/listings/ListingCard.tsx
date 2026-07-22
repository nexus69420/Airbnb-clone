/**
 * Airbnb-style listing card — photo carousel, heart, Guest favourite, price · rating.
 * Links carry search dates/guests so the booking widget prefills.
 */

"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import {
  ListingCardPhotos,
  listingPhotoUrls,
} from "@/components/listings/ListingCardPhotos";
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
        <ListingCardPhotos
          urls={listingPhotoUrls(listing)}
          alt={listing.title}
          aspectClass="aspect-square"
          roundedClass="rounded-[10px]"
          sizes="(max-width: 768px) 40vw, (max-width: 1200px) 16vw, 148px"
          guestFavourite={guestFavourite}
        />

        <div className="mt-1.5 space-y-0.5">
          <h3 className="truncate text-[15px] font-semibold leading-snug text-abnb-fg">{location}</h3>
          <p className="truncate text-[13px] text-abnb-muted">{listing.title}</p>
          <p className="text-[13px] text-abnb-fg">
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
        className="absolute right-2 top-2 z-[3] rounded-full p-1 text-white drop-shadow-md transition hover:scale-110"
      >
        <Heart
          className={`h-5 w-5 ${wished ? "fill-coral text-coral" : "fill-black/30 stroke-white stroke-2 dark:fill-white/25"}`}
        />
      </button>
    </article>
  );
}
