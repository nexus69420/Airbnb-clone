/**
 * Incoming bookings for the host.
 */

"use client";

import Link from "next/link";

import { BookingCard } from "@/components/bookings/BookingCard";
import { HostGate } from "@/components/host/HostGate";
import { ROUTES } from "@/constants/routes";
import { useHostBookings } from "@/hooks/useHost";

function BookingsInner() {
  const { data = [], isLoading, isError } = useHostBookings();

  return (
    <main className="mx-auto max-w-3xl px-6 py-8 md:px-10">
      <Link href={ROUTES.host} className="text-sm font-semibold text-coral hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-abnb-fg">Incoming bookings</h1>
      <p className="mt-1 text-abnb-muted">Guests staying at your places</p>

      {isLoading && <p className="mt-10 text-sm text-abnb-muted">Loading…</p>}
      {isError && <p className="mt-10 text-sm text-red-600">Could not load bookings.</p>}
      {!isLoading && data.length === 0 && (
        <p className="mt-16 text-center text-abnb-muted">No bookings yet.</p>
      )}

      <div className="mt-6">
        {data.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </main>
  );
}

export default function HostBookingsPage() {
  return (
    <HostGate>
      <BookingsInner />
    </HostGate>
  );
}
