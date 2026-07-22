/**
 * Site header matching Airbnb India: logo · Homes tabs · host/profile; search below.
 */

"use client";

import { Building2, Globe2, Menu, Search, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SearchExpanded } from "@/components/search/SearchExpanded";
import { SearchPill } from "@/components/search/SearchPill";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/AuthProvider";

type Segment = "where" | "when" | "who";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isHost, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSegment, setSearchSegment] = useState<Segment>("where");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const openSearch = (segment: Segment) => {
    setSearchSegment(segment);
    setSearchOpen(true);
  };

  const isHomes = pathname === "/" || pathname.startsWith("/listings");

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-abnb-border bg-abnb-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1760px] items-center justify-between gap-4 px-6 md:h-20 md:px-10">
          <Link href={ROUTES.home} className="shrink-0 text-coral">
            <span className="text-[1.65rem] font-bold tracking-tight">airbnb</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href={ROUTES.home}
              className={`flex flex-col items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold ${
                isHomes ? "text-abnb-fg" : "text-abnb-muted hover:bg-abnb-surface-hover"
              }`}
            >
              <Building2 className="h-5 w-5" />
              Homes
              {isHomes && <span className="h-0.5 w-6 rounded-full bg-abnb-fg" />}
            </Link>
            <Link
              href="/coming-soon?feature=Experiences"
              className="flex flex-col items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold text-abnb-muted hover:bg-abnb-surface-hover"
            >
              <Globe2 className="h-5 w-5" />
              Experiences
            </Link>
            <Link
              href="/coming-soon?feature=Services"
              className="flex flex-col items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold text-abnb-muted hover:bg-abnb-surface-hover"
            >
              <Sparkles className="h-5 w-5" />
              Services
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={isHost ? ROUTES.host : ROUTES.register}
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-abnb-fg hover:bg-abnb-surface-hover md:block"
            >
              Become a Host
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-pill border border-abnb-border bg-abnb-surface py-1.5 pl-3 pr-1.5 shadow-sm hover:shadow-elevated"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <Menu className="h-4 w-4 text-abnb-fg" />
                {isLoading ? (
                  <span className="h-8 w-8 animate-pulse rounded-full bg-abnb-surface-hover" />
                ) : isAuthenticated && user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-abnb-fg text-abnb-bg">
                    <User className="h-4 w-4" />
                  </span>
                )}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-abnb-border bg-abnb-surface py-2 text-abnb-fg shadow-elevated"
                >
                  {isAuthenticated && user ? (
                    <>
                      <div className="border-b border-abnb-border px-4 py-3">
                        <p className="truncate text-sm font-semibold text-abnb-fg">{user.full_name}</p>
                        <p className="truncate text-xs text-abnb-muted">{user.email}</p>
                      </div>
                      {isHost && (
                        <Link
                          href={ROUTES.host}
                          className="block px-4 py-2.5 text-sm text-abnb-fg hover:bg-abnb-surface-hover"
                          onClick={() => setMenuOpen(false)}
                        >
                          Host dashboard
                        </Link>
                      )}
                      <Link
                        href={ROUTES.wishlists}
                        className="block px-4 py-2.5 text-sm text-abnb-fg hover:bg-abnb-surface-hover"
                        onClick={() => setMenuOpen(false)}
                      >
                        Wishlists
                      </Link>
                      <Link
                        href={ROUTES.trips}
                        className="block px-4 py-2.5 text-sm text-abnb-fg hover:bg-abnb-surface-hover"
                        onClick={() => setMenuOpen(false)}
                      >
                        Trips
                      </Link>
                      <div className="border-b border-abnb-border px-3 py-3">
                        <p className="mb-2 px-1 text-xs font-semibold text-abnb-muted">Theme</p>
                        <ThemeToggle />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm text-abnb-fg hover:bg-abnb-surface-hover"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={ROUTES.register}
                        className="block px-4 py-2.5 text-sm font-semibold text-abnb-fg hover:bg-abnb-surface-hover"
                        onClick={() => setMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                      <Link
                        href={ROUTES.login}
                        className="block px-4 py-2.5 text-sm text-abnb-fg hover:bg-abnb-surface-hover"
                        onClick={() => setMenuOpen(false)}
                      >
                        Log in
                      </Link>
                      <div className="border-t border-abnb-border px-3 py-3">
                        <p className="mb-2 px-1 text-xs font-semibold text-abnb-muted">Theme</p>
                        <ThemeToggle />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden border-t border-transparent pb-4 pt-1 md:block">
          <Suspense fallback={<div className="mx-auto h-14 max-w-3xl animate-pulse rounded-pill bg-abnb-surface-hover" />}>
            <SearchPill onExpand={openSearch} />
          </Suspense>
        </div>

        <div className="border-t border-abnb-border px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => openSearch("where")}
            className="flex w-full items-center gap-3 rounded-pill border border-abnb-border bg-abnb-surface px-4 py-3 text-left shadow-elevated"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral text-white">
              <Search className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-abnb-fg">Start your search</span>
              <span className="block text-xs text-abnb-muted">Anywhere · Any week · Add guests</span>
            </span>
          </button>
        </div>
      </header>

      {searchOpen && (
        <Suspense fallback={null}>
          <SearchExpanded initialSegment={searchSegment} onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
