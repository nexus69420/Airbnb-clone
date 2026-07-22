/**
 * Leave a review after a completed stay.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

import { queryKeys } from "@/constants/query-keys";
import { createReview } from "@/services/reviews";
import { getErrorMessage } from "@/utils/error";

interface LeaveReviewFormProps {
  bookingId: number;
  listingId: number;
  onDone?: () => void;
}

export function LeaveReviewForm({ bookingId, listingId, onDone }: LeaveReviewFormProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => createReview({ booking_id: bookingId, rating, comment }),
    onSuccess: () => {
      toast.success("Thanks for your review");
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(listingId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
      setOpen(false);
      onDone?.();
    },
    onError: (err) => toast.error(getErrorMessage(err, "Could not submit review")),
  });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-pill border border-abnb-border px-4 py-2 text-sm font-semibold text-abnb-fg hover:bg-abnb-surface-hover"
      >
        Leave a review
      </button>
    );
  }

  return (
    <form
      className="w-full max-w-md space-y-3 rounded-2xl border border-abnb-border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (comment.trim().length < 10) {
          toast.error("Write at least 10 characters");
          return;
        }
        mutation.mutate();
      }}
    >
      <p className="text-sm font-semibold text-abnb-fg">How was your stay?</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl ${star <= rating ? "text-coral" : "text-abnb-muted"}`}
            aria-label={`${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Share details that help other guests…"
        className="w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-pill bg-coral px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {mutation.isPending ? "Sending…" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-pill border border-abnb-border px-4 py-2 text-sm font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
