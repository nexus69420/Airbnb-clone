/**
 * Horizontal carousel row — “Popular homes in X →”
 */

"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { ListingCard } from "@/components/listings/ListingCard";
import type { ListingCard as ListingCardType } from "@/types/listing";

interface ListingCarouselRowProps {
  title: string;
  href: string;
  listings: ListingCardType[];
}

export function ListingCarouselRow({ title, href, listings }: ListingCarouselRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 400), behavior: "smooth" });
  };

  if (!listings.length) return null;

  return (
    <motion.section
      className="group/row relative"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <Link href={href} className="flex items-center gap-1 text-xl font-semibold text-abnb-fg hover:underline">
          {title}
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="absolute -left-3 top-1/3 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-abnb-border bg-abnb-surface shadow-elevated hover:scale-105 md:group-hover/row:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          className="absolute -right-3 top-1/3 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-abnb-border bg-abnb-surface shadow-elevated hover:scale-105 md:group-hover/row:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div
          ref={scrollerRef}
          className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {listings.map((listing) => (
            <div key={listing.id} className="w-[42vw] shrink-0 sm:w-[28vw] md:w-[18vw] lg:w-[13.5vw]">
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
