# UI/UX Replication Plan — Airbnb India (airbnb.co.in)

> **Source of truth for look & feel:** live Airbnb India homepage + listing UX  
> **Source of truth for features:** Assignment PDF + our architecture plan  
> **Goal:** Feel indistinguishable from Airbnb in polish, while keeping our FastAPI backend and milestone features.

**Status:** U1–U4 implemented (2026-07-22). Next: M6 Wishlist (wire hearts).  
**Do not confuse with Milestone 6+ features** — this is a **cross-cutting UI system** applied in U1–U4; wishlist persistence lands in M6.

---

## 1. What Airbnb India does today (observed)

### Header (top bar)
| Element | Behavior |
|---|---|
| Logo (coral `#FF385C`) | Left, brand-first |
| Center tabs | **Homes** / Experiences / Services — icon + label; Homes active for our clone |
| Right cluster | “Become a host”, language/globe (can stub), **profile pill** (hamburger + avatar) |
| Search | **Separate row** under header — large floating pill, not crammed into the logo row |

### Search pill (signature UX)
Three segments + coral circular search:
1. **Where** — “Search destinations”
2. **When** — “Add dates” (opens date picker popover)
3. **Who** — “Add guests” (stepper popover)
4. **Search** — round coral button with magnifying glass

On click, segments expand into a modal/popover (Airbnb’s “expanded search”).  
Mobile: compact bar → full-screen search sheet.

### Home body layout (2024–2026 India homepage)
**Not** only a category filter strip + one dense grid.

Primary pattern:
- **Horizontal carousels** per section
- Section title + arrow: e.g. “Popular homes in Noida →”
- ~6–7 cards visible on wide desktop; scroll arrows on hover
- Card: rounded photo, **heart** (wishlist), optional **Guest favourite** badge, title, price · rating on one gray line

Category/icon row still exists on many explore routes — we keep it **under** search or as a secondary filter strip when viewing “All stays” / search results.

### Listing card
| Detail | Spec |
|---|---|
| Image | ~4:3 or square-ish, large radius (~12–16px) |
| Heart | Top-right on image, white stroke / fill when saved |
| Badge | Top-left “Guest favourite” when rating high (e.g. ≥ 4.8 + enough reviews) |
| Title | Bold, 1 line truncate |
| Meta | `₹X for 1 night · 4.88` (or `$X` for our USD seed — locale later) |
| Hover | Subtle image zoom; carousel arrows appear on row |

### Filters
- **Filters** button opens a large modal (not a narrow side drawer only)
- Sections: price range (histogram nice-to-have), type of place, rooms/beds, amenities, booking options
- Sticky footer: Clear all / Show N places
- Results update URL query params (we already do this)

### Detail page (already partly done)
- Gallery grid matching Airbnb
- Sticky booking card with dates/guests
- Sections with hairline dividers
- Map block

### Motion (keep intentional, not noisy)
| Motion | Where |
|---|---|
| Search expand / collapse | Header search |
| Modal enter/exit | Filters, expanded search |
| Carousel scroll | Home rows |
| Card image scale | Hover |
| Heart pop | Wishlist (M6) |
| Theme crossfade | Light ↔ dark |

### Light + dark mode
Airbnb supports system/user preference with:
- Near-black surfaces in dark (`#222` / `#000` content areas)
- Soft borders (`#DDDDDD` light / `#333` dark)
- Coral CTAs unchanged
- Search pill elevated shadow in both themes

We will use **`next-themes`** + CSS variables (not only `prefers-color-scheme`).

---

## 2. Gap analysis vs our clone (today)

| Area | Airbnb India | Our app now | Gap |
|---|---|---|---|
| Header | Logo + Homes tabs + profile pill; search **below** | Logo + search in one row | Restructure header |
| Search | Where / When / Who + popovers | Inline inputs in pill | Expandable search UX |
| Home layout | **Carousel rows** by destination/theme | Single flat grid + category pills | Add row carousels |
| Cards | Heart, Guest favourite, price·rating line | No heart, rating beside title | Restyle cards |
| Filters | Large modal, “Show N places” | Side drawer | Upgrade to modal |
| Theme | Explicit light/dark | Auto OS only, incomplete tokens | Theme provider + tokens |
| Motion | Polished micro-interactions | Minimal | Framer Motion pass |
| Typography | Airbnb Cereal (proprietary) | Geist | Use **Circular-like** free stack: `Nunito Sans` or `DM Sans` + system |

---

## 3. Design tokens (implement once, use everywhere)

```css
:root {
  --abnb-coral: #FF385C;
  --abnb-coral-hover: #D90B3E;
  --abnb-bg: #FFFFFF;
  --abnb-fg: #222222;
  --abnb-muted: #6A6A6A;
  --abnb-border: #DDDDDD;
  --abnb-surface: #FFFFFF;
  --abnb-elevated-shadow: 0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05);
  --abnb-radius-card: 12px;
  --abnb-radius-pill: 40px;
}

.dark {
  --abnb-bg: #000000;
  --abnb-fg: #F7F7F7;
  --abnb-muted: #B0B0B0;
  --abnb-border: #333333;
  --abnb-surface: #222222;
}
```

**Rule:** No hard-coded `zinc-*` for chrome after the polish pass — use tokens / semantic Tailwind classes mapped to these variables.

---

## 4. Feature fidelity (search & filters — like them)

### Search (keep URL sync from M4)
| Airbnb control | Our param | Notes |
|---|---|---|
| Where | `location` | Destinations suggestions popover (cities from seed) |
| When | `check_in`, `check_out` | Calendar popover; blocked dates on detail only for now |
| Who | `guests` | Adults stepper (kids optional stub) |
| Search button | pushes `/?…` | Same as today |

### Filters modal
| Airbnb section | Our API | UI |
|---|---|---|
| Price range | `min_price`, `max_price` | Dual inputs + optional range |
| Type of place | `property_type` | House / Apartment / … chips |
| Amenities | `amenities` | Checkbox grid |
| Category | `category` | Via icon row **or** modal |
| Sort | `sort` | Dropdown in modal or results header |

### Out of scope for “exact UI” (placeholders OK per PDF)
- Experiences / Services tabs → link to “Coming soon”
- Real map search with pins → keep static / basic
- INR currency switch → USD for seed; add `₹` display toggle later if time

---

## 5. Implementation roadmap (UI track)

Implement as **Milestone U1–U4** interleaved with feature milestones, or as one focused UI sprint after M5.

### U1 — Design system + dark mode (foundation)
**Files:** `globals.css`, `ThemeProvider`, theme toggle in profile menu, layout tokens  
**Done when:** Toggle light/dark; all chrome uses tokens; no flash on load (`next-themes`).

### U2 — Header + expandable search (Airbnb India shell)
**Files:** `Navbar`, `SearchBar` → `SearchPill` + `SearchExpanded` / popovers (Where, When, Who)  
**Done when:** Header matches screenshot structure; search expands; URL still syncs.

### U3 — Home carousels + card redesign
**Files:** `ListingCard`, `ListingCarouselRow`, home page composition  
**API (small):** optional `GET /listings?city=…` already covered by `location` — compose 3–4 rows client-side from seed cities (Noida→use our cities: Malibu, Tokyo, Bali…).  
**Done when:** Home looks like horizontal “Popular homes in X” rows; hearts wired when M6 lands.

### U4 — Filters modal + motion polish
**Files:** Replace `FilterDrawer` with `FiltersModal`; Framer Motion on modal/search/carousel  
**Done when:** Filters feel like Airbnb; “Show N places” uses `total` from API.

### Then continue product milestones
- **M6 Wishlist** — heart fills, optimistic, `/wishlists`
- **M7 Booking** — keep booking card styling in tokens
- **M8 Host** — host UI can be slightly denser but still tokenized

---

## 6. Component map (target)

```
components/
  layout/
    Navbar.tsx              # logo | Homes tabs | host + profile
    ThemeToggle.tsx
  search/
    SearchPill.tsx          # collapsed Where|When|Who
    SearchExpanded.tsx      # overlay / expanded state
    DestinationSuggestions.tsx
    DateRangePopover.tsx
    GuestsPopover.tsx
    CategoryIconRow.tsx     # explore categories
    FiltersModal.tsx        # replaces FilterDrawer
  listings/
    ListingCard.tsx         # heart, badge, meta line
    ListingCarouselRow.tsx  # titled horizontal row
    ListingGrid.tsx         # search results (still used when filters active)
  motion/
    FadeIn.tsx              # shared wrappers
```

---

## 7. Mentor constraints (quality)

1. **Match Airbnb, not “AI SaaS”** — white/coral, soft shadows, pills — no purple gradients, no glassmorphism spam.
2. **Motion budget** — 2–3 signature motions per surface (search, modal, carousel). No bounce everywhere.
3. **Accessibility** — focus rings, Esc closes modals, `prefers-reduced-motion` respected.
4. **Don’t break URL search** — every visual redesign must keep M4 query-param contract.
5. **Experiences/Services** — visible tabs that go to Coming Soon; don’t build fake products.
6. **Interview story** — “We treated Airbnb’s design system as a product requirement and encoded tokens + composition, not a one-off CSS restyle.”

---

## 8. Suggested order when you say “go”

1. **U1** Design tokens + dark mode  
2. **U2** Header + search pill (biggest “wow”)  
3. **U3** Carousel home + card redesign  
4. **U4** Filters modal + motion  
5. Resume **M6 Wishlist** (hearts complete the cards)

---

## 9. Acceptance checklist (homepage)

- [ ] Looks like airbnb.co.in at a glance (logo, search pill, white space)
- [ ] Light and dark both polished
- [ ] Search Where/When/Who works and updates URL
- [ ] At least 3 carousel rows with scroll arrows
- [ ] Cards show heart slot + Guest favourite when eligible
- [ ] Filters modal with clear + show count
- [ ] Mobile: search sheet + stacked cards / horizontal scroll rows
