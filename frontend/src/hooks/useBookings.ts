/**
 * Booking React Query hooks — pessimistic mutations (money-adjacent).
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/AuthProvider";
import {
  cancelBooking,
  checkoutBooking,
  createBooking,
  getBooking,
  getMyTrips,
} from "@/services/booking";
import type { CreateBookingPayload } from "@/types/booking";
import { getErrorMessage } from "@/utils/error";

export function useMyTrips() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.bookings.trips,
    queryFn: getMyTrips,
    enabled: isAuthenticated,
  });
}

export function useBooking(bookingId: number) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: () => getBooking(bookingId),
    enabled: isAuthenticated && bookingId > 0,
  });
}

export function useCreateBooking() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.listings.availability(booking.listing_id),
      });
      router.push(ROUTES.bookingCheckout(booking.id));
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Could not create booking"));
    },
  });
}

export function useCheckoutBooking() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: number) => checkoutBooking(bookingId),
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.listings.availability(booking.listing_id),
      });
      toast.success("Reservation confirmed");
      router.push(ROUTES.tripConfirm(booking.id));
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Checkout failed"));
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: number) => cancelBooking(bookingId),
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.listings.availability(booking.listing_id),
      });
      toast.success("Booking cancelled");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Could not cancel booking"));
    },
  });
}
