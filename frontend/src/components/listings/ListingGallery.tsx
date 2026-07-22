/**
 * Photo gallery for listing detail — main + side grid with rounded corners + lightbox.
 */

"use client";

import { Grid3X3 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type { ListingImage } from "@/types/listing-detail";

interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const display = images.length > 0 ? images : [];

  if (!display.length) {
    return (
      <div className="flex aspect-[2/1] items-center justify-center rounded-2xl bg-abnb-surface-hover text-abnb-muted">
        No photos
      </div>
    );
  }

  const main = display[0];
  const side = display.slice(1, 5);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        <div className="grid gap-2 md:h-[420px] md:grid-cols-4 md:grid-rows-2">
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="relative col-span-2 row-span-2 aspect-[4/3] overflow-hidden rounded-2xl bg-abnb-surface-hover md:aspect-auto md:h-full md:rounded-l-2xl md:rounded-r-none"
          >
            <Image
              src={main.url}
              alt={main.alt_text ?? title}
              fill
              className="object-cover transition duration-300 hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </button>
          {side.map((img, i) => {
            const isTopRight = i === 1;
            const isBottomRight = i === 3 || (side.length < 4 && i === side.length - 1 && i % 2 === 1);
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightboxIndex(i + 1)}
                className={`relative hidden overflow-hidden bg-abnb-surface-hover md:block ${
                  isTopRight ? "rounded-tr-2xl" : ""
                } ${isBottomRight ? "rounded-br-2xl" : ""}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text ?? title}
                  fill
                  className="object-cover transition duration-300 hover:scale-[1.02]"
                  sizes="25vw"
                />
              </button>
            );
          })}
        </div>

        {display.length > 1 && (
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-abnb-fg/20 bg-abnb-surface px-3 py-2 text-sm font-semibold text-abnb-fg shadow-elevated hover:bg-abnb-surface-hover"
          >
            <Grid3X3 className="h-4 w-4" />
            Show all photos
          </button>
        )}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90">
          <button
            type="button"
            className="absolute right-6 top-6 rounded-full bg-white/10 px-4 py-2 text-white"
            onClick={() => setLightboxIndex(null)}
          >
            Close
          </button>
          <button
            type="button"
            className="absolute left-4 rounded-full bg-white/10 px-3 py-2 text-white disabled:opacity-30"
            disabled={lightboxIndex <= 0}
            onClick={() => setLightboxIndex((i) => (i !== null ? i - 1 : i))}
          >
            ←
          </button>
          <div className="relative h-[70vh] w-[90vw] max-w-5xl overflow-hidden rounded-2xl">
            <Image
              src={display[lightboxIndex].url}
              alt={display[lightboxIndex].alt_text ?? title}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          <button
            type="button"
            className="absolute right-4 rounded-full bg-white/10 px-3 py-2 text-white disabled:opacity-30"
            disabled={lightboxIndex >= display.length - 1}
            onClick={() => setLightboxIndex((i) => (i !== null ? i + 1 : i))}
          >
            →
          </button>
        </div>
      )}
    </>
  );
}
