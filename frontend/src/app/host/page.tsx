/**
 * Host dashboard — stats + quick links.
 */

"use client";

import Link from "next/link";

import { HostGate } from "@/components/host/HostGate";
import { ROUTES } from "@/constants/routes";
import { useHostDashboard } from "@/hooks/useHost";

function DashboardInner() {
  const { data, isLoading, isError } = useHostDashboard();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-abnb-fg">Host dashboard</h1>
          <p className="mt-1 text-abnb-muted">Your listings and bookings at a glance</p>
        </div>
        <Link
          href={ROUTES.hostListingsNew}
          className="rounded-pill bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:bg-coral-hover"
        >
          Create listing
        </Link>
      </div>

      {isLoading && <p className="mt-10 text-sm text-abnb-muted">Loading…</p>}
      {isError && <p className="mt-10 text-sm text-red-600">Could not load dashboard.</p>}

      {data && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active listings", value: data.active_listings },
            { label: "Archived", value: data.archived_listings },
            { label: "Upcoming bookings", value: data.upcoming_bookings },
            { label: "Pending payments", value: data.pending_bookings },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-abnb-border p-5">
              <p className="text-sm text-abnb-muted">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-abnb-fg">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <nav className="mt-10 flex flex-wrap gap-3">
        <Link href={ROUTES.hostListings} className="rounded-pill border border-abnb-border px-4 py-2 text-sm font-semibold hover:bg-abnb-surface-hover">
          Manage listings
        </Link>
        <Link href={ROUTES.hostBookings} className="rounded-pill border border-abnb-border px-4 py-2 text-sm font-semibold hover:bg-abnb-surface-hover">
          Incoming bookings
        </Link>
      </nav>
    </main>
  );
}

export default function HostDashboardPage() {
  return (
    <HostGate>
      <DashboardInner />
    </HostGate>
  );
}
