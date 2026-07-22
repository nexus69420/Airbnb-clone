/**
 * Mock checkout — confirm pending booking (no real payment).
 */

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { BookingCard } from "@/components/bookings/BookingCard";
import { ROUTES } from "@/constants/routes";
import { useBooking, useCheckoutBooking } from "@/hooks/useBookings";
import { useAuth } from "@/providers/AuthProvider";
import { getErrorMessage, getErrorStatus } from "@/utils/error";
import { formatPrice } from "@/utils/format";

export default function CheckoutPage() {
  const params = useParams<{ id: string }>();
  const bookingId = Number(params.id);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: booking, isLoading, isError, error } = useBooking(bookingId);
  const checkout = useCheckoutBooking();

  if (authLoading || isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="h-8 w-56 animate-pulse rounded bg-abnb-surface-hover" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-abnb-fg">Log in to checkout</h1>
        <Link
          href={`${ROUTES.login}?next=/bookings/${bookingId}/checkout`}
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
        ? "This booking belongs to another account. Open Trips while logged in as the guest who reserved it."
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

  const alreadyPaid = booking.status !== "pending";

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-abnb-fg">Confirm and pay</h1>
      <p className="mt-1 text-abnb-muted">Mock payment — nothing is charged.</p>

      <div className="mt-8">
        <BookingCard booking={booking} />
      </div>

      <section className="mt-6 rounded-2xl border border-abnb-border p-5">
        <h2 className="text-lg font-semibold text-abnb-fg">Payment</h2>
        <p className="mt-2 text-sm text-abnb-muted">
          Card ending in 4242 · Demo mode. Clicking pay confirms your reservation instantly.
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-abnb-fg">
            <dt>Total due</dt>
            <dd className="font-semibold">{formatPrice(booking.total_cents)}</dd>
          </div>
        </dl>

        {alreadyPaid ? (
          <Link
            href={ROUTES.tripConfirm(booking.id)}
            className="mt-5 block w-full rounded-lg bg-coral py-3 text-center text-sm font-semibold text-white"
          >
            View confirmation
          </Link>
        ) : (
          <button
            type="button"
            disabled={checkout.isPending}
            onClick={() => checkout.mutate(booking.id)}
            className="mt-5 w-full rounded-lg bg-coral py-3 text-sm font-semibold text-white hover:bg-coral-hover disabled:opacity-50"
          >
            {checkout.isPending ? "Processing…" : `Pay ${formatPrice(booking.total_cents)}`}
          </button>
        )}
      </section>
    </main>
  );
}
