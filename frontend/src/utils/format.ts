/**
 * Format cents as USD display string for listing cards.
 */

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatLocation(city: string, state: string | null, country: string): string {
  if (state) return `${city}, ${state}`;
  return `${city}, ${country}`;
}
