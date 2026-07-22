/**
 * Host card on listing detail — links to public host profile.
 */

import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import type { HostPublic } from "@/types/listing-detail";

interface HostCardProps {
  host: HostPublic;
}

export function HostCard({ host }: HostCardProps) {
  return (
    <Link
      href={ROUTES.hostProfile(host.id)}
      className="flex items-center gap-4 rounded-2xl transition hover:bg-abnb-surface-hover"
    >
      <div className="relative h-14 w-14 overflow-hidden rounded-full bg-abnb-surface-hover">
        {host.avatar_url ? (
          <Image src={host.avatar_url} alt={host.full_name} fill className="object-cover" sizes="56px" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-abnb-muted">
            {host.full_name.charAt(0)}
          </span>
        )}
      </div>
      <div>
        <p className="text-lg font-semibold text-abnb-fg">Hosted by {host.full_name}</p>
        {host.is_superhost ? (
          <p className="text-sm font-medium text-coral">Superhost · View profile</p>
        ) : (
          <p className="text-sm text-abnb-muted">View profile &amp; listings</p>
        )}
      </div>
    </Link>
  );
}
