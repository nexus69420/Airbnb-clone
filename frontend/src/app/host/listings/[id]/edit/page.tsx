/**
 * Edit an owned listing.
 */

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { HostGate } from "@/components/host/HostGate";
import { ListingForm } from "@/components/host/ListingForm";
import { ROUTES } from "@/constants/routes";
import { useHostListing, useUpdateHostListing } from "@/hooks/useHost";

function EditInner() {
  const params = useParams<{ id: string }>();
  const listingId = Number(params.id);
  const { data, isLoading, isError } = useHostListing(listingId);
  const update = useUpdateHostListing(listingId);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="h-8 w-56 animate-pulse rounded bg-abnb-surface-hover" />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-red-600">Listing not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8 md:px-10">
      <Link href={ROUTES.hostListings} className="text-sm font-semibold text-coral hover:underline">
        ← Your listings
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-abnb-fg">Edit listing</h1>
      <p className="mt-1 text-abnb-muted">{data.title}</p>
      <div className="mt-8">
        <ListingForm
          key={data.id}
          initial={data}
          submitting={update.isPending}
          onSubmit={(p) => update.mutate(p)}
        />
      </div>
    </main>
  );
}

export default function HostEditListingPage() {
  return (
    <HostGate>
      <EditInner />
    </HostGate>
  );
}
