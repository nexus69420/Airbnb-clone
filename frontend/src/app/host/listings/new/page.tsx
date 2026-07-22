/**
 * Create a new host listing.
 */

"use client";

import Link from "next/link";

import { HostGate } from "@/components/host/HostGate";
import { ListingForm } from "@/components/host/ListingForm";
import { ROUTES } from "@/constants/routes";
import { useCreateHostListing } from "@/hooks/useHost";

function NewInner() {
  const create = useCreateHostListing();

  return (
    <main className="mx-auto max-w-3xl px-6 py-8 md:px-10">
      <Link href={ROUTES.hostListings} className="text-sm font-semibold text-coral hover:underline">
        ← Your listings
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-abnb-fg">Create a listing</h1>
      <p className="mt-1 text-abnb-muted">Prices are entered in dollars; stored as cents on the server.</p>
      <div className="mt-8">
        <ListingForm submitting={create.isPending} onSubmit={(p) => create.mutate(p)} />
      </div>
    </main>
  );
}

export default function HostNewListingPage() {
  return (
    <HostGate>
      <NewInner />
    </HostGate>
  );
}
