# Autonomous Work Worksheet

> **Session:** User away ~4–5 hours  
> **Started:** 2026-07-22  
> **Rule:** One milestone at a time. Mark done when verified runnable.

---

## Milestone 0–5 — DONE

- [x] Skeleton, DB+seed, Auth, Listings list, Search/filters, Listing detail

---

## UI track U1–U4 — DONE

See [`docs/UI_UX_REPLICATION_PLAN.md`](./UI_UX_REPLICATION_PLAN.md).

- [x] **U1** Design tokens + light/dark (`next-themes`)
- [x] **U2** Header + expandable Where/When/Who search
- [x] **U3** Home carousel rows + card redesign (hearts, Guest favourite)
- [x] **U4** Filters modal + Framer Motion polish
- [x] Then **M6** Wishlist (fills hearts for real)

---

## Milestone 6 — Wishlist (DONE)

- [x] Wishlist API + optimistic heart toggle + `/wishlists` page
- [x] Toasts via react-hot-toast
- [x] Profile menu → Wishlists

**API:** http://localhost:8015

---

## Milestone 7 — Booking flow (DONE)

- [x] Create pending booking + overlap prevention (409)
- [x] Mock checkout → confirmed
- [x] Cancel booking
- [x] My Trips + confirmation pages
- [x] BookingWidget → Reserve → checkout

**Try:** log in → listing → Reserve → Pay → Trips

---

## Milestone 8 — Host CRUD (DONE)

- [x] Dashboard stats
- [x] Create / edit / archive listings
- [x] Incoming bookings
- [x] Denser seed (40 listings; ~6 per city row)

**Host demo:** `sarah@example.com` / `password123` → `/host`

---

## Milestone 9 — Polish + bonuses (DONE)

- [x] Post-stay reviews (`POST /reviews` + Trips “Leave a review”)
- [x] EmptyState helper + clearer search empty/error
- [x] Carousel row motion; map “Open map” link
- [x] Dark mode already from U1

---

## Milestone 10 — README / deploy

- [x] README refreshed (ports, seed counts, architecture, deploy steps)
- [ ] Public GitHub push (user)
- [ ] Vercel frontend + Render backend (user credentials)

Audit fixes applied: port lock 8015, seed bookings 2026, lat/lng preserve, stay-draft, dead file cleanup, auth 401, host restore, listing assistant labeling, blocked-date UX, pytest smoke.

---

## Session log

| Time | Action | Status |
|------|--------|--------|
| Start | Fix frontend not running | ✅ |
| + | Move API to 8001 (stale 8000) | ✅ |
| + | M3 listings API + home grid | ✅ |
| + | M6 Wishlist | ✅ |
| + | M7 Booking | ✅ |
| + | M8 Host CRUD + denser rows | ✅ |
| + | M9 Polish + reviews | ✅ |
| Next | M10 README / deploy | Explain → wait for go |
