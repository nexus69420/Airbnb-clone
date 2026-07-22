/**
 * Register page — thin route composition.
 */

import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-abnb-bg px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-abnb-border bg-abnb-surface p-8 shadow-elevated">
        <h1 className="text-2xl font-semibold text-abnb-fg">Create your account</h1>
        <p className="mt-2 text-sm text-abnb-muted">
          Join as a guest or check &quot;host&quot; to list your property later.
        </p>
        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
