/**
 * Listing chatbot API.
 */

import { apiClient } from "@/lib/api-client";

export interface ChatReply {
  reply: string;
  suggestions: string[];
}

export async function sendChatMessage(listingId: number, message: string): Promise<ChatReply> {
  const { data } = await apiClient.post<ChatReply>("/api/v1/chat", {
    listing_id: listingId,
    message,
  });
  return data;
}
