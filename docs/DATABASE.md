# Database schema

SQLite database file: `backend/airbnb_clone.db` (configurable via `DATABASE_URL`).

Migrations: Alembic (`backend/alembic/`).  
Seed: `python -m scripts.seed` from `backend/`.

## Tables

| Table | Purpose |
|---|---|
| `users` | Guests and hosts (`is_host`, `is_superhost`) |
| `categories` | Explore pill filters (Beachfront, Cabins, …) |
| `amenities` | Normalized amenity lookup |
| `listings` | Properties; money in **cents**; `status`: draft / active / archived |
| `listing_images` | Gallery URLs with `sort_order` |
| `listing_amenities` | M2M join table |
| `bookings` | Stays with price snapshots; overlap blocked in service layer |
| `reviews` | One per booking (`booking_id` UNIQUE) |
| `wishlists` | Saved listings (`user_id` + `listing_id` UNIQUE) |

## Key constraints

- `bookings`: `CHECK (check_out > check_in)`, `CHECK (guests >= 1)`
- `reviews`: `CHECK (rating >= 1 AND rating <= 5)`, `booking_id` UNIQUE
- `wishlists`: UNIQUE (`user_id`, `listing_id`)
- Listing soft-delete: set `status = archived` (no hard DELETE in host CRUD)

## Indexes

- `listings`: city, price_per_night, category_id, host_id, status, (lat, lng)
- `bookings`: (listing_id, check_in, check_out), guest_id, status
- `users.email`, `categories.slug`, `amenities.slug` — UNIQUE

## ER diagram

See [`ARCHITECTURE_AND_PLAN.md`](./ARCHITECTURE_AND_PLAN.md#4-database-schema) for the full Mermaid ER diagram.

## Demo accounts

All seed users use password: `password123`

| Email | Role |
|---|---|
| sarah@example.com | Host (superhost) |
| marco@example.com | Host (superhost) |
| yuki@example.com | Host |
| emma@example.com | Host (superhost) |
| alex@example.com | Guest |
| jamie@example.com | Guest |
| chris@example.com | Guest |
