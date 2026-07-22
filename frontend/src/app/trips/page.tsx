/**
 * My Trips — upcoming, past, and cancelled bookings.
 */

"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { BookingCard } from "@/components/bookings/BookingCard";
import { LeaveReviewForm } from "@/components/reviews/LeaveReviewForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants/routes";
import { useCancelBooking, useMyTrips } from "@/hooks/useBookings";
import { useAuth } from "@/providers/AuthProvider";
import type { Booking } from "@/types/booking";

function TripSection({
  title,
  bookings,
  empty,
  renderActions,
}: {
  title: string;
  bookings: Booking[];
  empty: string;
  renderActions?: (booking: Booking) => ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-abnb-fg">{title}</h2>
      {bookings.length === 0 ? (
        <p className="mt-3 text-sm text-abnb-muted">{empty}</p>
      ) : (
        <div>
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              actions={renderActions?.(booking)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function TripsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, isError } = useMyTrips();
  const cancel = useCancelBooking();

  if (authLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="h-8 w-40 animate-pulse rounded bg-abnb-surface-hover" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-abnb-fg">Log in to see your trips</h1>
        <p className="mt-2 text-abnb-muted">Upcoming stays and past adventures live here.</p>
        <Link
          href={`${ROUTES.login}?next=/trips`}
          className="mt-6 rounded-pill bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral-hover"
        >
          Log in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8 md:px-10">
      <h1 className="text-3xl font-semibold text-abnb-fg">Trips</h1>
      <p className="mt-1 text-abnb-muted">Your reservations</p>

      {isLoading && <p className="mt-10 text-sm text-abnb-muted">Loading trips…</p>}
      {isError && (
        <p className="mt-10 text-sm text-red-600">Could not load trips. Is the API running?</p>
      )}

      {data && (
        <>
          <TripSection
            title="Upcoming"
            bookings={data.upcoming}
            empty="No upcoming trips — reserve a home to get started."
            renderActions={(booking) => (
              <>
                {booking.status === "pending" && (
                  <Link
                    href={ROUTES.bookingCheckout(booking.id)}
                    className="rounded-pill bg-coral px-4 py-2 text-sm font-semibold text-white hover:bg-coral-hover"
                  >
                    Complete payment
                  </Link>
                )}
                {(booking.status === "pending" || booking.status === "confirmed") && (
                  <button
                    type="button"
                    disabled={cancel.isPending}
                    onClick={() => cancel.mutate(booking.id)}
                    className="rounded-pill border border-abnb-border px-4 py-2 text-sm font-semibold text-abnb-fg hover:bg-abnb-surface-hover"
                  >
                    Cancel
                  </button>
                )}
              </>
            )}
          />
          <TripSection
            title="Past"
            bookings={data.past}
            empty="No past trips yet."
            renderActions={(booking) =>
              booking.can_review ? (
                <LeaveReviewForm bookingId={booking.id} listingId={booking.listing_id} />
              ) : booking.has_review ? (
                <span className="text-sm text-abnb-muted">Reviewed</span>
              ) : null
            }
          />
          <TripSection
            title="Cancelled"
            bookings={data.cancelled}
            empty="No cancelled trips."
          />

          {data.upcoming.length === 0 && data.past.length === 0 && data.cancelled.length === 0 && (
            <EmptyState
              title="No trips yet"
              description="When you reserve a home, it will show up here."
              actionHref={ROUTES.home}
              actionLabel="Explore homes"
            />
          )}
        </>
      )}
    </main>
  );
}
