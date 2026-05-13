# ExpenseTracking Audit

A secure, multi-user financial dashboard with an audit-grade aesthetic — dark-first, purple + orange gradient accents, built on Next.js 15 and Tailwind CSS v4.

> **Status:** Auth complete (email/password + Google via Supabase). Dashboard shell live — glass-pill navbar with responsive hamburger, placeholder pages pending.

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

| Path | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in (Google + manual email/password) |
| `/signup` | Create account (Google + manual email/password, confirmation required) |
| `/auth/callback` | OAuth + email-confirm code exchange (no UI) |
| `/dashboard` | Authenticated landing page (Welcome) |
| `/dashboard/transactions` | Placeholder — not yet built |
| `/dashboard/budgets` | Placeholder — not yet built |
| `/dashboard/analytics` | Placeholder — not yet built |
| `/dashboard/subscriptions` | Placeholder — not yet built |

---

## Project structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx        Shared auth shell
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── auth/
│   │   └── callback/route.ts OAuth + email-confirm callback
│   ├── dashboard/
│   │   ├── layout.tsx        Dashboard shell (backdrop + sticky nav)
│   │   └── page.tsx          Welcome
│   ├── globals.css           Tailwind v4 @theme + CSS variables + .glass-pill
│   ├── layout.tsx            Root layout + ThemeProvider
│   └── page.tsx              Landing
├── components/
│   ├── auth-card.tsx         Login + signup card (mode prop)
│   ├── dashboard-nav.tsx     Responsive glass-pill navbar (5 items + hamburger)
│   ├── google-button.tsx     Google OAuth (wired)
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── user-menu.tsx         User icon dropdown (signed-in email, profile, sign out)
├── lib/supabase/
│   ├── client.ts             Browser client
│   ├── server.ts             Server client
│   └── middleware.ts         Session-refresh helper
└── middleware.ts             Runs the helper on every request
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

### Primary CTA gradient

```css
background: linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%);
```

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

## Roadmap

- [x] Auth UI (login + signup, Google button, dark/light toggle)
- [x] Auth backend (Supabase — email/password with confirmation, Google OAuth, session middleware)
- [x] Dashboard shell (responsive glass-pill navbar, sign-out, ETM brand mark)
- [ ] Transactions, Budgets, Analytics, Subscriptions pages
- [ ] Profile page + user-menu redesign
- [ ] Security hardening (see [`things_tbd_later.md`](things_tbd_later.md))
- [ ] Multi-user roles & permissions

---

## License

Private — not for redistribution.
