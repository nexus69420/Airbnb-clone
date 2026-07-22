/**
 * Shared gate for host-only pages.
 */

"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/AuthProvider";

export function HostGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isHost, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-abnb-surface-hover" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-abnb-fg">Log in as a host</h1>
        <Link
          href={`${ROUTES.login}?next=/host`}
          className="mt-6 rounded-pill bg-coral px-6 py-3 text-sm font-semibold text-white"
        >
          Log in
        </Link>
      </main>
    );
  }

  if (!isHost) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-abnb-fg">Become a host</h1>
        <p className="mt-2 text-abnb-muted">
          This account is a guest. Register a host account (or use a seed host like{" "}
          <code className="text-sm">sarah@example.com</code>) to manage listings.
        </p>
        <Link
          href={ROUTES.register}
          className="mt-6 rounded-pill bg-coral px-6 py-3 text-sm font-semibold text-white"
        >
          Sign up
        </Link>
      </main>
    );
  }

  return <>{children}</>;
}
