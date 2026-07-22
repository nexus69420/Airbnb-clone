/**
 * Sticky booking widget — dates, guests, price popover, create pending booking.
 * Prefills check-in / checkout / guests from search URL (or session stay draft).
 */

"use client";

import { Tag, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useCreateBooking } from "@/hooks/useBookings";
import { useListingAvailability } from "@/hooks/useListingDetail";
import { useAuth } from "@/providers/AuthProvider";
import { formatPrice } from "@/utils/format";
import { calculatePriceBreakdown, overlapsBlocked } from "@/utils/pricing";
import { normalizeDateRange } from "@/utils/search-params";
import {
  guestCountFromDraft,
  listingHref,
  resolveStayDraft,
  saveStayDraft,
} from "@/utils/stay-draft";
import type { ListingDetail } from "@/types/listing-detail";
import { ROUTES } from "@/constants/routes";

interface BookingWidgetProps {
  listing: ListingDetail;
}

export function BookingWidget({ listing }: BookingWidgetProps) {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const { data: availability } = useListingAvailability(listing.id);
  const createBooking = useCreateBooking();

  const initial = useMemo(() => {
    const draft = resolveStayDraft(searchParams);
    const dates = normalizeDateRange(draft.check_in, draft.check_out);
    return {
      checkIn: dates.check_in ?? "",
      checkOut: dates.check_out ?? "",
      guests: guestCountFromDraft(draft, listing.max_guests),
    };
  }, [searchParams, listing.max_guests]);

  const [checkIn, setCheckIn] = useState(initial.checkIn);
  const [checkOut, setCheckOut] = useState(initial.checkOut);
  const [guests, setGuests] = useState(initial.guests);
  const [priceOpen, setPriceOpen] = useState(false);
  const priceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCheckIn(initial.checkIn);
    setCheckOut(initial.checkOut);
    setGuests(initial.guests);
  }, [initial.checkIn, initial.checkOut, initial.guests, listing.id]);

  const blocked = availability?.blocked ?? [];
  const overlap = checkIn && checkOut ? overlapsBlocked(checkIn, checkOut, blocked) : false;

  const breakdown = useMemo(() => {
    if (!checkIn || !checkOut || overlap) return null;
    return calculatePriceBreakdown(
      listing.price_per_night,
      listing.cleaning_fee,
      listing.service_fee_percent,
      checkIn,
      checkOut,
    );
  }, [checkIn, checkOut, overlap, listing]);

  const guestsInvalid = guests < 1 || guests > listing.max_guests;
  const canReserve = Boolean(breakdown) && !overlap && !guestsInvalid && !createBooking.isPending;

  const persistStay = (nextIn: string, nextOut: string, nextGuests: number) => {
    saveStayDraft({
      check_in: nextIn || null,
      check_out: nextOut || null,
      guests: nextGuests > 0 ? nextGuests : null,
      adults: nextGuests > 0 ? nextGuests : 0,
      children: 0,
      infants: 0,
      pets: 0,
    });
  };

  useEffect(() => {
    if (!priceOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPriceOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (priceRef.current && !priceRef.current.contains(e.target as Node)) {
        setPriceOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [priceOpen]);

  useEffect(() => {
    if (!breakdown) setPriceOpen(false);
  }, [breakdown]);

  const onReserve = () => {
    if (!canReserve || !checkIn || !checkOut) return;
    createBooking.mutate({
      listing_id: listing.id,
      check_in: checkIn,
      check_out: checkOut,
      guests,
    });
  };

  const cancelBeforeLabel = useMemo(() => {
    if (!checkIn) return null;
    const d = new Date(`${checkIn}T12:00:00`);
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long" });
  }, [checkIn]);

  const todayIso = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const loginNext = encodeURIComponent(
    listingHref(listing.id, {
      check_in: checkIn || null,
      check_out: checkOut || null,
      guests,
      adults: guests,
      children: 0,
      infants: 0,
      pets: 0,
    }),
  );

  return (
    <aside className="sticky top-28 overflow-visible rounded-2xl border border-abnb-border bg-abnb-surface shadow-elevated">
      <p className="flex items-center justify-center gap-1.5 rounded-t-2xl bg-[#E31C5F]/10 px-6 py-2 text-center text-xs font-semibold text-coral">
        <Tag className="h-3.5 w-3.5" />
        Prices include all fees
      </p>

      <div className="relative p-6" ref={priceRef}>
        {breakdown ? (
          <button
            type="button"
            onClick={() => setPriceOpen((o) => !o)}
            className="text-left text-xl font-semibold text-abnb-fg underline decoration-abnb-fg underline-offset-4"
            aria-expanded={priceOpen}
            aria-controls="price-details-popover"
          >
            {formatPrice(breakdown.total)}{" "}
            <span className="font-normal no-underline">
              for {breakdown.nights} night{breakdown.nights === 1 ? "" : "s"}
            </span>
          </button>
        ) : (
          <p className="text-xl text-abnb-fg">
            <span className="text-2xl font-semibold">{formatPrice(listing.price_per_night)}</span>
            <span className="text-base font-normal text-abnb-muted"> night</span>
          </p>
        )}

        {listing.rating != null && (
          <p className="mt-1 text-sm text-abnb-muted">
            ★ {listing.rating.toFixed(2)} · {listing.review_count} reviews
          </p>
        )}

        {priceOpen && breakdown && (
          <div
            id="price-details-popover"
            role="dialog"
            aria-label="Price details"
            className="absolute left-4 right-4 top-16 z-20 rounded-2xl border border-abnb-border bg-abnb-surface p-5 shadow-elevated"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-abnb-fg">Price details</h3>
              <button
                type="button"
                onClick={() => setPriceOpen(false)}
                className="rounded-full p-1 text-abnb-muted hover:bg-abnb-surface-hover hover:text-abnb-fg"
                aria-label="Close price details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="space-y-3 text-sm text-abnb-fg">
              <div className="flex justify-between gap-4">
                <dt>
                  {breakdown.nights} night{breakdown.nights === 1 ? "" : "s"} ×{" "}
                  {formatPrice(listing.price_per_night)}
                </dt>
                <dd className="tabular-nums">{formatPrice(breakdown.nightlySubtotal)}</dd>
              </div>
              {breakdown.cleaningFee > 0 && (
                <div className="flex justify-between gap-4">
                  <dt>Cleaning fee</dt>
                  <dd className="tabular-nums">{formatPrice(breakdown.cleaningFee)}</dd>
                </div>
              )}
              {breakdown.serviceFee > 0 && (
                <div className="flex justify-between gap-4">
                  <dt>Service fee</dt>
                  <dd className="tabular-nums">{formatPrice(breakdown.serviceFee)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 border-t border-abnb-border pt-3 font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(breakdown.total)}</dd>
              </div>
            </dl>
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-xl border border-abnb-border">
          <div className="grid grid-cols-2 border-b border-abnb-border">
            <label className="border-r border-abnb-border px-3 py-2">
              <span className="block text-[10px] font-semibold uppercase text-abnb-muted">
                Check-in
              </span>
              <input
                type="date"
                value={checkIn}
                min={todayIso}
                onChange={(e) => {
                  const dates = normalizeDateRange(e.target.value, checkOut);
                  const nextIn = dates.check_in ?? "";
                  const nextOut = dates.check_out ?? "";
                  setCheckIn(nextIn);
                  setCheckOut(nextOut);
                  persistStay(nextIn, nextOut, guests);
                }}
                className="w-full border-0 bg-transparent text-sm text-abnb-fg outline-none"
              />
            </label>
            <label className="px-3 py-2">
              <span className="block text-[10px] font-semibold uppercase text-abnb-muted">
                Checkout
              </span>
              <input
                type="date"
                value={checkOut}
                min={
                  checkIn
                    ? (() => {
                        const d = new Date(`${checkIn}T12:00:00`);
                        d.setDate(d.getDate() + 1);
                        const yyyy = d.getFullYear();
                        const mm = String(d.getMonth() + 1).padStart(2, "0");
                        const dd = String(d.getDate()).padStart(2, "0");
                        return `${yyyy}-${mm}-${dd}`;
                      })()
                    : todayIso
                }
                onChange={(e) => {
                  const dates = normalizeDateRange(checkIn, e.target.value);
                  const nextIn = dates.check_in ?? "";
                  const nextOut = dates.check_out ?? "";
                  setCheckIn(nextIn);
                  setCheckOut(nextOut);
                  persistStay(nextIn, nextOut, guests);
                }}
                className="w-full border-0 bg-transparent text-sm text-abnb-fg outline-none"
              />
            </label>
          </div>
          <label className="block px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase text-abnb-muted">Guests</span>
            <input
              type="number"
              min={1}
              max={listing.max_guests}
              value={guests}
              onChange={(e) => {
                const nextGuests = Number(e.target.value);
                setGuests(nextGuests);
                persistStay(checkIn, checkOut, nextGuests);
              }}
              className="w-full border-0 bg-transparent text-sm text-abnb-fg outline-none"
            />
          </label>
        </div>

        {blocked.length > 0 && (
          <div className="mt-3 rounded-lg border border-abnb-border bg-abnb-surface-hover px-3 py-2">
            <p className="text-xs font-semibold text-abnb-fg">Unavailable dates</p>
            <ul className="mt-1 space-y-0.5 text-xs text-abnb-muted">
              {blocked.slice(0, 6).map((b) => (
                <li key={`${b.check_in}-${b.check_out}`}>
                  {b.check_in} → {b.check_out}
                </li>
              ))}
              {blocked.length > 6 && <li>+{blocked.length - 6} more</li>}
            </ul>
          </div>
        )}

        {cancelBeforeLabel && !overlap && (
          <p className="mt-3 rounded-lg bg-abnb-surface-hover px-3 py-2 text-sm text-abnb-muted">
            Free cancellation before {cancelBeforeLabel}.
          </p>
        )}

        {overlap && (
          <p className="mt-3 text-sm text-red-600">Those dates are unavailable for this listing.</p>
        )}
        {guestsInvalid && (
          <p className="mt-3 text-sm text-red-600">
            Guests must be between 1 and {listing.max_guests}.
          </p>
        )}

        {!isAuthenticated ? (
          <Link
            href={`${ROUTES.login}?next=${loginNext}`}
            className="mt-5 block w-full rounded-lg bg-coral py-3 text-center text-sm font-semibold text-white hover:bg-coral-hover"
          >
            Log in to reserve
          </Link>
        ) : (
          <button
            type="button"
            disabled={!canReserve}
            onClick={onReserve}
            className="mt-5 w-full rounded-lg bg-coral py-3 text-sm font-semibold text-white hover:bg-coral-hover disabled:opacity-50"
          >
            {createBooking.isPending ? "Reserving…" : "Reserve"}
          </button>
        )}
        <p className="mt-3 text-center text-xs text-abnb-muted">You won&apos;t be charged yet</p>
      </div>
    </aside>
  );
}
