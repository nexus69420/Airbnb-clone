# API contract

Base URL (local): `http://localhost:8015`  
Auth header (protected routes): `Authorization: Bearer <jwt>`

Error shape: `{ "detail": "...", "code": "..." }`

## Health

### `GET /api/v1/health` (canonical)

Versioned liveness probe. Frontend should call this path.

**Auth:** none  
**Status:** `200`

```json
{
  "status": "ok",
  "service": "Airbnb Clone API",
  "version": "0.1.0",
  "environment": "development"
}
```

### `GET /health` (platform alias)

Same body as `/api/v1/health`. Kept for Render/other hosts that probe `/health`.

## Auth

### `POST /api/v1/auth/register`

**Auth:** none  
**Status:** `201` | `409` (email taken) | `422` (validation)

Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "Jane Doe",
  "is_host": false
}
```

Response:
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "avatar_url": null,
    "is_host": false,
    "is_superhost": false
  }
}
```

### `POST /api/v1/auth/login`

**Auth:** none  
**Status:** `200` | `401` (invalid credentials)

Request:
```json
{
  "email": "alex@example.com",
  "password": "password123"
}
```

Response: same shape as register.

### `GET /api/v1/auth/me`

**Auth:** Bearer JWT required  
**Status:** `200` | `401`

Response: `user` object (same fields as above, no token).

## Catalog

### `GET /api/v1/categories`

**Auth:** none · **Status:** `200` — list of `{ id, name, slug, icon_key, sort_order }`

### `GET /api/v1/amenities`

**Auth:** none · **Status:** `200` — list of `{ id, name, slug, icon_key, amenity_group }`

## Listings

### `GET /api/v1/listings`

**Auth:** none · **Status:** `200` paginated `{ items, total, page, page_size, pages }`

Query params:

| Param | Notes |
|---|---|
| `location` | Matches city / state / country / title (case-insensitive) |
| `guests` | `max_guests >= guests` |
| `min_price` / `max_price` | Nightly rate in **cents** |
| `category` | Category slug |
| `property_type` | house, apartment, villa, cabin, guesthouse, hotel |
| `amenities` | Repeatable amenity slugs (AND) |
| `check_in` / `check_out` | Exclude listings with overlapping pending/confirmed bookings |
| `sort` | `newest` \| `price_asc` \| `price_desc` \| `rating_desc` |
| `page` / `page_size` | Pagination |

### `GET /api/v1/listings/{id}`

**Auth:** none · **Status:** `200` / `404`  
Full detail: images, amenities, category, host, rating, fees, lat/lng.

### `GET /api/v1/listings/{id}/reviews`

**Auth:** none · Paginated reviews with author name/avatar.

### `GET /api/v1/listings/{id}/availability`

**Auth:** none · `{ listing_id, blocked: [{ check_in, check_out }] }` for pending/confirmed bookings.

### Wishlists (JWT required)

| Method | Path | Status |
|---|---|---|
| GET | `/api/v1/wishlists` | 200 list of ListingCard |
| GET | `/api/v1/wishlists/ids` | 200 `{ listing_ids: number[] }` |
| POST | `/api/v1/wishlists/{listing_id}` | 201 (idempotent if already saved) |
| DELETE | `/api/v1/wishlists/{listing_id}` | 204 |

### Bookings (JWT required)

Money fields are **integer cents**. Server recalculates totals — never trust client math.

| Method | Path | Status | Notes |
|---|---|---|---|
| POST | `/api/v1/bookings` | 201 / 400 / 403 / 404 / 409 | Body: `{ listing_id, check_in, check_out, guests }` → `pending` |
| GET | `/api/v1/bookings/me` | 200 | `{ upcoming, past, cancelled }` trip buckets |
| GET | `/api/v1/bookings/{id}` | 200 / 403 / 404 | Guest owner or listing host |
| POST | `/api/v1/bookings/{id}/checkout` | 200 / 400 / 409 | Mock pay: `pending` → `confirmed` |
| POST | `/api/v1/bookings/{id}/cancel` | 200 / 400 | Guest: `pending`/`confirmed` → `cancelled` |

Overlap rule: pending + confirmed bookings block `[check_in, check_out)`.

### Reviews (JWT required)

| Method | Path | Status | Notes |
|---|---|---|---|
| POST | `/api/v1/reviews` | 201 / 400 / 403 / 409 | Body: `{ booking_id, rating 1–5, comment }`. Only after checkout; one per booking. Confirmed → completed on first review. |
| GET | `/api/v1/listings/{id}/reviews` | 200 | Public paginated list (existing) |

`GET /bookings/me` includes `has_review` + `can_review` flags on each booking.

### Host (JWT + `is_host`)

| Method | Path | Status | Notes |
|---|---|---|---|
| GET | `/api/v1/host/dashboard` | 200 | active/archived counts + booking stats |
| GET | `/api/v1/host/listings` | 200 | Owned listings (any status) |
| POST | `/api/v1/host/listings` | 201 | Create active listing (money in cents) |
| GET | `/api/v1/host/listings/{id}` | 200 / 403 | Owner detail for edit |
| PATCH | `/api/v1/host/listings/{id}` | 200 | Update owned listing |
| DELETE | `/api/v1/host/listings/{id}` | 204 | Soft-archive (`status=archived`) |
| GET | `/api/v1/host/bookings` | 200 | Incoming bookings across listings |
| GET | `/api/v1/host/listings/{id}/bookings` | 200 | Bookings for one listing |

## OpenAPI

Interactive docs while the API is running: `http://localhost:8015/docs`
