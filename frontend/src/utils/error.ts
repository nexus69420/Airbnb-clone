/**
 * Extract a user-facing message from API / Axios errors.
 */

import axios from "axios";

export function getErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) return error.response?.status;
  return undefined;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Can't reach the API. Confirm it is running on port 8015.";
    }
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    if (typeof detail === "string" && detail.length > 0) return detail;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
