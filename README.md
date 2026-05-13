# ExpenseTracking Audit

A secure, multi-user financial dashboard with an audit-grade aesthetic — dark-first, purple + orange gradient accents, built on Next.js 15 and Tailwind CSS v4.

> **Status:** UI scaffold only. Auth pages are visual; no backend wired yet.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 (CSS-variable theming, `@theme inline`) |
| Theming | `next-themes` (light / dark / system) |
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

### Routes

| Path | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in (Google + manual email/password — UI only) |
| `/signup` | Create account (UI only) |

---

## Project structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx        Shared auth shell
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── globals.css           Tailwind v4 @theme + CSS variables
│   ├── layout.tsx            Root layout + ThemeProvider
│   └── page.tsx              Landing
└── components/
    ├── auth-card.tsx         Login + signup card (mode prop)
    ├── google-button.tsx
    ├── theme-provider.tsx
    └── theme-toggle.tsx
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
- [ ] Auth backend (provider TBD — NextAuth or Supabase)
- [ ] Dashboard shell (sidebar, top bar)
- [ ] Expense entry + audit log
- [ ] Multi-user roles & permissions

---

## License

Private — not for redistribution.
