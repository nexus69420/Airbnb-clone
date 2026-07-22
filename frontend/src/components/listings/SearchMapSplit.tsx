/**
 * Airbnb-style split explore: listings grid (left) + sticky map with price pins (right).
 */

"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  ListingCardPhotos,
  listingPhotoUrls,
} from "@/components/listings/ListingCardPhotos";
import { useWishlistHeart } from "@/hooks/useWishlist";
import type { ListingCard } from "@/types/listing";
import { formatPrice } from "@/utils/format";
import { listingMapPin, resolveListingCoords } from "@/utils/geocode";
import { listingHref } from "@/utils/stay-draft";

interface SearchMapSplitProps {
  title: string;
  locationLabel: string;
  listings: ListingCard[];
}

function MapPricePins({
  listings,
  activeId,
  onHover,
}: {
  listings: ListingCard[];
  activeId: number | null;
  onHover: (id: number | null) => void;
}) {
  const pins = useMemo(() => {
    const withCoords = listings
      .map((l, i) => {
        const pin = listingMapPin(l, i);
        return pin ? { listing: l, ...pin } : null;
      })
      .filter(Boolean) as { listing: ListingCard; lat: number; lng: number }[];

    if (!withCoords.length) return null;

    const lats = withCoords.map((p) => p.lat);
    const lngs = withCoords.map((p) => p.lng);
    const pad = 0.04;
    const north = Math.max(...lats) + pad;
    const south = Math.min(...lats) - pad;
    const east = Math.max(...lngs) + pad;
    const west = Math.min(...lngs) - pad;
    const bbox = `${west}%2C${south}%2C${east}%2C${north}`;
    const centerLat = (north + south) / 2;
    const centerLng = (east + west) / 2;

    return { withCoords, bbox, north, south, east, west, centerLat, centerLng };
  }, [listings]);

  if (!pins) {
    return (
      <div className="flex h-full items-center justify-center bg-abnb-surface-hover text-sm text-abnb-muted">
        Map unavailable for this area
      </div>
    );
  }

  const { withCoords, bbox, north, south, east, west, centerLat, centerLng } = pins;
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${centerLat}%2C${centerLng}`;

  return (
    <div className="relative h-full w-full overflow-hidden bg-abnb-surface-hover">
      <iframe
        title={`Map of ${listings[0]?.city ?? "stays"}`}
        src={embedSrc}
        className="absolute inset-0 h-full w-full border-0 opacity-90"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {/* Price pin overlay */}
      <div className="pointer-events-none absolute inset-0">
        {withCoords.map(({ listing, lat, lng }) => {
          const left = ((lng - west) / (east - west)) * 100;
          const top = ((north - lat) / (north - south)) * 100;
          const active = activeId === listing.id;
          return (
            <Link
              key={listing.id}
              href={listingHref(listing.id)}
              onMouseEnter={() => onHover(listing.id)}
              onMouseLeave={() => onHover(null)}
              className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 text-xs font-bold shadow-md transition ${
                active
                  ? "z-20 scale-110 border-abnb-fg bg-abnb-fg text-abnb-bg"
                  : "z-10 border-abnb-border bg-abnb-surface text-abnb-fg hover:scale-105"
              }`}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {formatPrice(listing.price_per_night)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ExploreListingCard({
  listing,
  onHover,
}: {
  listing: ListingCard;
  active: boolean;
  onHover: (id: number | null) => void;
}) {
  const { isSaved, onToggle } = useWishlistHeart();
  const wished = isSaved(listing.id);
  const guestFavourite =
    listing.rating != null && listing.rating >= 4.8 && listing.review_count >= 1;

  return (
    <article
      className="group relative"
      onMouseEnter={() => onHover(listing.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Link href={listingHref(listing.id)} className="block">
        <ListingCardPhotos
          urls={listingPhotoUrls(listing)}
          alt={listing.title}
          aspectClass="aspect-[4/3]"
          roundedClass="rounded-xl"
          sizes="(max-width: 1024px) 50vw, 22vw"
          guestFavourite={guestFavourite}
        />
        <div className="mt-2 px-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-abnb-fg">
              {listing.property_type.charAt(0).toUpperCase() + listing.property_type.slice(1)} in{" "}
              {listing.city}
            </h3>
            {listing.rating != null && (
              <span className="shrink-0 text-xs text-abnb-fg">★ {listing.rating.toFixed(1)}</span>
            )}
          </div>
          <p className="truncate text-xs text-abnb-muted">{listing.title}</p>
          <p className="mt-1 text-sm text-abnb-fg">
            <span className="font-semibold">{formatPrice(listing.price_per_night)}</span>
            <span className="text-abnb-muted"> night</span>
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={wished ? "Remove from wishlist" : "Save"}
        onClick={(e) => {
          e.preventDefault();
          onToggle(listing.id);
        }}
        className="absolute right-3 top-3 z-[3] rounded-full p-1.5 text-white drop-shadow-md"
      >
        <Heart
          className={`h-5 w-5 ${wished ? "fill-coral text-coral" : "fill-black/30 stroke-white stroke-2"}`}
        />
      </button>
    </article>
  );
}

export function SearchMapSplit({ title, locationLabel, listings }: SearchMapSplitProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const cityCenter = resolveListingCoords(locationLabel, null, null);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col lg:flex-row">
      <section className="w-full shrink-0 overflow-y-auto px-4 py-4 lg:w-1/2 lg:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-abnb-fg md:text-xl">
            {listings.length > 0
              ? title || `${listings.length} homes in ${locationLabel}`
              : `No homes in ${locationLabel}`}
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ExploreListingCard
              key={listing.id}
              listing={listing}
              active={activeId === listing.id}
              onHover={setActiveId}
            />
          ))}
        </div>
        {cityCenter.lat == null && (
          <p className="mt-6 text-sm text-abnb-muted">Showing listings without a precise map center.</p>
        )}
      </section>

      <aside className="sticky top-[8.5rem] hidden h-[calc(100vh-9rem)] w-1/2 shrink-0 p-3 pl-2 lg:block">
        <div className="h-full overflow-hidden rounded-2xl border border-abnb-border shadow-sm">
          <MapPricePins listings={listings} activeId={activeId} onHover={setActiveId} />
        </div>
      </aside>

      <div className="h-72 w-full p-3 lg:hidden">
        <div className="h-full overflow-hidden rounded-2xl border border-abnb-border">
          <MapPricePins listings={listings} activeId={activeId} onHover={setActiveId} />
        </div>
      </div>
    </div>
  );
}
