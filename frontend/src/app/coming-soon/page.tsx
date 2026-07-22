/**
 * Coming-soon placeholder for Experiences / Services tabs.
 */

import Link from "next/link";

export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ feature?: string }>;
}) {
  const { feature = "This feature" } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-coral">Coming soon</p>
      <h1 className="mt-2 text-3xl font-semibold text-abnb-fg">{feature}</h1>
      <p className="mt-3 text-abnb-muted">
        Matching Airbnb&apos;s navigation. Experiences and Services are out of scope — Homes
        (stays) is the product focus.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-pill bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral-hover"
      >
        Explore homes
      </Link>
    </main>
  );
}
