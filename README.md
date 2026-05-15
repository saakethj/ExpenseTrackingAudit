# ExpenseTracking Audit

A secure, multi-user financial dashboard with an audit-grade aesthetic — dark-first, purple + orange gradient accents, built on Next.js 15 and Tailwind CSS v4.

> **Status:** Auth ✅ | Dashboard shell ✅ | User profile (5/7 sections) ✅ | Appearance system ✅ | Dashboard home UI ✅ | Add Transaction (modal + server action + RLS) ✅
>
> **Next:** Row-level edit on Recent Transactions → CSV import → wire summary cards / recent / breakdown to real DB rows

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 (CSS-variable theming, `@theme inline`) |
| Theming | `next-themes` (light / dark / system) |
| Auth & DB | Supabase (`@supabase/ssr`) — email/password + Google OAuth |
| Icons | `lucide-react` |
| Animation | `framer-motion` (micro-interactions only) |
| Font | Inter (SF Pro / Roboto stand-in) |

---

## Getting started

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

Only the `anon` key belongs here — never the `service_role` key. Restart the dev server after editing.

In Supabase Dashboard → Authentication → URL Configuration, add `http://localhost:3000/auth/callback` to **Redirect URLs**. For Google OAuth, also add the same URL to **Authorized redirect URIs** in your Google Cloud OAuth client (the one Supabase uses is `https://<your-project-ref>.supabase.co/auth/v1/callback`).

### Routes

| Path | Status | Description |
|---|---|---|
| `/` | ✅ | Landing page |
| `/login` | ✅ | Sign in (Google + email/password) |
| `/signup` | ✅ | Create account (Google + email/password, confirmation required) |
| `/auth/callback` | ✅ | OAuth + email-confirm code exchange (no UI) |
| `/dashboard` | ✅ | Greeting + glass date card, "Manage your money" quick actions, summary cards, recent transactions, category breakdown. Add Transaction modal writes live to Supabase. |
| `/dashboard/profile` | ✅ | User profile with 5 working sections: General, Preferences, Categories, Appearance, Notifications |
| `/dashboard/transactions` | ⏳ | Full transaction list with filters (next phase) |
| `/dashboard/budgets` | 📋 | Budget tracking (Phase 2) |
| `/dashboard/analytics` | 📋 | Charts & reports (Phase 2) |
| `/dashboard/subscriptions` | 📋 | Subscription tracking (Phase 3) |

---

## Project structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx        Shared auth shell (logo, theme toggle, backdrop)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── auth/
│   │   └── callback/route.ts OAuth + email-confirm callback → session cookie
│   ├── dashboard/
│   │   ├── layout.tsx        Dashboard shell (soft backdrop + sticky DashboardNav)
│   │   ├── page.tsx          Home: greeting + glass date card + quick actions + summary + recent + category breakdown
│   │   ├── transactions/
│   │   │   └── page.tsx      Full transaction list (NOT YET BUILT)
│   │   ├── profile/
│   │   │   ├── page.tsx      User profile container (fetches user_metadata)
│   │   │   └── (actions)     Server actions for profile operations
│   │   │       ├── notifications-actions.ts
│   │   │       ├── preferences-actions.ts
│   │   │       └── categories-actions.ts
│   ├── actions/
│   │   └── transactions-actions.ts  addTransaction server action (whitelist validation, RLS-aware)
│   ├── globals.css           Tailwind v4 @theme + CSS variables + .glass-pill + density/font-scale overrides
│   ├── layout.tsx            Root layout (Inter font, ThemeProvider, DensityProvider)
│   └── page.tsx              Landing page
├── components/
│   ├── auth-card.tsx         Login + signup card
│   ├── dashboard-nav.tsx     Glass-pill navbar (ETM brand, 5 nav items, responsive hamburger)
│   ├── google-button.tsx     Google OAuth button
│   ├── theme-provider.tsx    next-themes wrapper
│   ├── theme-toggle.tsx      Dark/Light toggle with icon animation
│   ├── user-menu.tsx         User dropdown (email, profile link, sign out)
│   ├── density-provider.tsx  Appearance context (density, font scale, accent, reduced motion)
│   ├── appearance-panel.tsx  Accent colors (5 presets), density, font scale, motion toggle
│   ├── notifications-panel.tsx  6 notification toggles + frequency picker
│   ├── preferences-panel.tsx   Language, currency, timezone (placeholder)
│   ├── general-panel.tsx     User info (placeholder for avatar/name edit)
│   ├── categories-panel.tsx  Category CRUD with animated modal
│   ├── profile-shell.tsx     Profile sidebar nav + content switcher
│   ├── dashboard-actions.tsx Quick-actions section (Add Transaction + Import CSV placeholder) — owns modal + toast
│   ├── add-transaction-modal.tsx     Quick-add transaction modal wired to addTransaction server action
│   ├── dashboard-summary-cards.tsx       4 KPI cards (mock data — DB wiring pending)
│   ├── dashboard-recent-transactions.tsx Recent transactions list (mock — DB wiring pending)
│   └── dashboard-category-breakdown.tsx  Horizontal bars by category (mock — DB wiring pending)
├── lib/supabase/
│   ├── client.ts             Browser client (for Client Components)
│   ├── server.ts             Server client (for Server Components / Server Actions)
│   └── middleware.ts         Session-refresh helper
└── middleware.ts             Runs session refresh on every request
```

---

## Design system

All colors are CSS variables. Tweak them in [`src/app/globals.css`](src/app/globals.css):

```css
:root {            /* light */
  --purple: #8b5cf6;
  --orange: #f97316;
  /* ... */
}
.dark {            /* dark */
  --purple: #a78bfa;
  --orange: #fb923c;
  /* ... */
}
```

Tailwind utilities (`text-purple`, `bg-card`, `border-border`, etc.) are wired through `@theme inline` — no `tailwind.config.js` needed.

### Visual primitives

| Class | Effect |
|---|---|
| `.auth-backdrop` | Ambient radial purple/orange backdrop |
| `.card-glow` | Gradient border on hover / focus-within (CSS mask, no JS) |
| `.input-glow` | Purple focus glow on inputs |
| `.input-glow.alt` | Orange focus glow variant |
| `.glass-pill` | Liquid-glass surface (backdrop blur + saturate, hairline border, inner highlight) — used by the dashboard navbar |

### Accent gradient (use sparingly)

```css
background: linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%);
```

Reserved for **accent text and brand marks only** — the first name in the greeting, a single emphasized word in a heading, the big day number on the date card, the logo. **Never** used as a button fill or repeated surface decoration. Default CTAs are solid `bg-purple text-white hover:bg-purple/90`. One focal point per section.

### Appearance system (user-customizable)

Users can personalize the app via `/dashboard/profile` → Appearance section:

| Setting | Options | Storage |
|---|---|---|
| **Accent Color** | Aurora (purple+orange), Ocean (blue+cyan), Forest (green+amber), Sunset (rose+orange), Mono (slate) | CSS vars + `localStorage` |
| **Display Density** | Comfortable (spacious), Compact (tighter, more on screen) | `data-density` attribute |
| **Text Size** | Normal (16px base), Large (18px base) | `data-font-scale` attribute |
| **Reduce Motion** | On/Off | `data-reduced-motion` attribute |

All settings persist to `localStorage` (keys: `etm-density`, `etm-font-scale`, `etm-accent`, `etm-reduced-motion`) and are applied via `DensityProvider` React Context. CSS variable overrides in `globals.css` support dark mode and accent preset switching seamlessly.

---

## Database

Live tables in Supabase (Postgres). All financial tables enforce row-level security via `auth.uid() = user_id`.

### `public.transactions`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `user_id` | `uuid` FK → `auth.users(id)` | `ON DELETE CASCADE` |
| `type` | `text` | `CHECK (type IN ('expense', 'income'))` |
| `amount` | `numeric(12, 2)` | `CHECK (amount > 0)` — exact decimal money |
| `category` | `text` | Plain label, not an FK — renames don't mutate historical rows |
| `payment_mode` | `text` | `CHECK IN ('cash', 'card', 'upi', 'bank', 'other')` |
| `date` | `date` | Transaction date (not creation timestamp) |
| `note` | `text` nullable | Optional |
| `created_at` / `updated_at` | `timestamptz` | `updated_at` auto-maintained by `set_updated_at()` trigger |

Indexed on `(user_id, date DESC)`. RLS policies cover all four CRUD operations, each gated on `auth.uid() = user_id`. Validation runs twice — server action whitelists enums *and* the DB enforces CHECK constraints (defense in depth).

---

## Scripts

```powershell
npm run dev          # dev server
npm run build        # production build
npm start            # serve production build
npm run lint         # eslint
npx tsc --noEmit     # type-check
```

---

## Roadmap (3 phases)

**Phase 1: Dashboard MVP** (NOW)
- [x] Auth UI + backend (email/password + Google OAuth, session middleware)
- [x] Dashboard shell (responsive navbar, sign-out, ETM brand)
- [x] User profile system (General, Preferences, Categories, Appearance, Notifications sections)
- [x] Dashboard home UI — greeting + glass date card, quick-actions section, summary cards, recent transactions, category breakdown
- [x] Add Transaction — modal with validation, server action with whitelist + RLS, success toast, `transactions` table
- [ ] Row-level edit on Recent Transactions (same modal in `edit` mode) + delete with confirm
- [ ] CSV import (two-step modal: upload + auto-detect → column mapping → commit)
- [ ] Wire summary cards / recent / category breakdown to real DB aggregates
- [ ] Full `/dashboard/transactions` list with category + date-range + type filters

**Phase 2: Insights** (after MVP is stable)
- [ ] Spending charts (line over time, pie by category)
- [ ] Monthly/weekly reports
- [ ] Budget tracking (spend vs limit)
- [ ] Export (CSV)
- [ ] Analytics page

**Phase 3: Account & Compliance** (later)
- [ ] Privacy & Security section (data access, connected integrations)
- [ ] Danger zone (delete account, export all data)
- [ ] Billing page (plan, payment methods, invoices)
- [ ] Role-based access (shared accounts, read-only members)
- [ ] Subscriptions tracking

---

## License

Private — not for redistribution.
