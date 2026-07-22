/**
 * Login form with React Hook Form + Zod validation.
 *
 * Why this file exists:
 *   Keeps page.tsx thin; form logic is testable and reusable.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/AuthProvider";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const fieldClass =
  "w-full rounded-lg border border-abnb-border bg-abnb-surface px-4 py-3 text-sm text-abnb-fg outline-none placeholder:text-abnb-muted focus:border-abnb-fg";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null);
    try {
      await login(values);
      const next = searchParams.get("next") ?? ROUTES.home;
      router.push(next);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setApiError(
          (error.response?.data as { detail?: string })?.detail ?? "Login failed",
        );
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {apiError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {apiError}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-abnb-fg">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={fieldClass}
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-abnb-fg">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={fieldClass}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-coral py-3 text-sm font-semibold text-white hover:bg-coral-hover disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Continue"}
      </button>

      <p className="text-center text-sm text-abnb-muted">
        New to Airbnb Clone?{" "}
        <Link href={ROUTES.register} className="font-medium text-abnb-fg underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
