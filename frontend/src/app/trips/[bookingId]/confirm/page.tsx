/**
 * Booking confirmation after mock checkout.
 */

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { BookingCard } from "@/components/bookings/BookingCard";
import { ROUTES } from "@/constants/routes";
import { useBooking } from "@/hooks/useBookings";
import { useAuth } from "@/providers/AuthProvider";
import { getErrorMessage, getErrorStatus } from "@/utils/error";

export default function TripConfirmPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = Number(params.bookingId);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: booking, isLoading, isError, error } = useBooking(bookingId);

  if (authLoading || isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="h-8 w-64 animate-pulse rounded bg-abnb-surface-hover" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-abnb-fg">Log in to view confirmation</h1>
        <Link
          href={`${ROUTES.login}?next=/trips/${bookingId}/confirm`}
          className="mt-6 rounded-pill bg-coral px-6 py-3 text-sm font-semibold text-white"
        >
          Log in
        </Link>
      </main>
    );
  }

  if (isError || !booking) {
    const status = getErrorStatus(error);
    const message =
      status === 403
        ? "This booking belongs to another account."
        : getErrorMessage(error, "Booking not found.");
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-red-600">{message}</p>
        <Link href={ROUTES.trips} className="mt-4 inline-block text-sm font-semibold text-coral underline">
          Back to trips
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-coral">You&apos;re going!</p>
      <h1 className="mt-1 text-3xl font-semibold text-abnb-fg">Reservation confirmed</h1>
      <p className="mt-2 text-abnb-muted">
        Confirmation #{booking.id}
        {booking.status === "confirmed"
          ? " — your dates are now blocked for other guests."
          : ` — status: ${booking.status}.`}
      </p>

      <div className="mt-8">
        <BookingCard booking={booking} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={ROUTES.trips}
          className="rounded-pill bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:bg-coral-hover"
        >
          View trips
        </Link>
        <Link
          href={ROUTES.home}
          className="rounded-pill border border-abnb-border px-5 py-2.5 text-sm font-semibold text-abnb-fg hover:bg-abnb-surface-hover"
        >
          Explore more
        </Link>
      </div>
    </main>
  );
}
