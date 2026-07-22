/**
 * Meet your host — profile card, stats, Message host CTA, link to all listings.
 */

"use client";

import { BadgeCheck, MessageCircle, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { hostingSinceLabel } from "@/utils/host";
import type { HostPublic } from "@/types/listing-detail";
import { useHostProfile } from "@/hooks/useHostProfile";

interface MeetYourHostProps {
  host: HostPublic;
  onMessage: () => void;
}

export function MeetYourHost({ host, onMessage }: MeetYourHostProps) {
  const { data: profile } = useHostProfile(host.id);
  const reviewCount = profile?.review_count ?? 0;
  const rating = profile?.rating;
  const yearsLabel = hostingSinceLabel(profile?.created_at ?? host.created_at);
  const responseRate = profile?.response_rate ?? 95;
  const responseTime = profile?.response_time ?? "within an hour";

  return (
    <section id="host" className="border-b border-abnb-border pb-10">
      <h2 className="mb-6 text-xl font-semibold text-abnb-fg">Meet your host</h2>
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <Link
          href={ROUTES.hostProfile(host.id)}
          className="rounded-3xl border border-abnb-border bg-abnb-surface p-8 text-center shadow-elevated transition hover:border-abnb-fg"
        >
          <div className="relative mx-auto h-28 w-28">
            <div className="relative h-28 w-28 overflow-hidden rounded-full bg-abnb-surface-hover">
              {host.avatar_url ? (
                <Image
                  src={host.avatar_url}
                  alt={host.full_name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-abnb-fg">
                  {host.full_name.charAt(0)}
                </span>
              )}
            </div>
            {(host.is_superhost || profile?.is_superhost) && (
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-coral text-white shadow">
                <BadgeCheck className="h-5 w-5" />
              </span>
            )}
          </div>
          <p className="mt-4 text-2xl font-semibold text-abnb-fg">{host.full_name}</p>
          {(host.is_superhost || profile?.is_superhost) && (
            <p className="text-sm font-medium text-abnb-muted">Superhost</p>
          )}
          <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-abnb-border pt-5 text-center">
            <div>
              <dt className="text-lg font-semibold text-abnb-fg">{reviewCount}</dt>
              <dd className="text-[11px] text-abnb-muted">Reviews</dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-abnb-fg">
                {rating != null ? `${rating.toFixed(1)} ★` : "—"}
              </dt>
              <dd className="text-[11px] text-abnb-muted">Rating</dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-abnb-fg">
                {yearsLabel.split(" ")[0]}
              </dt>
              <dd className="text-[11px] text-abnb-muted">Years hosting</dd>
            </div>
          </dl>
        </Link>

        <div className="flex flex-col justify-center">
          {(host.is_superhost || profile?.is_superhost) && (
            <div className="mb-4">
              <p className="font-semibold text-abnb-fg">{host.full_name} is a Superhost</p>
              <p className="mt-1 text-sm text-abnb-muted">
                Superhosts are experienced, highly rated hosts who are committed to providing
                great stays for guests.
              </p>
            </div>
          )}
          <ul className="space-y-2 text-sm text-abnb-fg">
            <li>Response rate: {responseRate}%</li>
            <li>Responds {responseTime}</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onMessage}
              className="inline-flex items-center gap-2 rounded-lg bg-abnb-surface-hover px-6 py-3 text-sm font-semibold text-abnb-fg hover:bg-abnb-border"
            >
              <MessageCircle className="h-4 w-4" />
              Ask about this stay
            </button>
            <Link
              href={ROUTES.hostProfile(host.id)}
              className="inline-flex items-center rounded-lg border border-abnb-border px-6 py-3 text-sm font-semibold text-abnb-fg hover:border-abnb-fg"
            >
              View all listings
            </Link>
          </div>
          <p className="mt-5 flex items-start gap-2 text-xs text-abnb-muted">
            <Shield className="mt-0.5 h-4 w-4 shrink-0" />
            Live host messaging is coming soon. The assistant answers listing FAQs only — keep
            booking and payments on this site.
          </p>
        </div>
      </div>
    </section>
  );
}
