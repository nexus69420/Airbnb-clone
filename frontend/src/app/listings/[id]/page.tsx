/**
 * Listing detail — gallery, sleep, amenities, reviews, map, meet host, chatbot.
 */

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AmenityList } from "@/components/listings/AmenityList";
import { BookingWidget } from "@/components/listings/BookingWidget";
import { HostCard } from "@/components/listings/HostCard";
import { ListingChatbot } from "@/components/listings/ListingChatbot";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { ListingSectionNav } from "@/components/listings/ListingSectionNav";
import { MapPlaceholder } from "@/components/listings/MapPlaceholder";
import { MeetYourHost } from "@/components/listings/MeetYourHost";
import { ReviewList } from "@/components/listings/ReviewList";
import { SleepingArrangements } from "@/components/listings/SleepingArrangements";
import { ThingsToKnow } from "@/components/listings/ThingsToKnow";
import { useListing } from "@/hooks/useListingDetail";
import { formatLocation, formatPrice } from "@/utils/format";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: listing, isLoading, isError } = useListing(id);
  const [chatOpen, setChatOpen] = useState(false);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="h-[420px] animate-pulse rounded-2xl bg-abnb-surface-hover" />
        <div className="mt-8 h-8 w-1/2 animate-pulse rounded bg-abnb-surface-hover" />
      </main>
    );
  }

  if (isError || !listing) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16 text-center md:px-10">
        <h1 className="text-2xl font-semibold text-abnb-fg">Listing not found</h1>
        <Link href="/" className="mt-4 inline-block text-coral underline">
          Back to explore
        </Link>
      </main>
    );
  }

  const location = formatLocation(listing.city, listing.state, listing.country);
  const propertyLabel =
    listing.property_type.charAt(0).toUpperCase() + listing.property_type.slice(1);

  return (
    <main className="mx-auto max-w-7xl px-6 py-6 md:px-10">
      <h1 className="text-2xl font-semibold text-abnb-fg md:text-3xl">{listing.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-abnb-fg">
        {listing.rating != null && (
          <span className="font-medium">★ {listing.rating.toFixed(2)}</span>
        )}
        {listing.review_count > 0 && (
          <a href="#reviews" className="underline">
            {listing.review_count} reviews
          </a>
        )}
        <span className="text-abnb-muted">·</span>
        <a href="#location" className="font-medium underline">
          {location}
        </a>
      </div>

      <div id="photos" className="mt-6 scroll-mt-28">
        <ListingGallery images={listing.images} title={listing.title} />
      </div>

      <ListingSectionNav />

      <div className="mt-4 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-10">
          <section className="border-b border-abnb-border pb-8">
            <h2 className="text-xl font-semibold text-abnb-fg">
              Entire {propertyLabel.toLowerCase()} in {listing.city}
            </h2>
            <p className="mt-1 text-abnb-muted">
              {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds ·{" "}
              {listing.bathrooms} baths
            </p>
            {listing.rating != null && listing.review_count > 0 && (
              <p className="mt-2 text-sm font-medium text-abnb-fg">
                ★ {listing.rating.toFixed(1)} · {listing.review_count} reviews
              </p>
            )}
            <div className="mt-6">
              <HostCard host={listing.host} />
            </div>
          </section>

          <section className="border-b border-abnb-border pb-8">
            <p className="whitespace-pre-line leading-relaxed text-abnb-fg">
              {listing.description}
            </p>
          </section>

          <SleepingArrangements
            bedrooms={listing.bedrooms}
            beds={listing.beds}
            images={listing.images}
          />

          <section id="amenities" className="scroll-mt-28 border-b border-abnb-border pb-8">
            <h2 className="mb-5 text-xl font-semibold text-abnb-fg">What this place offers</h2>
            <AmenityList amenities={listing.amenities} />
          </section>

          <ReviewList
            listingId={listing.id}
            averageRating={listing.rating}
            reviewCount={listing.review_count}
          />

          <section id="location" className="scroll-mt-28 border-b border-abnb-border pb-10">
            <h2 className="mb-2 text-xl font-semibold text-abnb-fg">Where you&apos;ll be</h2>
            <p className="mb-5 text-abnb-muted">{location}</p>
            <MapPlaceholder lat={listing.lat} lng={listing.lng} label={location} />
          </section>

          <MeetYourHost host={listing.host} onMessage={() => setChatOpen(true)} />

          <ThingsToKnow maxGuests={listing.max_guests} />
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="hidden lg:block">
            <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-abnb-surface-hover" />}>
              <BookingWidget listing={listing} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-abnb-border bg-abnb-surface px-4 py-3 lg:hidden">
        <div>
          <p className="font-semibold text-abnb-fg">{location}</p>
          <p className="text-sm text-abnb-muted">
            from{" "}
            <span className="font-semibold text-abnb-fg">
              {formatPrice(listing.price_per_night)}
            </span>
            /night
          </p>
        </div>
        <a
          href="#booking-mobile"
          className="rounded-lg bg-coral px-5 py-3 text-sm font-semibold text-white"
        >
          Reserve
        </a>
      </div>

      <div id="booking-mobile" className="mt-10 lg:hidden">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-abnb-surface-hover" />}>
          <BookingWidget listing={listing} />
        </Suspense>
      </div>
      <div className="h-16 lg:hidden" />

      <ListingChatbot
        listingId={listing.id}
        listingTitle={listing.title}
        host={listing.host}
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </main>
  );
}
