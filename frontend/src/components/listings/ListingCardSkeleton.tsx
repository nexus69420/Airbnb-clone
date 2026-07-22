/**
 * Skeleton placeholder while listing cards load.
 */

export function ListingCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-card bg-abnb-surface-hover" />
      <div className="mt-2 space-y-2">
        <div className="h-4 w-3/4 rounded bg-abnb-surface-hover" />
        <div className="h-3 w-full rounded bg-abnb-surface-hover" />
        <div className="h-3 w-1/2 rounded bg-abnb-surface-hover" />
      </div>
    </div>
  );
}
