/**
 * Health API service.
 *
 * Why this file exists:
 *   Demonstrates the services layer pattern: typed HTTP calls with no React.
 *   Components/hooks call this; they never import Axios directly.
 */

import { apiClient } from "@/lib/api-client";
import type { HealthResponse } from "@/types/api";

/**
 * Fetch API liveness from the versioned health endpoint.
 *
 * Input: none
 * Output: HealthResponse from GET /api/v1/health
 * Reasoning: Versioned path is the contract we will keep; root /health is for hosts only.
 */
export async function getHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>("/api/v1/health");
  return data;
}
