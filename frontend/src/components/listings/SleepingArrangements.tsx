/**
 * “Where you'll sleep” — bedroom cards derived from listing bed counts.
 */

import Image from "next/image";

import type { ListingImage } from "@/types/listing-detail";

interface SleepingArrangementsProps {
  bedrooms: number;
  beds: number;
  images: ListingImage[];
}

export function SleepingArrangements({ bedrooms, beds, images }: SleepingArrangementsProps) {
  const roomCount = Math.max(1, bedrooms || 1);
  const bedsPerRoom = Math.max(1, Math.floor(beds / roomCount) || 1);
  const rooms = Array.from({ length: roomCount }, (_, i) => ({
    label: `Bedroom ${i + 1}`,
    beds: i === roomCount - 1 ? Math.max(1, beds - bedsPerRoom * (roomCount - 1)) : bedsPerRoom,
    image: images[Math.min(i + 1, images.length - 1)] ?? images[0] ?? null,
  }));

  return (
    <section className="border-b border-abnb-border pb-8">
      <h2 className="mb-5 text-xl font-semibold text-abnb-fg">Where you&apos;ll sleep</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {rooms.map((room) => (
          <article
            key={room.label}
            className="w-56 shrink-0 overflow-hidden rounded-2xl border border-abnb-border"
          >
            <div className="relative aspect-[4/3] bg-abnb-surface-hover">
              {room.image ? (
                <Image
                  src={room.image.url}
                  alt={room.label}
                  fill
                  className="object-cover"
                  sizes="224px"
                />
              ) : null}
            </div>
            <div className="p-4">
              <p className="font-semibold text-abnb-fg">{room.label}</p>
              <p className="text-sm text-abnb-muted">
                {room.beds} {room.beds === 1 ? "bed" : "beds"}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
