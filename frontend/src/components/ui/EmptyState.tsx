/**
 * Shared empty state — one job: message + optional CTA.
 */

import Link from "next/link";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
      <h2 className="text-xl font-semibold text-abnb-fg">{title}</h2>
      {description && <p className="mt-2 text-sm text-abnb-muted">{description}</p>}
      {children}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-6 rounded-pill bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:bg-coral-hover"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
