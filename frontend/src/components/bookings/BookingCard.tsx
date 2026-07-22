/**
 * Trip / booking summary card for My Trips and checkout.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import type { Booking } from "@/types/booking";
import { formatPrice } from "@/utils/format";

interface BookingCardProps {
  booking: Booking;
  actions?: ReactNode;
}

const statusLabel: Record<Booking["status"], string> = {
  pending: "Pending payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

export function BookingCard({ booking, actions }: BookingCardProps) {
  const listing = booking.listing;
  const title = listing?.title ?? `Listing #${booking.listing_id}`;
  const location = listing ? `${listing.city}, ${listing.country}` : "";

  return (
    <article className="flex flex-col gap-4 border-b border-abnb-border py-6 sm:flex-row sm:items-start">
      <Link
        href={ROUTES.listing(booking.listing_id)}
        className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-abnb-surface-hover sm:h-28 sm:w-40"
      >
        {listing?.image_url ? (
          <Image src={listing.image_url} alt={title} fill className="object-cover" sizes="160px" />
        ) : null}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-abnb-muted">
              {statusLabel[booking.status]}
            </p>
            <Link
              href={ROUTES.listing(booking.listing_id)}
              className="mt-0.5 block truncate text-lg font-semibold text-abnb-fg hover:underline"
            >
              {title}
            </Link>
            {location && <p className="text-sm text-abnb-muted">{location}</p>}
          </div>
          <p className="text-base font-semibold text-abnb-fg">{formatPrice(booking.total_cents)}</p>
        </div>

        <p className="mt-2 text-sm text-abnb-fg">
          {booking.check_in} → {booking.check_out}
          <span className="text-abnb-muted"> · {booking.guests} guest{booking.guests === 1 ? "" : "s"}</span>
        </p>

        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </article>
  );
}
