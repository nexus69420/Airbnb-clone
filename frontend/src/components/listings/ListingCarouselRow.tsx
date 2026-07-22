/**
 * Horizontal carousel — 7 cards visible, title aligned to first card.
 * Airbnb-style “See all” card scrolls after the row.
 */

"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { ListingCard } from "@/components/listings/ListingCard";
import type { ListingCard as ListingCardType } from "@/types/listing";

interface ListingCarouselRowProps {
  title: string;
  location: string;
  seeAllHref: string;
  listings: ListingCardType[];
}

const CARD_GAP_PX = 16;
const PAGE_CARDS = 3;
const MAX_ROW_LISTINGS = 9;
const VISIBLE_CARDS = 7;

/**
 * Desktop: exactly 7 cards in view.
 * Smaller breakpoints show fewer so cards stay readable.
 */
const CARD_WIDTH = [
  "min-w-0 shrink-0 snap-start",
  "w-[calc((100%-1rem)/2)]",
  "sm:w-[calc((100%-2*1rem)/3)]",
  "md:w-[calc((100%-4*1rem)/5)]",
  `lg:w-[calc((100%-${VISIBLE_CARDS - 1}*1rem)/${VISIBLE_CARDS})]`,
].join(" ");

function SeeAllCard({
  href,
  listings,
}: {
  href: string;
  listings: ListingCardType[];
}) {
  const thumbs = listings.filter((l) => l.image_url).slice(0, 3);

  return (
    <Link href={href} data-carousel-card className={`group flex flex-col ${CARD_WIDTH}`}>
      <div className="relative aspect-square overflow-hidden rounded-[12px] bg-gradient-to-b from-abnb-surface-hover to-abnb-border/30">
        <div className="absolute inset-0 flex items-center justify-center">
          {thumbs.map((t, i) => {
            const rotates = [
              "-rotate-[14deg] -translate-x-5 translate-y-1",
              "rotate-0 z-10",
              "rotate-[14deg] translate-x-5 translate-y-1",
            ];
            return (
              <div
                key={t.id}
                className={`absolute h-[58%] w-[46%] overflow-hidden rounded-xl border-2 border-abnb-surface shadow-elevated ${rotates[i] ?? ""}`}
              >
                {t.image_url ? (
                  <Image src={t.image_url} alt="" fill className="object-cover" sizes="100px" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-center text-sm font-semibold text-abnb-fg group-hover:underline">
        See all
      </p>
    </Link>
  );
}

export function ListingCarouselRow({
  title,
  location,
  seeAllHref,
  listings,
}: ListingCarouselRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rowListings = listings.slice(0, MAX_ROW_LISTINGS);

  const scroll = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-card]");
    if (!card) return;
    const step = (card.getBoundingClientRect().width + CARD_GAP_PX) * PAGE_CARDS;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (!rowListings.length) return null;

  return (
    <motion.section
      className="group/row relative w-full"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Header shares the same left/right edges as the 7-card track */}
      <div className="mb-3 flex w-full items-center justify-between gap-3">
        <Link
          href={seeAllHref}
          className="flex min-w-0 items-center gap-1 text-lg font-semibold tracking-tight text-abnb-fg hover:underline md:text-[22px]"
        >
          <span className="truncate">{title}</span>
          <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={2.5} />
        </Link>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-abnb-border bg-abnb-surface text-abnb-fg shadow-sm hover:scale-105"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-abnb-border bg-abnb-surface text-abnb-fg shadow-sm hover:scale-105"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="scrollbar-hide flex w-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1"
      >
        {rowListings.map((listing) => (
          <div key={listing.id} data-carousel-card className={CARD_WIDTH}>
            <ListingCard listing={listing} />
          </div>
        ))}
        <SeeAllCard href={seeAllHref} listings={rowListings} />
      </div>
      <span className="sr-only">Browse all {location} stays</span>
    </motion.section>
  );
}
