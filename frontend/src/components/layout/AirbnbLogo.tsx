/**
 * Site logo — high-quality Airbnb Bélo + wordmark PNG (transparent; works light/dark).
 */

import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";

interface AirbnbLogoProps {
  className?: string;
}

export function AirbnbLogo({ className = "" }: AirbnbLogoProps) {
  return (
    <Link
      href={ROUTES.home}
      className={`inline-flex shrink-0 items-center transition-opacity hover:opacity-90 ${className}`}
      aria-label="Airbnb home"
    >
      <Image
        src="/airbnb-logo.png"
        alt="airbnb"
        width={800}
        height={250}
        priority
        className="block h-8 w-auto object-contain object-left sm:h-9"
      />
    </Link>
  );
}
