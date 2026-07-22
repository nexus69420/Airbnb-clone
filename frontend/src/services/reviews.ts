/**
 * Review API service.
 */

import { apiClient } from "@/lib/api-client";

export interface CreateReviewPayload {
  booking_id: number;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: number;
  rating: number;
  comment: string;
  created_at: string | null;
  author_name: string;
  author_avatar_url: string | null;
  listing_id: number | null;
  booking_id: number | null;
}

export async function createReview(payload: CreateReviewPayload): Promise<ReviewResponse> {
  const { data } = await apiClient.post<ReviewResponse>("/api/v1/reviews", payload);
  return data;
}
