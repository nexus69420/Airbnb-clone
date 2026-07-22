/**
 * Price calculation helpers for the booking widget.
 *
 * Why this file exists:
 *   UI preview only — server recalculates totals on booking (M7). Never trust client totals.
 */

export interface PriceBreakdown {
  nights: number;
  nightlySubtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
}

export function calculatePriceBreakdown(
  pricePerNightCents: number,
  cleaningFeeCents: number,
  serviceFeePercent: number,
  checkIn: string,
  checkOut: string,
): PriceBreakdown | null {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (nights < 1) return null;

  const nightlySubtotal = pricePerNightCents * nights;
  const cleaningFee = cleaningFeeCents;
  const serviceFee = Math.floor((nightlySubtotal * serviceFeePercent) / 100);
  return {
    nights,
    nightlySubtotal,
    cleaningFee,
    serviceFee,
    total: nightlySubtotal + cleaningFee + serviceFee,
  };
}

/** Check if [checkIn, checkOut) overlaps any blocked [bi, bo) ranges. */
export function overlapsBlocked(
  checkIn: string,
  checkOut: string,
  blocked: { check_in: string; check_out: string }[],
): boolean {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return blocked.some((b) => {
    const bi = new Date(b.check_in);
    const bo = new Date(b.check_out);
    return bi < end && bo > start;
  });
}
