/**
 * Registration form with React Hook Form + Zod validation.
 *
 * Why this file exists:
 *   Validates client-side before hitting the API; supports guest vs host signup.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/AuthProvider";

const registerSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Confirm your password"),
    is_host: z.boolean(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const fieldClass =
  "w-full rounded-lg border border-abnb-border bg-abnb-surface px-4 py-3 text-sm text-abnb-fg outline-none placeholder:text-abnb-muted focus:border-abnb-fg";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      is_host: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null);
    try {
      await registerUser({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
        is_host: values.is_host,
      });
      router.push(ROUTES.home);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setApiError(
          (error.response?.data as { detail?: string })?.detail ?? "Registration failed",
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
        <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-abnb-fg">
          Full name
        </label>
        <input
          id="full_name"
          type="text"
          autoComplete="name"
          className={fieldClass}
          {...register("full_name")}
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
        )}
      </div>

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
          autoComplete="new-password"
          className={fieldClass}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirm_password" className="mb-1 block text-sm font-medium text-abnb-fg">
          Confirm password
        </label>
        <input
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          className={fieldClass}
          {...register("confirm_password")}
        />
        {errors.confirm_password && (
          <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-abnb-fg">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-abnb-border bg-abnb-surface text-coral accent-coral"
          {...register("is_host")}
        />
        I want to host my property
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-coral py-3 text-sm font-semibold text-white hover:bg-coral-hover disabled:opacity-60"
      >
        {isSubmitting ? "Creating account…" : "Sign up"}
      </button>

      <p className="text-center text-sm text-abnb-muted">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="font-medium text-abnb-fg underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
