/**
 * Sticky section anchors: Photos · Amenities · Reviews · Location
 */

"use client";

const LINKS = [
  { href: "#photos", label: "Photos" },
  { href: "#amenities", label: "Amenities" },
  { href: "#reviews", label: "Reviews" },
  { href: "#location", label: "Location" },
] as const;

export function ListingSectionNav() {
  return (
    <nav
      className="sticky top-0 z-30 -mx-6 mb-6 hidden border-b border-abnb-border bg-abnb-bg/95 px-6 backdrop-blur md:block lg:top-20"
      aria-label="Listing sections"
    >
      <ul className="flex gap-6 text-sm font-semibold text-abnb-muted">
        {LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="inline-block border-b-2 border-transparent py-4 hover:border-abnb-fg hover:text-abnb-fg"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
