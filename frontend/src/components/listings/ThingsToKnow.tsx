/**
 * Airbnb-style “Things to know” — cancellation, house rules, safety.
 */

import { CalendarDays, Home, Shield } from "lucide-react";

interface ThingsToKnowProps {
  maxGuests: number;
}

export function ThingsToKnow({ maxGuests }: ThingsToKnowProps) {
  return (
    <section className="border-t border-abnb-border pt-10">
      <h2 className="mb-8 text-xl font-semibold text-abnb-fg">Things to know</h2>
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-abnb-fg" />
            <h3 className="font-semibold text-abnb-fg">Cancellation policy</h3>
          </div>
          <ul className="space-y-2 text-sm text-abnb-muted">
            <li>Free cancellation until 24 hours before check-in.</li>
            <li>After that, the first night is non-refundable in this demo.</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Home className="h-5 w-5 text-abnb-fg" />
            <h3 className="font-semibold text-abnb-fg">House rules</h3>
          </div>
          <ul className="space-y-2 text-sm text-abnb-muted">
            <li>Check-in after 3:00 PM</li>
            <li>Checkout before 11:00 AM</li>
            <li>{maxGuests} guests maximum</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-abnb-fg" />
            <h3 className="font-semibold text-abnb-fg">Safety &amp; property</h3>
          </div>
          <ul className="space-y-2 text-sm text-abnb-muted">
            <li>Carbon monoxide alarm reported on many stays</li>
            <li>Smoke alarm reported on many stays</li>
            <li>Communicate only through this platform</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
