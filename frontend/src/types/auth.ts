/**
 * Auth-related TypeScript types mirroring backend Pydantic schemas.
 *
 * Why this file exists:
 *   Single source of truth for User and token shapes on the frontend.
 */

export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_host: boolean;
  is_superhost: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  is_host?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
