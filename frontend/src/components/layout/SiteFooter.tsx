/**
 * Site footer — Airbnb-style chrome with personal portfolio + tech stack.
 */

import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

import {
  FOOTER_DESTINATIONS,
  PORTFOLIO,
  TECH_STACK,
} from "@/constants/portfolio";
import { ROUTES } from "@/constants/routes";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0z" />
    </svg>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "text-sm text-abnb-muted transition-colors hover:text-abnb-fg hover:underline";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-abnb-border bg-abnb-surface-hover text-abnb-fg">
      {/* Inspiration strip */}
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <h2 className="text-xl font-semibold tracking-tight">Inspiration for future getaways</h2>
        <p className="mt-1 text-sm text-abnb-muted">Popular cities from this demo’s seed listings</p>
        <div
          className="mt-4 flex gap-6 overflow-x-auto border-b border-abnb-border pb-px scrollbar-hide"
          role="tablist"
          aria-label="Inspiration categories"
        >
          <span className="shrink-0 border-b-2 border-abnb-fg pb-3 text-sm font-semibold">
            Popular
          </span>
          <span className="shrink-0 pb-3 text-sm text-abnb-muted">Beach</span>
          <span className="shrink-0 pb-3 text-sm text-abnb-muted">Cities</span>
          <span className="shrink-0 pb-3 text-sm text-abnb-muted">Outdoors</span>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {FOOTER_DESTINATIONS.map((d) => (
            <li key={d.city}>
              <Link
                href={`${ROUTES.home}?location=${encodeURIComponent(d.city)}`}
                className="group block"
              >
                <span className="block text-sm font-semibold group-hover:underline">{d.city}</span>
                <span className="block text-xs text-abnb-muted">{d.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Portfolio + stack columns */}
      <div className="border-t border-abnb-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4 md:px-10">
          <section>
            <h3 className="text-sm font-semibold">Built by</h3>
            <p className="mt-4 text-base font-semibold">{PORTFOLIO.name}</p>
            <p className="mt-0.5 text-sm text-abnb-muted">{PORTFOLIO.role}</p>
            {PORTFOLIO.college ? (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-abnb-muted">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {PORTFOLIO.college}
              </p>
            ) : null}
            <p className="mt-3 text-sm leading-relaxed text-abnb-muted">{PORTFOLIO.tagline}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold">Connect</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${PORTFOLIO.email}`}
                  className="inline-flex items-center gap-2 text-sm text-abnb-muted hover:text-abnb-fg hover:underline"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  {PORTFOLIO.email}
                </a>
              </li>
              <li>
                <a
                  href={PORTFOLIO.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-abnb-muted hover:text-abnb-fg hover:underline"
                >
                  <GitHubIcon className="h-4 w-4 shrink-0" />
                  GitHub · {PORTFOLIO.githubLabel}
                </a>
              </li>
              {PORTFOLIO.linkedinUrl ? (
                <li>
                  <a
                    href={PORTFOLIO.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-abnb-muted hover:text-abnb-fg hover:underline"
                  >
                    <LinkedInIcon className="h-4 w-4 shrink-0" />
                    {PORTFOLIO.linkedinLabel}
                  </a>
                </li>
              ) : null}
              <li>
                <FooterLink href={PORTFOLIO.repoUrl} external>
                  Project repository
                </FooterLink>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold">Tech stack</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-abnb-muted">
                  Frontend
                </p>
                <ul className="mt-2 space-y-1.5">
                  {TECH_STACK.frontend.map((item) => (
                    <li key={item} className="text-sm text-abnb-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-abnb-muted">
                  Backend
                </p>
                <ul className="mt-2 space-y-1.5">
                  {TECH_STACK.backend.map((item) => (
                    <li key={item} className="text-sm text-abnb-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold">Project</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <FooterLink href={ROUTES.home}>Explore homes</FooterLink>
              </li>
              <li>
                <FooterLink href={ROUTES.host}>Host dashboard</FooterLink>
              </li>
              <li>
                <FooterLink href={ROUTES.trips}>My trips</FooterLink>
              </li>
              <li>
                <FooterLink href={PORTFOLIO.liveAppUrl} external>
                  Live deployment
                </FooterLink>
              </li>
              <li>
                <p className="text-xs font-semibold uppercase tracking-wide text-abnb-muted">
                  Deployed on
                </p>
                <ul className="mt-2 space-y-1.5">
                  {TECH_STACK.platform.map((item) => (
                    <li key={item} className="text-sm text-abnb-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* Bottom legal-ish bar */}
      <div className="border-t border-abnb-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm text-abnb-muted md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              © {year} {PORTFOLIO.name} · Airbnb Clone (demo)
            </span>
            <span className="hidden sm:inline" aria-hidden>
              ·
            </span>
            <FooterLink href="/coming-soon">Privacy</FooterLink>
            <span aria-hidden>·</span>
            <FooterLink href="/coming-soon">Terms</FooterLink>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-semibold text-abnb-fg">
              English (IN)
            </span>
            <div className="flex items-center gap-3">
              <a
                href={PORTFOLIO.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-abnb-fg hover:opacity-70"
              >
                <GitHubIcon className="h-4 w-4" />
              </a>
              {PORTFOLIO.linkedinUrl ? (
                <a
                  href={PORTFOLIO.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-abnb-fg hover:opacity-70"
                >
                  <LinkedInIcon className="h-4 w-4" />
                </a>
              ) : null}
              <a
                href={`mailto:${PORTFOLIO.email}`}
                aria-label="Email"
                className="text-abnb-fg hover:opacity-70"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
