/**
 * Years hosting / member-since helpers from ISO timestamps.
 */

export function yearsHosting(createdAt: string | null | undefined): number {
  if (!createdAt) return 1;
  const start = new Date(createdAt).getTime();
  if (Number.isNaN(start)) return 1;
  const years = (Date.now() - start) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(1, Math.floor(years) || 1);
}

export function hostingSinceLabel(createdAt: string | null | undefined): string {
  const y = yearsHosting(createdAt);
  return y === 1 ? "1 year hosting" : `${y} years hosting`;
}
