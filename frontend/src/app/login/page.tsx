/**
 * Login page — thin route composition.
 */

import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-abnb-bg px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-abnb-border bg-abnb-surface p-8 shadow-elevated">
        <h1 className="text-2xl font-semibold text-abnb-fg">Welcome back</h1>
        <p className="mt-2 text-sm text-abnb-muted">
          Log in with your seed account or a new registration.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-abnb-muted">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-abnb-muted">
          Demo: alex@example.com / password123
        </p>
      </div>
    </main>
  );
}
