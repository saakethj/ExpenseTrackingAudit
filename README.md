# ExpenseTracking Audit

A secure, multi-user financial dashboard with an audit-grade aesthetic — dark-first, purple + orange gradient accents, built on Next.js 15 and Tailwind CSS v4.

> **Status:** Auth ✅ | Dashboard shell ✅ | User profile (5/7 sections) ✅ | Appearance system ✅ | Dashboard home UI ✅ | Add / Edit / Delete Transaction (modal + server actions + RLS) ✅ | Recent Transactions (live DB) ✅ | Summary cards + Category breakdown (live DB aggregates) ✅ | CSV/XLSX import (two-step modal: upload + auto-detect → column mapping → commit) ✅ | All-time Balance card + Cash flow breakdown ✅ | Danger Zone: delete by import batch + delete by date range ✅ | Analytics hub with insight cards + 4 interactive charts ✅
>
> **Next:** Full `/dashboard/transactions` list with filters (category, date range, type)

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
| Charts | `recharts` (React-native, SSR-safe, CSS-var aware) |
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
| `/dashboard` | ✅ | Greeting + glass date card, "Manage your money" quick actions, live summary cards (Net / Spent / Income / Savings rate with month-over-month deltas), live Recent Transactions list with row-level edit + delete, live category breakdown (top 5 + "Other"). Add / Edit / Delete all write live to Supabase. |
| `/dashboard/profile` | ✅ | User profile with 5 working sections: General, Preferences, Categories, Appearance, Notifications. Danger Zone: delete transactions by import batch or date range (this month / last 6 months / all). |
| `/dashboard/analytics` | ✅ | Interactive analytics hub: gradient page header with inline segmented time-range filter (30D / 3M / 6M / 1Y / All), 4 insight cards (Avg daily spend, Top category, Biggest expense, vs prior period — or Active days when range = All), and 4 charts (income vs expense bars, category donut, cumulative spend area, payment mode donut). Client-side aggregation, all colors via CSS vars. |
| `/dashboard/transactions` | ⏳ | Full transaction list with filters (next phase) |
| `/dashboard/budgets` | 📋 | Budget tracking (Phase 2) |
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
│   │   ├── analytics/
│   │   │   └── page.tsx      Analytics hub with time-range filters + 4 interactive charts (Recharts)
│   │   ├── transactions/
│   │   │   └── page.tsx      Full transaction list (NOT YET BUILT)
│   │   ├── profile/
│   │   │   ├── page.tsx      User profile container (fetches user_metadata)
│   │   │   └── (actions)     Server actions for profile operations
│   │   │       ├── notifications-actions.ts
│   │   │       ├── preferences-actions.ts
│   │   │       └── categories-actions.ts
│   ├── actions/
│   │   └── transactions-actions.ts  addTransaction / updateTransaction / deleteTransaction / listRecentTransactions / importTransactions / getMonthlySummary / listImportBatches / deleteImportBatch / deleteTransactionsByFilter / getAllTransactionsRaw. All whitelist validation, RLS-gated, user_id-scoped WHERE clauses for defense-in-depth. `importTransactions` accepts a `filename` parameter, creates an `import_batches` record, and tags every inserted row with `import_batch_id`. `deleteImportBatch` cascades — deletes the batch record and all linked transactions in one query. `getMonthlySummary` returns current + previous month stats plus all-time balance and metadata. `getAllTransactionsRaw` returns all transactions (type, amount, category, payment_mode, date) for analytics client-side aggregation.
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
│   ├── dashboard-actions.tsx Quick-actions section (Add Transaction + Import Statement buttons) — owns both modals + shared toast
│   ├── add-transaction-modal.tsx     Shared modal: `mode: "create" | "edit"` with optional `initialValues` + `transactionId`. Portaled to `document.body` so it overlays the entire viewport; trash icon → inline confirm → delete
│   ├── import-modal.tsx              Two-step import modal: Step 1 file upload (CSV/XLSX, auto-detects headers via regex scan), column mapping with auto-detect; Step 2 row review with checkboxes, inline category dropdowns, bulk-assign, type toggle. Portaled. Calls `importTransactions(rows, fileName)` — passes the file's original name so it can be tracked as an import batch.
│   ├── danger-zone-panel.tsx         Danger Zone UI with two sections: "Delete by import" — lists every import batch (filename, date, transaction count) in a scrollable container, per-batch delete with confirmation modal, optimistic list update on success; "Delete by date" — time-range bulk deletes (this month / last 6 months / all transactions). Each section has its own confirmation modal and error/success feedback.
│   ├── dashboard-summary-cards.tsx   Hero balance card (all-time income − spend, gradient text when positive, rose text when negative, smart subtitle) + 4 monthly KPI cards (Cash flow / Spent / Income / Savings rate) fed by `getMonthlySummary` — real values, signed, month-over-month deltas (% for amounts, pp for savings rate), `—` when no prior-month data
│   ├── dashboard-recent-transactions.tsx Server: fetches last 5 rows via `listRecentTransactions`, renders the shell + empty state
│   ├── dashboard-recent-transactions-list.tsx Client: clickable rows with always-visible pencil icon, opens edit modal, save/delete toast
│   ├── dashboard-category-breakdown.tsx  Horizontal bars by category — top 5 + "Other" rollup, icon fallback to Receipt, empty state when no expenses
│   ├── analytics-shell.tsx    Client: owns filter state (30d | 3m | 6m | 12m | all) + all aggregation logic. Fetches `RawTransaction[]` on mount, memoizes monthly breakdown, category breakdown, payment modes, daily cumulative spend, and an `insights` object (avg daily spend, top category, biggest expense, prior-period delta, active days).
│   ├── analytics-filter-bar.tsx  Compact segmented control (30D | 3M | 6M | 1Y | All) sits inline with the page header. Active pill = `bg-purple text-white`, inactive = muted.
│   ├── analytics-kpi-strip.tsx   4 **insight** cards (not duplicates of dashboard summary): Avg daily spend, Top category, Biggest expense, and vs prior period (becomes Active days when range = All). Each card has a label, accent icon chip, large value, and one-line hint. Same `card-glow` pattern.
│   ├── analytics-trend-chart.tsx Recharts `BarChart` — monthly income (purple) vs expense (orange) bars. Uses `maxBarSize` + `barCategoryGap` so single-month ranges render proportional bars (not full-width slabs). Compact ₹ Y-axis (`₹1.2L`/`₹80k`), month-name X-axis (`May 26`), custom tooltip themed to `bg-card`, inline legend in card header.
│   ├── analytics-category-chart.tsx Recharts `PieChart` (donut, 180×180). Center label shows total spent (or hovered slice + %). Below: ranked list with category name, amount, and %. Hover on a slice or list row dims the rest.
│   ├── analytics-payment-chart.tsx Recharts `PieChart` (donut). 5 fixed segments (Cash / Card / UPI / Bank / Other). Center label shows total tx count (or hovered mode + %). 2-column legend below with percentages.
│   └── analytics-spend-trend.tsx  Recharts `AreaChart` — cumulative daily spend with gradient fill (`var(--purple)`). Readable date labels (`May 12`), capped tick density (~6 ticks max via `interval` calc), compact Y-axis, "Period total" pinned in card header.
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

The `import_batch_id` column (`uuid`, nullable, FK → `import_batches(id) ON DELETE CASCADE`) is set on every transaction inserted via `importTransactions`. Manually-added transactions have `null` here.

### `public.import_batches`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `user_id` | `uuid` FK → `auth.users(id)` | `ON DELETE CASCADE` |
| `filename` | `text` | Original name of the uploaded file |
| `transaction_count` | `int` | Row count at import time |
| `created_at` | `timestamptz` | `default now()` |

- **Index:** `idx_import_batches_user` on `(user_id, created_at DESC)`
- **RLS:** 3 policies — `users_select_own`, `users_insert_own`, `users_delete_own`
- **Cascade:** deleting a batch row auto-deletes all linked transactions via the FK cascade on `transactions.import_batch_id`
- **Migration:** `supabase/migrations/20260516_add_import_batches.sql` — must be run manually in Supabase SQL Editor

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

**Phase 1: Dashboard MVP** (COMPLETE)
- [x] Auth UI + backend (email/password + Google OAuth, session middleware)
- [x] Dashboard shell (responsive navbar, sign-out, ETM brand)
- [x] User profile system (General, Preferences, Categories, Appearance, Notifications sections)
- [x] Dashboard home UI — greeting + glass date card, quick-actions section, summary cards, recent transactions, category breakdown
- [x] Add Transaction — modal with validation, server action with whitelist + RLS, success toast, `transactions` table
- [x] Recent Transactions wired to live DB rows (last 5, ordered by date)
- [x] Row-level edit + delete on Recent Transactions — same modal in `edit` mode, inline delete confirm, RLS + user_id-scoped server actions
- [x] Summary cards + category breakdown wired to real DB aggregates via `getMonthlySummary` (single query, month-over-month deltas)
- [x] CSV/XLSX import (two-step modal: upload + auto-detect columns → column mapping → row review + categorize → commit). Supports bank formats with metadata preamble, auto-detects headers, keyword-based category suggestions, batch insert via server action with RLS. Each import creates an `import_batches` record and tags transactions with `import_batch_id`.
- [x] All-time Balance card (hero section showing total income − spend across all transactions, with smart subtitle for edge cases). Renamed "Net this month" → "Cash flow" to clarify it's a flow, not net worth
- [x] Danger Zone — "Delete by import": lists all import batches (filename, date, count), per-batch delete with confirmation, optimistic list removal. "Delete by date": this month / last 6 months / all transactions.
- [x] Analytics hub — `/dashboard/analytics` with gradient page header, inline segmented time-range filter (30D | 3M | 6M | 1Y | All), 4 **insight** cards (Avg daily spend, Top category, Biggest expense, vs prior period / Active days), and 4 charts (income vs expense bars, category donut with center label, cumulative spend area, payment mode donut). Built with Recharts, client-side aggregation, theme + accent-color aware via CSS vars.
- [ ] Full `/dashboard/transactions` list with category + date-range + type filters

**Phase 2: Insights & Optimization** (after MVP is stable)
- [ ] Weekly/monthly summary reports
- [ ] Budget tracking (spend vs limit)
- [ ] Export to CSV
- [ ] Additional dashboards (top merchants, recurring transactions)

**Phase 3: Account & Compliance** (later)
- [ ] Privacy & Security section (data access, connected integrations)
- [ ] Danger zone (delete account, export all data)
- [ ] Billing page (plan, payment methods, invoices)
- [ ] Role-based access (shared accounts, read-only members)
- [ ] Subscriptions tracking

---

## License

Private — not for redistribution.
