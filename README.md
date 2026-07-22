# Airbnb Clone

Production-oriented Airbnb clone for a fullstack hiring evaluation (Next.js + FastAPI).

### Live demo

| | URL |
|--|--|
| **App** | https://airbnb-clone-sand-five.vercel.app |
| **API** | https://airbnb-clone-api-svrn.onrender.com |
| **API docs** | https://airbnb-clone-api-svrn.onrender.com/docs |

Demo login: `alex@example.com` / `password123`

- Architecture: [`docs/ARCHITECTURE_AND_PLAN.md`](docs/ARCHITECTURE_AND_PLAN.md)
- API contract: [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md)
- Database: [`docs/DATABASE.md`](docs/DATABASE.md)
- Interview notes: [`docs/INTERVIEW_NOTES.md`](docs/INTERVIEW_NOTES.md)

## Structure

```
frontend/   Next.js 15 (App Router, TypeScript, Tailwind) → deploy on Vercel
backend/    FastAPI + SQLAlchemy + SQLite → deploy on Render
docs/       Planning & contracts
scripts/    Local helpers (dev.ps1)
```

## Prerequisites

- Node.js 20+
- Python 3.12+

## Quick start (recommended)

From repo root (Windows PowerShell):

```powershell
.\scripts\dev.ps1
```

- App: http://localhost:3000  
- API docs: http://localhost:8015/docs  

**API port is always `8015`** (matches `frontend/.env.local` and `frontend/.env.example`).

### Manual start (two terminals)

**Backend**

```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # or cp .env.example .env
alembic upgrade head
python -m scripts.seed --force
uvicorn app.main:app --reload --port 8015
```

**Frontend**

```bash
cd frontend
copy .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8015
npm install
npm run dev
```

## Demo accounts

All seed users use password **`password123`**.

| Role | Email |
|------|-------|
| Guest | `alex@example.com`, `jamie@example.com`, `chris@example.com` |
| Host | `sarah@example.com` (and marco / yuki / emma) |

Pending checkout demo: log in as **alex@example.com** → Trips → **Complete payment**, or open `/bookings/6/checkout`.

## Seed data

```bash
cd backend
python -m scripts.seed --force
```

| Entity | Count |
|--------|-------|
| Users (4 hosts, 3 guests) | 7 |
| Categories / amenities | 10 / 15 |
| Active listings (≥3 photos each) | 55 |
| Bookings (past completed + future pending/confirmed) | 7 |
| Reviews | 2 |
| Wishlists | 5 |

## Core features (assignment)

- Explore home with search (location / dates / guests), filters, categories, pagination
- Listing detail: gallery, amenities, host profile, OSM map, price breakdown, reviews
- Booking: date/guest validation, overlap prevention, mock checkout, My Trips
- Host: create / edit / archive / restore listings, dashboard, incoming bookings
- Wishlist + toasts, dark mode, listing FAQ assistant (not live host messaging)

## Architecture (short)

- **Backend:** Router → Service → Repository → SQLAlchemy. Money stored as **integer cents**. Listings soft-deleted via `status=archived`. Bookings use half-open `[check_in, check_out)`.
- **Frontend:** App Router pages → components → TanStack Query hooks → Axios services. Search state lives in the URL on `/`.

## Deploy (Milestone 10)

### Backend (Render)

1. New Web Service from this repo, root `backend/`
2. Build: `pip install -r requirements.txt`
3. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set env: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS=https://your-frontend.vercel.app`
5. Run migrate + seed once (Render shell or release command):  
   `alembic upgrade head && python -m scripts.seed --force`

### Frontend (Vercel)

1. Import repo, root `frontend/`
2. Env: `NEXT_PUBLIC_API_URL=https://your-api.onrender.com`
3. Deploy; confirm CORS includes the Vercel URL

### GitHub

Push a **public** repository with `frontend/` and `backend/` at the top level (assignment requirement).

## Assumptions

- Payments are mocked (card `4242` UX only).
- Listing photos are URLs (Unsplash-friendly); cloud upload is optional later.
- Map is an OpenStreetMap embed (no Google Maps key).
- “Ask about stay” is a rule-based listing FAQ bot; real guest↔host messaging is out of scope / Coming Soon per the PDF.

## Local troubleshooting

- Empty home / network errors → confirm API is on **8015** and `NEXT_PUBLIC_API_URL` matches; restart `npm run dev` after changing `.env.local`.
- Stale Windows port processes → close old uvicorn windows, then `.\scripts\dev.ps1` again.
- Never run frontend and backend in the **same** terminal on Windows.
