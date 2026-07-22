/**
 * Host listings list — edit / archive.
 */

"use client";

import Image from "next/image";
import Link from "next/link";

import { HostGate } from "@/components/host/HostGate";
import { ROUTES } from "@/constants/routes";
import { useArchiveHostListing, useHostListings, useRestoreHostListing } from "@/hooks/useHost";
import { formatPrice } from "@/utils/format";

function ListingsInner() {
  const { data = [], isLoading, isError } = useHostListings();
  const archive = useArchiveHostListing();
  const restore = useRestoreHostListing();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href={ROUTES.host} className="text-sm font-semibold text-coral hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-abnb-fg">Your listings</h1>
        </div>
        <Link
          href={ROUTES.hostListingsNew}
          className="rounded-pill bg-coral px-5 py-2.5 text-sm font-semibold text-white"
        >
          Create listing
        </Link>
      </div>

      {isLoading && <p className="mt-10 text-sm text-abnb-muted">Loading…</p>}
      {isError && <p className="mt-10 text-sm text-red-600">Could not load listings.</p>}

      {!isLoading && data.length === 0 && (
        <p className="mt-16 text-center text-abnb-muted">No listings yet — create your first stay.</p>
      )}

      <ul className="mt-8 divide-y divide-abnb-border">
        {data.map((listing) => (
          <li key={listing.id} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
            <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-abnb-surface-hover sm:w-36">
              {listing.image_url && (
                <Image src={listing.image_url} alt="" fill className="object-cover" sizes="144px" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase text-abnb-muted">{listing.status}</p>
              <p className="truncate text-lg font-semibold text-abnb-fg">{listing.title}</p>
              <p className="text-sm text-abnb-muted">
                {listing.city}, {listing.country} · {formatPrice(listing.price_per_night)} night
                {listing.upcoming_bookings > 0 ? ` · ${listing.upcoming_bookings} upcoming` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={ROUTES.listing(listing.id)}
                className="rounded-pill border border-abnb-border px-3 py-1.5 text-sm font-semibold"
              >
                View
              </Link>
              {listing.status === "archived" ? (
                <button
                  type="button"
                  disabled={restore.isPending}
                  onClick={() => restore.mutate(listing.id)}
                  className="rounded-pill border border-abnb-border px-3 py-1.5 text-sm font-semibold text-coral"
                >
                  Restore
                </button>
              ) : (
                <>
                  <Link
                    href={ROUTES.hostListingEdit(listing.id)}
                    className="rounded-pill border border-abnb-border px-3 py-1.5 text-sm font-semibold"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={archive.isPending}
                    onClick={() => {
                      if (confirm("Archive this listing? It will leave the explore feed.")) {
                        archive.mutate(listing.id);
                      }
                    }}
                    className="rounded-pill border border-abnb-border px-3 py-1.5 text-sm font-semibold text-red-600"
                  >
                    Archive
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default function HostListingsPage() {
  return (
    <HostGate>
      <ListingsInner />
    </HostGate>
  );
}
