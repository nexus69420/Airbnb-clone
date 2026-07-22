/**
 * Card photo strip with hover-only prev/next + dots (Airbnb explore cards).
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, type MouseEvent } from "react";

interface ListingCardPhotosProps {
  urls: string[];
  alt: string;
  /** Tailwind aspect class, e.g. aspect-square or aspect-[4/3] */
  aspectClass?: string;
  sizes?: string;
  roundedClass?: string;
  guestFavourite?: boolean;
}

export function ListingCardPhotos({
  urls,
  alt,
  aspectClass = "aspect-square",
  sizes = "(max-width: 768px) 50vw, 20vw",
  roundedClass = "rounded-[12px]",
  guestFavourite = false,
}: ListingCardPhotosProps) {
  const photos = urls.filter(Boolean);
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const current = count > 0 ? photos[Math.min(index, count - 1)] : null;
  const canNav = count > 1;
  const dotCount = Math.min(count, 5);
  const activeDot =
    count <= 5 ? index : Math.min(dotCount - 1, Math.round((index / (count - 1)) * (dotCount - 1)));

  const go = (delta: number, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canNav) return;
    setIndex((i) => (i + delta + count) % count);
  };

  return (
    <div className={`relative ${aspectClass} overflow-hidden ${roundedClass} bg-abnb-surface-hover`}>
      {current ? (
        <Image src={current} alt={alt} fill className="object-cover" sizes={sizes} />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-abnb-muted">No image</div>
      )}

      {guestFavourite && (
        <span className="absolute left-2 top-2 z-[1] rounded-pill bg-abnb-surface px-2 py-0.5 text-[10px] font-semibold text-abnb-fg shadow-sm">
          Guest favourite
        </span>
      )}

      {canNav && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => go(-1, e)}
            className="absolute left-2 top-1/2 z-[2] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#222222] opacity-0 shadow-md transition hover:scale-105 group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => go(1, e)}
            className="absolute right-2 top-1/2 z-[2] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#222222] opacity-0 shadow-md transition hover:scale-105 group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <div className="pointer-events-none absolute bottom-2 left-1/2 z-[1] flex -translate-x-1/2 gap-1">
            {Array.from({ length: dotCount }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === activeDot ? "bg-white" : "bg-white/55"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Resolve photo list from card payload (API may only send image_url on older deploys). */
export function listingPhotoUrls(listing: {
  image_url: string | null;
  image_urls?: string[] | null;
}): string[] {
  if (listing.image_urls?.length) return listing.image_urls;
  return listing.image_url ? [listing.image_url] : [];
}
