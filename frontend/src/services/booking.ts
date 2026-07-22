/**
 * Booking API service.
 */

import { apiClient } from "@/lib/api-client";
import type { Booking, CreateBookingPayload, TripsResponse } from "@/types/booking";

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const { data } = await apiClient.post<Booking>("/api/v1/bookings", payload);
  return data;
}

export async function getMyTrips(): Promise<TripsResponse> {
  const { data } = await apiClient.get<TripsResponse>("/api/v1/bookings/me");
  return data;
}

export async function getBooking(bookingId: number): Promise<Booking> {
  const { data } = await apiClient.get<Booking>(`/api/v1/bookings/${bookingId}`);
  return data;
}

export async function checkoutBooking(bookingId: number): Promise<Booking> {
  const { data } = await apiClient.post<Booking>(`/api/v1/bookings/${bookingId}/checkout`);
  return data;
}

export async function cancelBooking(bookingId: number): Promise<Booking> {
  const { data } = await apiClient.post<Booking>(`/api/v1/bookings/${bookingId}/cancel`);
  return data;
}
