/**
 * Review list — overall rating + guest comments.
 * Category rows mirror overall score for UX polish (single rating in DB).
 */

"use client";

import {
  CheckCircle2,
  KeyRound,
  Map,
  MessageSquare,
  Sparkles,
  Tag,
} from "lucide-react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";

import { useListingReviews } from "@/hooks/useListingDetail";

interface ReviewListProps {
  listingId: number;
  averageRating: number | null;
  reviewCount: number;
}

const CATEGORIES: { label: string; icon: LucideIcon }[] = [
  { label: "Cleanliness", icon: Sparkles },
  { label: "Accuracy", icon: CheckCircle2 },
  { label: "Check-in", icon: KeyRound },
  { label: "Communication", icon: MessageSquare },
  { label: "Location", icon: Map },
  { label: "Value", icon: Tag },
];

export function ReviewList({ listingId, averageRating, reviewCount }: ReviewListProps) {
  const { data, isLoading } = useListingReviews(listingId);
  const score = averageRating != null ? Math.round(averageRating * 10) / 10 : null;

  return (
    <section id="reviews">
      <h2 className="mb-6 text-xl font-semibold text-abnb-fg">
        {reviewCount > 0 && averageRating != null
          ? `★ ${averageRating.toFixed(2)} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
          : "No reviews yet"}
      </h2>

      {reviewCount > 0 && score != null && (
        <>
          <p className="mb-4 text-xs text-abnb-muted">
            Category scores mirror the overall listing rating (we store one rating per review).
          </p>
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border-b border-abnb-border pb-3"
              >
                <span className="flex items-center gap-2 text-sm text-abnb-fg">
                  <Icon className="h-4 w-4 text-abnb-muted" />
                  {label}
                </span>
                <span className="text-sm font-semibold tabular-nums text-abnb-fg">
                  {score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {isLoading && <p className="text-sm text-abnb-muted">Loading reviews…</p>}

      {data && data.items.length > 0 && (
        <div className="grid gap-8 md:grid-cols-2">
          {data.items.map((review) => (
            <article key={review.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-abnb-surface-hover">
                  {review.author_avatar_url ? (
                    <Image
                      src={review.author_avatar_url}
                      alt={review.author_name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-abnb-fg">
                      {review.author_name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-abnb-fg">{review.author_name}</p>
                  <p className="text-xs text-abnb-muted">
                    {"★".repeat(review.rating)}
                    {review.created_at ? ` · ${review.created_at}` : ""}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-abnb-fg">{review.comment}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
