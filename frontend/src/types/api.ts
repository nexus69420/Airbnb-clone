/**
 * Shared TypeScript types mirroring backend Pydantic schemas.
 *
 * Why this file exists:
 *   Keeps FE/BE contracts aligned without codegen in early milestones.
 *   Expand as new endpoints land — never use `any` for API payloads.
 */

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
