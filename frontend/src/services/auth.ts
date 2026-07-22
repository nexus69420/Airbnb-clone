/**
 * Auth API service.
 *
 * Why this file exists:
 *   Typed HTTP calls for register/login/me. No React — consumed by AuthProvider.
 */

import { apiClient } from "@/lib/api-client";
import type { LoginRequest, RegisterRequest, TokenResponse, User } from "@/types/auth";

export async function register(data: RegisterRequest): Promise<TokenResponse> {
  const { data: response } = await apiClient.post<TokenResponse>("/api/v1/auth/register", data);
  return response;
}

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const { data: response } = await apiClient.post<TokenResponse>("/api/v1/auth/login", data);
  return response;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/api/v1/auth/me");
  return data;
}
