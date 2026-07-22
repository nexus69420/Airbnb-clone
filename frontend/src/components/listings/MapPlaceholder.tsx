/**
 * Map preview — OpenStreetMap embed (no API key).
 */

interface MapPlaceholderProps {
  lat: number | null;
  lng: number | null;
  label: string;
}

export function MapPlaceholder({ lat, lng, label }: MapPlaceholderProps) {
  if (lat == null || lng == null) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-abnb-border bg-abnb-surface-hover text-sm text-abnb-muted">
        Map unavailable for this listing
      </div>
    );
  }

  const delta = 0.04;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const openUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-abnb-border">
      <div className="relative h-64 w-full bg-abnb-surface-hover md:h-80">
        <iframe
          title={`Map of ${label}`}
          src={embedSrc}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="flex items-start justify-between gap-3 border-t border-abnb-border bg-abnb-surface px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-abnb-fg">{label}</p>
          <p className="text-xs text-abnb-muted">Exact address shared after booking</p>
        </div>
        <a
          href={openUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-lg border border-abnb-border px-3 py-1.5 text-sm font-semibold text-abnb-fg hover:border-abnb-fg"
        >
          Open map
        </a>
      </div>
    </div>
  );
}
