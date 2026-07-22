/**
 * Token persistence helpers.
 *
 * Why this file exists:
 *   Isolates localStorage access so we can swap to httpOnly cookies in production
 *   without touching AuthProvider or the API client.
 *
 * Trade-off: localStorage is vulnerable to XSS; acceptable for interview MVP.
 * Production upgrade: set token in httpOnly, Secure, SameSite cookie from backend.
 */

const TOKEN_KEY = "airbnb_clone_access_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
