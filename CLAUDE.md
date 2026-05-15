@AGENTS.md

# ExpenseTracking Audit — Project Guide

A secure, multi-user financial dashboard. Design and security are first-class.

## Status

**✅ Complete:** Auth (email/password + Google OAuth), Dashboard shell, User profile system
- Profile sections: General, Preferences, Categories, Appearance, Notifications — all functional
- Appearance system: density (comfortable/compact), font scale (normal/large), accent colors (5 presets), reduced motion toggle

**⏳ Next:** Dashboard core (transaction list, quick-add form, summary cards)

**📋 Later:** Charts, Import/Export, Billing, advanced user settings, role-based permissions

## Roadmap (3 phases)

**Phase 1: Dashboard MVP** (NOW)
- Transaction list view (date, category, amount, note)
- Quick-add transaction form
- Summary cards (income, expenses, net, by-category)
- Category filter + date range picker

**Phase 2: Insights**
- Spending charts (line graph over time, pie by category)
- Monthly/weekly summary reports
- Budget tracking (spend vs limit)
- Import/Export (CSV)

**Phase 3: Account & Compliance** (later, when MVP is stable)
- Privacy & Security (data access, connected integrations)
- Danger zone (delete account, export all data)
- Billing (plan, payment methods, invoices)
- Role-based access (shared accounts, read-only members)

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript, `src/` dir, alias `@/*`)
- **Styling:** Tailwind CSS v4 — config lives in CSS via `@theme inline` and CSS variables. **No `tailwind.config.js`.**
- **Theme:** `next-themes` with `attribute="class"`, `defaultTheme="dark"`, `enableSystem`. Toggle is `<ThemeToggle />`.
- **Icons:** `lucide-react`
- **Animation:** `framer-motion` — micro-interactions only (hover lift, tap scale, icon swap, card mount). No layout animations.
- **Auth & DB:** Supabase (`@supabase/ssr` + `@supabase/supabase-js`). Email/password (confirmation required) + Google OAuth.

## Design system (do not drift without asking)

- Dark-first, purple + orange gradient accents. Light parity is required.
- All colors are CSS variables defined in [src/app/globals.css](src/app/globals.css) under `:root` (light) and `.dark` (dark).
- Tailwind utilities map to those vars via `@theme inline`: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `text-purple`, `text-orange`, `ring-ring`, etc.
- Primary CTAs and brand marks use the gradient: `linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)`.
- Reusable visual primitives in `globals.css`:
  - `.auth-backdrop` — ambient radial purple/orange backdrop for auth-style screens
  - `.card-glow` — gradient border that appears on hover/focus-within (pure CSS mask)
  - `.input-glow` (`.input-glow.alt` for orange) — focus glow on form inputs
  - `.glass-pill` — liquid-glass surface (backdrop blur + saturate, hairline border, inner highlight, soft drop shadow). Tuned separately for light and dark. Used by the dashboard navbar.

## File layout

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx        Shared auth shell (logo header, theme toggle, backdrop)
│   │   ├── login/page.tsx    /login
│   │   └── signup/page.tsx   /signup
│   ├── auth/
│   │   └── callback/route.ts OAuth + email-confirm code exchange → session cookie (default redirect → /dashboard)
│   ├── dashboard/
│   │   ├── layout.tsx        Dashboard shell (soft radial backdrop + sticky DashboardNav)
│   │   ├── page.tsx          Welcome/home (will show summary + recent transactions)
│   │   ├── transactions/
│   │   │   └── page.tsx      Transaction list (NOT YET BUILT)
│   │   ├── profile/
│   │   │   └── page.tsx      User profile (fetches prefs from auth.user.user_metadata)
│   │   └── actions/
│   │       ├── notifications-actions.ts  Save notification prefs to user_metadata
│   │       ├── preferences-actions.ts    Save language + currency preferences
│   │       └── categories-actions.ts     CRUD operations on categories table
│   ├── globals.css           Tailwind v4 @theme + CSS vars + glow utilities + .glass-pill + density/font-scale/accent overrides
│   ├── layout.tsx            Root: Inter font + ThemeProvider + DensityProvider
│   └── page.tsx              Landing page
├── components/
│   ├── auth-card.tsx         Login + signup card (single component, `mode` prop). Login redirects to /dashboard.
│   ├── dashboard-nav.tsx     Responsive glass-pill navbar — ETM brand, 5 items, hamburger below md
│   ├── google-button.tsx     Google OAuth button (wired to supabase.auth.signInWithOAuth)
│   ├── theme-provider.tsx    next-themes wrapper
│   ├── theme-toggle.tsx      Sun/Moon toggle with motion icon swap
│   ├── user-menu.tsx         User-icon dropdown — signed-in email, profile, sign-out
│   ├── density-provider.tsx  Appearance context (density, font scale, accent, reduced motion)
│   ├── appearance-panel.tsx  Appearance settings (accent color, density, font scale, motion toggle)
│   ├── notifications-panel.tsx  Notification preferences (6 toggles + frequency picker)
│   ├── preferences-panel.tsx   Language, currency, timezone (placeholder)
│   ├── general-panel.tsx     User name, avatar (placeholder)
│   ├── categories-panel.tsx  Category CRUD with modal (create, edit, delete)
│   └── profile-shell.tsx     Profile sidebar nav + content area switcher
├── lib/
│   └── supabase/
│       ├── client.ts         Browser client (Client Components)
│       ├── server.ts         Server client (Server Components / Route Handlers)
│       └── middleware.ts     Session-refresh helper used by src/middleware.ts
└── middleware.ts             Refreshes Supabase session cookie on every request
```

## Conventions

- **Server vs client:** Pages stay server components when possible; interactive pieces (`AuthCard`, `ThemeToggle`, `GoogleButton`) are `"use client"`.
- **Supabase clients:** never import `client.ts` from a Server Component or `server.ts` from a Client Component. Browser → `@/lib/supabase/client`. Server / Route Handlers / Server Actions → `@/lib/supabase/server`.
- **Middleware rule:** in [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts), do not insert code between `createServerClient(...)` and `supabase.auth.getUser()` — it breaks session refresh in subtle ways.
- **Env vars:** only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` belong in the browser. The `service_role` key must never appear in any `NEXT_PUBLIC_*` var or client-imported file.
- **Auth redirects:** OAuth + email-confirm links route through `/auth/callback`. If you change that path, update the allow-list in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.
- **Adding pages with the auth aesthetic:** drop them under `src/app/(auth)/` to inherit the shell, or replicate the `auth-backdrop` + `card-glow` pattern.
- **Adding accent colors:** don't. Extend `--purple` / `--orange` or add a new CSS var in both `:root` and `.dark`, then expose it through `@theme inline`.
- **Accessibility:** Respect `prefers-reduced-motion` (already short-circuited in `globals.css`). All interactive elements must have visible focus states (use `focus-visible:ring-2 focus-visible:ring-ring`).
- **Responsive-first:** Every component must work on mobile (~375px), tablet (~768px), and desktop (~1280px+) from v1 — not retrofitted later. Default to a mobile layout and progressively enhance with `md:` / `lg:` breakpoints.
- **Nav active/hover pattern:** active link = `bg-muted` pill with `text-foreground`. Inactive link = `text-muted-foreground` with a 2px `bg-purple` underline that scales from `origin-left` on hover (300ms ease-out). Single accent only — no rainbow/gradient hover effects.
- **Post-auth pages:** drop under `src/app/dashboard/` to inherit the shell ([dashboard/layout.tsx](src/app/dashboard/layout.tsx) — soft backdrop + `DashboardNav`).

## Working style with the user

- Database/auth/infra steps: deliver in small, verifiable chunks — one step at a time, not a wall.
- Frontend/UI changes: full implementation is fine.
- Don't add backend logic, env vars, or third-party services without confirming first.

## Commands

```powershell
npm run dev     # start dev server
npm run build   # production build
npm run lint    # eslint
npx tsc --noEmit  # type-check only
```
