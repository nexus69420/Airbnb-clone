/**
 * Public host profile — stats + all active listings.
 */

"use client";

import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ListingCard } from "@/components/listings/ListingCard";
import { useHostListings, useHostProfile } from "@/hooks/useHostProfile";
import { hostingSinceLabel } from "@/utils/host";

export default function HostProfilePage() {
  const params = useParams<{ id: string }>();
  const hostId = Number(params.id);
  const { data: host, isLoading, isError } = useHostProfile(hostId);
  const { data: listings, isLoading: listingsLoading } = useHostListings(hostId);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="h-40 animate-pulse rounded-3xl bg-abnb-surface-hover" />
      </main>
    );
  }

  if (isError || !host) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16 text-center md:px-10">
        <h1 className="text-2xl font-semibold text-abnb-fg">Host not found</h1>
        <Link href="/" className="mt-4 inline-block text-coral underline">
          Back to explore
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <div className="flex flex-col gap-8 rounded-3xl border border-abnb-border bg-abnb-surface p-8 shadow-elevated md:flex-row md:items-center">
        <div className="relative mx-auto h-32 w-32 shrink-0 md:mx-0">
          <div className="relative h-32 w-32 overflow-hidden rounded-full bg-abnb-surface-hover">
            {host.avatar_url ? (
              <Image
                src={host.avatar_url}
                alt={host.full_name}
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-semibold text-abnb-fg">
                {host.full_name.charAt(0)}
              </span>
            )}
          </div>
          {host.is_superhost && (
            <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-coral text-white shadow">
              <BadgeCheck className="h-5 w-5" />
            </span>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-semibold text-abnb-fg">{host.full_name}</h1>
          <p className="mt-1 text-abnb-muted">
            {host.is_superhost ? "Superhost · " : ""}
            {hostingSinceLabel(host.created_at)}
          </p>
          <dl className="mt-6 flex flex-wrap justify-center gap-8 md:justify-start">
            <div>
              <dt className="text-2xl font-semibold text-abnb-fg">{host.listing_count}</dt>
              <dd className="text-sm text-abnb-muted">Listings</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold text-abnb-fg">{host.review_count}</dt>
              <dd className="text-sm text-abnb-muted">Reviews</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold text-abnb-fg">
                {host.rating != null ? `${host.rating.toFixed(1)} ★` : "—"}
              </dt>
              <dd className="text-sm text-abnb-muted">Rating</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold text-abnb-fg">{host.response_rate}%</dt>
              <dd className="text-sm text-abnb-muted">Response rate</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-abnb-muted">Typically responds {host.response_time}</p>
        </div>
      </div>

      <h2 className="mb-6 mt-12 text-xl font-semibold text-abnb-fg">
        {host.full_name}&apos;s listings
      </h2>

      {listingsLoading && (
        <p className="text-sm text-abnb-muted">Loading listings…</p>
      )}

      {listings && listings.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        !listingsLoading && (
          <p className="text-abnb-muted">No active listings right now.</p>
        )
      )}
    </main>
  );
}
