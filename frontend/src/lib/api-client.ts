/**
 * Shared Axios instance for all backend calls.
 *
 * Why this file exists:
 *   One place for base URL, timeouts, and auth interceptors.
 *   Feature services import this — they never construct their own Axios clients.
 */

import axios from "axios";

import { clearStoredToken, getStoredToken } from "@/lib/auth-storage";

export const AUTH_LOGOUT_EVENT = "abnb:auth-logout";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8015";

export const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearStoredToken();
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }
    return Promise.reject(error);
  },
);
