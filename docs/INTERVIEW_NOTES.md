# Interview Notes — Airbnb Clone

> **Living study guide.** Updated after every milestone.  
> Read before mock interviews. Add new bits at the bottom of each milestone section when we ship.

**How to use:** For each topic, practice saying *why → alternative → trade-off → one-liner answer* out loud.

---

## Standing rules (say these early)

1. **Layers:** Router → Service → Repository → DB. Routers never touch ORM; repositories don’t own booking/overlap business rules.
2. **Money:** Integer **cents** everywhere. Never float. Server recalculates totals — never trust the client.
3. **State:** TanStack Query for server data; Context for auth/theme; URL for search; local state for ephemeral UI.
4. **Optimistic UI:** Wishlist hearts only (low risk). Bookings stay **pessimistic** (money-adjacent).
5. **Auth upgrade path:** JWT in `localStorage` is fine for MVP; production → **httpOnly cookies** + CSRF strategy (XSS risk story).

### Global engineering decisions

| Decision | Chosen | Alternative | Trade-off |
|---|---|---|---|
| Money | Integer cents | Decimal / float | Floats break money; cents are interview-safe |
| Host model | `is_host` on User | Separate Host table | Simpler now; host profile can grow later |
| Search state | URL params on `/` | Dedicated `/search` or Zustand-only | Shareability + Airbnb UX > convenience |
| Booking races | Re-check at write time | Postgres `EXCLUDE` constraint | SQLite limit; document upgrade path |
| Soft-delete listings | `status = archived` | Hard `DELETE` | Preserves booking history |
| Images | Unsplash URLs first | S3 upload | PDF allows either; URLs ship faster |
| Auth | Real JWT Bearer | Fully mocked auth | Slightly more work; much stronger interview story |
| Pagination | Page-based first | Infinite scroll only | Clearer API; infinite scroll can wrap later |

**Layering soundbite:** *“Separation of concerns so each layer is testable and replaceable — e.g. swap SQLite for Postgres without touching routers.”*

---

## Milestone 0 — Skeleton & contracts

### Topics

**Monorepo `frontend/` + `backend/`**
- **Why:** Independent deploy targets (Vercel + Render); clear ownership boundaries.
- **Alt:** Single Next.js app with API routes.
- **Trade-off:** Two processes locally; cleaner production story.
- **Q:** Why not Next API routes?  
  **A:** Assignment + interview expect a real FastAPI backend with layered architecture; also matches separate FE/BE deploy.

**Versioned API `/api/v1` + `/health` alias**
- **Why:** Contract stability; platform health probes often hit `/health`.
- **Alt:** Unversioned paths only.
- **Trade-off:** Slight verbosity; easier future breaking changes under `/v2`.

**Axios `apiClient` + services layer**
- **Why:** One place for base URL, auth header, error shape; pages stay thin.
- **Alt:** `fetch` scattered in components.
- **Trade-off:** Tiny abstraction cost; huge maintainability win.

**pydantic-settings + lean M0 deps**
- **Why:** Typed/validated env; install TanStack/shadcn/auth only when needed.
- **Alt:** Scattered `os.getenv` + bundle everything upfront.
- **Trade-off:** Slightly empty-looking folders early — intentional placeholders, not dead code.

**CORS from env**
- **Why:** Local FE may be `:3000` or `:3001`; don’t hardcode.
- **Interview tip:** Mention credentials + explicit origins vs `*` in production.

---

## Milestone 1 — Database + Alembic + seed

### Topics

**Normalized schema + FKs + indexes**
- **Why:** Integrity (bookings → listings/users), query performance on city/price/dates.
- **Alt:** Denormalized JSON blobs.
- **Trade-off:** More joins; correct marketplace data model.

**Money columns as INTEGER cents + booking price snapshots**
- **Why:** Host can change nightly rate later without rewriting past bookings.
- **Alt:** Always join live listing price.
- **Trade-off:** Snapshot storage; historical accuracy for receipts/trips.

**Soft-delete via `ListingStatus.archived`**
- **Why:** Keep booking/review history for guests and hosts.
- **Alt:** Hard delete + cascade.
- **Trade-off:** Queries must filter `active`; history survives.

**Alembic migrations + seed script**
- **Why:** Reproducible DB for demos and teammates (PDF requirement).
- **Alt:** `create_all` only.
- **Trade-off:** Migration discipline; interviewers expect it.

**Overlap indexes on `(listing_id, check_in, check_out)`**
- **Why:** Availability and search date filters hit this path constantly.
- **Note:** Index helps lookups; **application rule** still enforces non-overlap (SQLite has no exclusion constraints).

---

## Milestone 2 — Auth (JWT)

### Topics

**Real JWT vs mocked auth**
- **Why:** Guest vs host roles, protected routes, stronger hiring signal.
- **Alt:** Fake session / hardcoded user.
- **Trade-off:** More setup; better security conversation.

**bcrypt password hashing**
- **Why:** Never store plaintext; salted slow hash resists rainbow tables.
- **Q:** Why not MD5/SHA?  
  **A:** Fast hashes are wrong for passwords; bcrypt/argon2 are deliberately slow.

**`GET /auth/me` + Bearer dependency**
- **Why:** Bootstrap session on FE refresh; central `CurrentUserDep`.
- **Alt:** Decode JWT only on client.
- **Trade-off:** Extra request; server remains source of truth for user fields.

**Token in `localStorage` (MVP)**
- **Why:** Simple Axios interceptor story.
- **Alt / upgrade:** httpOnly Secure cookie.
- **Trade-off:** XSS can steal token — call this out; cookies need CSRF plan.

**`is_host` flag (not separate Host table)**
- **Why:** Same person can be guest and host (real Airbnb).
- **Alt:** `hosts` table 1:1 with users.
- **Trade-off:** Simpler queries; host profile enrichment can come later.

**JWT claims = `sub` + `exp` only; no refresh token (MVP)**
- **Why:** No PII in token; short-lived access + re-login is acceptable interview scope.
- **Alt:** Fat claims / refresh-token rotation.
- **Trade-off:** Extra `/me` for profile; 24h re-login.

**Generic login errors + `UserPublic` DTO**
- **Why:** Avoid user enumeration; never leak `hashed_password`.
- **Alt:** “Email not found” / return raw User model.
- **Trade-off:** Slightly less UX detail; much better security story.

---

## Milestone 3 — Listings list + home grid

### Topics

**Card DTO vs Detail DTO**
- **Why:** Home grid doesn’t need amenities/description payload; smaller responses.
- **Alt:** One fat listing schema everywhere.
- **Trade-off:** Two shapes to maintain; better performance/UX.

**TanStack Query for listings**
- **Why:** Cache, loading/error states, refetch; avoid Context for server lists.
- **Alt:** Redux/`useEffect` fetch in every page.
- **Trade-off:** Library learning curve; idiomatic for remote data.

**Server-computed rating aggregate**
- **Why:** Don’t trust client math; one query for avg + count.
- **Alt:** Compute on FE from full review list.
- **Trade-off:** Extra SQL; correct and cheap at list scale.

---

## Milestone 4 — Search, filters, URL sync

### Topics

**Search on `/` via query params (not `/search`)**
- **Why:** Matches Airbnb; shareable URLs; one explore composition.
- **Alt:** Dedicated `/search` route + Zustand.
- **Trade-off:** URL parsing logic; demo looks production-ready.

**Filter in repository; validate in router/service**
- **Why:** SQL stays in repo; HTTP 400 rules stay at the edge.
- **Alt:** Giant router with raw SQL.
- **Trade-off:** Slightly more files; testable pieces.

**Availability filter = exclude overlapping pending/confirmed**
- **Why:** Same overlap predicate used later for booking writes.
- **Q:** Half-open ranges?  
  **A:** `[check_in, check_out)` — checkout day frees the listing for the next guest.

**Price filter: FE dollars → API cents**
- **Why:** Humans think in dollars; DB/API stay in cents.
- **Interview tip:** Show the `* 100` conversion and say “single currency unit at the boundary.”

**Amenities multi-select = AND**
- **Why:** Selecting Wifi + Kitchen means “must have both,” matching filter UX expectation.
- **Alt:** OR (any amenity matches).
- **Trade-off:** Stricter result sets; clearer mental model.

---

## Milestone 5 — Listing detail

### Topics

**Composition: Gallery, HostCard, Amenities, Reviews, BookingWidget**
- **Why:** No God Component; each piece has one job.
- **Alt:** One 800-line detail page.
- **Trade-off:** More files; interviewers love this structure.

**Static map image from lat/lng**
- **Why:** PDF allows basic/static map; interactive map is bonus.
- **Alt:** Mapbox/Google JS SDK.
- **Trade-off:** Less interactive; ships faster and still looks real.

**Price breakdown on FE is preview only**
- **Why:** UX feedback while typing dates; **server still recalculates** on reserve (M7).
- **Q:** What if client tampers with total?  
  **A:** Ignored — create booking builds totals from listing fees server-side.

**Availability endpoint for blocked ranges**
- **Why:** Widget can disable overlapping picks before submit.
- **Alt:** Only fail on POST.
- **Trade-off:** Extra read; much better UX.

---

## UI track (U1–U4) — Airbnb India fidelity

### Topics

**Design tokens + `next-themes`**
- **Why:** Light/Dark/System without hardcoding; brand colors as CSS variables.
- **Alt:** Ad-hoc Tailwind colors everywhere.
- **Trade-off:** Token setup time; consistent theming later.

**Expandable Where/When/Who search + Filters modal**
- **Why:** Visual parity with real Airbnb; motion with purpose (Framer Motion sparingly).
- **Mentor rule:** 2–3 intentional motions per surface — not decorative noise.

**Hearts as UI first, then M6 persistence**
- **Why:** Ship polish without blocking on API; then wire optimistic wishlist.
- **Trade-off:** Temporary “fake” hearts — called out until M6.

**UI redesign kept the M4 URL contract**
- **Why:** Visual parity must not break shareable search.
- **Q:** Did the Airbnb restyle rewrite search?  
  **A:** No — tokens/composition only; filters still live in the URL.

**Experiences / Services → Coming soon**
- **Why:** Look like Airbnb’s product surface without faking unfinished verticals.
- **Alt:** Build stub product tabs with fake data.
- **Trade-off:** Visible stubs; honest scope.

---

## Milestone 6 — Wishlist

### Topics

**Optimistic heart toggle**
- **Why:** Instant feedback; low-risk domain (not money).
- **Alt:** Wait for network then fill heart.
- **Trade-off:** Must rollback + toast on error (`onMutate` / `onError` / `onSettled`).

**Idempotent save + soft-fail delete**
- **Why:** Double-clicks and flaky networks shouldn’t 500.
- **Alt:** Strict 409 on duplicate.
- **Trade-off:** Slightly looser API; better UX.

**Query key factory (`wishlists.ids` / `.list`)**
- **Why:** Invalidate surgically after toggle.
- **Q:** Why not one big `["wishlists"]` only?  
  **A:** Cards need IDs without fetching full listing cards every time.

**Login required to save**
- **Why:** Wishlist is per-user; toast guides to auth instead of silent no-op.

---

## Milestone 7 — Booking flow

### Topics

**Pending → mock checkout → confirmed**
- **Why:** Separates hold/reserve from payment confirmation; mirrors real flows.
- **Alt:** Single POST that confirms immediately.
- **Trade-off:** Extra step; clearer state machine for interviews.

**Overlap prevention at write time**
- **Why:** Search/availability can race; re-check before insert and again on checkout.
- **Alt:** Postgres `EXCLUDE USING gist (daterange...)`.
- **Trade-off:** SQLite can’t do exclusion constraints — **application guard + document upgrade**.
- **Q:** Two users book the same dates simultaneously?  
  **A:** Both pass availability read; one wins on write; the other gets `409 booking_overlap`. Production: stronger isolation / exclusion constraints.

**Server-side fee math + snapshots**
- **Why:** Client breakdown is UX only; stored `*_cents` freeze the deal.
- **Formula:** `nights * nightly + cleaning + floor(subtotal * service_percent / 100)`.

**Pessimistic booking mutations**
- **Why:** Money-adjacent — don’t optimistically mark paid.
- **Contrast:** Wishlist hearts are optimistic.

**Cancel frees dates**
- **Why:** Cancelled status leaves the overlap query (only pending/confirmed block).

**Cannot book own listing**
- **Why:** Marketplace integrity; `403 cannot_book_own_listing`.

---

## Milestone 8 — Host CRUD

### Topics

**`CurrentHostDep` (`is_host` gate)**
- **Why:** Host routes are not just “logged in” — they require host capability.
- **Alt:** Separate Host role table / permissions service.
- **Trade-off:** Simple flag; fine for MVP marketplace.

**Soft-archive via DELETE → `archived`**
- **Why:** Preserve booking history; listing leaves explore feed.
- **Alt:** Hard delete.
- **Q:** What happens to past bookings?  
  **A:** Intact — archive only hides from public search (`ACTIVE` filter).

**Ownership checks in `HostService`**
- **Why:** Never trust client listing IDs; 403 if not owner.
- **Alt:** Row-level security in DB.
- **Trade-off:** App-layer guard; clear interview story.

**Form dollars → API cents**
- **Why:** Hosts think in dollars; storage stays integer cents.
- **Interview tip:** Same boundary conversion as search filters.

**Dashboard = aggregated counts**
- **Why:** One round-trip for host home; detailed lists on dedicated pages.
- **Alt:** Compute stats on the client from full lists.
- **Trade-off:** Extra endpoint; better UX and less over-fetch.

---

## Milestone 9 — Polish + bonuses

### Topics

**Post-stay review create (bonus shipped)**
- **Why:** PDF requires review *section*; write-after-stay is the stronger interview bonus.
- **Rules:** checkout date passed; status confirmed/completed; one review per booking (`booking_id` UNIQUE).
- **Q:** Can someone review before staying?  
  **A:** No — `400 stay_not_completed` until `check_out <= today`.

**`can_review` / `has_review` on trips payload**
- **Why:** FE doesn’t guess eligibility; server encodes the policy once.
- **Alt:** Separate `GET /bookings/{id}/review-eligibility`.
- **Trade-off:** Slightly fatter trips DTO; fewer round-trips.

**EmptyState as shared primitive**
- **Why:** Consistent empty UX without copy-paste blocks.
- **Mentor rule:** Cards only when they aid interaction — empty states stay open layout.

**Static map + pin link (not full Mapbox)**
- **Why:** PDF allows basic/static; “Open map” is enough for demo without keys/billing.
- **Upgrade path:** Mapbox/Google when product needs interactive pins.

**Motion budget**
- **Why:** Carousel `whileInView` + existing filters modal — purposeful, not noise.
- **Rule:** 2–3 intentional motions per major surface.

---

## Quick “likely questions” cheat sheet

| Question | Short answer |
|---|---|
| Where does business logic live? | `services/` — routers HTTP, repos SQL |
| Why cents? | Floats round wrong; integers are exact |
| Why JWT in localStorage? | MVP speed; production → httpOnly cookies |
| Why URL search params? | Shareable, back-button friendly, Airbnb-like |
| Why optimistic wishlist? | Low risk, better UX; bookings stay pessimistic |
| How prevent double booking? | Re-check overlap on write; 409 on conflict |
| Why soft-delete listings? | Preserve booking history |
| Why repository pattern on SQLite? | Interview clarity + future Postgres swap |
| When can guests review? | After checkout; one review per booking |

---

## Maintenance

After each milestone (M10+):

1. Append a new `## Milestone N` section here with decision / alt / trade-off / Q&A.
2. Update the global table if a standing decision changes.
3. Link from README “Interview prep” if missing.

**Last updated:** Milestone 9 (Polish + reviews) — 2026-07-23
