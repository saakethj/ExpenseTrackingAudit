@AGENTS.md

# ExpenseTracking Audit — Project Guide

A secure, multi-user financial dashboard. Design and security are first-class.

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript, `src/` dir, alias `@/*`)
- **Styling:** Tailwind CSS v4 — config lives in CSS via `@theme inline` and CSS variables. **No `tailwind.config.js`.**
- **Theme:** `next-themes` with `attribute="class"`, `defaultTheme="dark"`, `enableSystem`. Toggle is `<ThemeToggle />`.
- **Icons:** `lucide-react`
- **Animation:** `framer-motion` — micro-interactions only (hover lift, tap scale, icon swap, card mount). No layout animations.

## Design system (do not drift without asking)

- Dark-first, purple + orange gradient accents. Light parity is required.
- All colors are CSS variables defined in [src/app/globals.css](src/app/globals.css) under `:root` (light) and `.dark` (dark).
- Tailwind utilities map to those vars via `@theme inline`: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `text-purple`, `text-orange`, `ring-ring`, etc.
- Primary CTAs and brand marks use the gradient: `linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)`.
- Reusable visual primitives in `globals.css`:
  - `.auth-backdrop` — ambient radial purple/orange backdrop for auth-style screens
  - `.card-glow` — gradient border that appears on hover/focus-within (pure CSS mask)
  - `.input-glow` (`.input-glow.alt` for orange) — focus glow on form inputs

## File layout

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx        Shared auth shell (logo header, theme toggle, backdrop)
│   │   ├── login/page.tsx    /login
│   │   └── signup/page.tsx   /signup
│   ├── globals.css           Tailwind v4 @theme + CSS vars + glow utilities
│   ├── layout.tsx            Root: Inter font + ThemeProvider
│   └── page.tsx              Landing page
└── components/
    ├── auth-card.tsx         Login + signup card (single component, `mode` prop)
    ├── google-button.tsx     Google OAuth button (UI only — no backend yet)
    ├── theme-provider.tsx    next-themes wrapper
    └── theme-toggle.tsx      Sun/Moon toggle with motion icon swap
```

## Conventions

- **Server vs client:** Pages stay server components when possible; interactive pieces (`AuthCard`, `ThemeToggle`, `GoogleButton`) are `"use client"`.
- **Forms:** UI-only right now. Backend auth has not been wired — do not invent backend logic without asking.
- **Adding pages with the auth aesthetic:** drop them under `src/app/(auth)/` to inherit the shell, or replicate the `auth-backdrop` + `card-glow` pattern.
- **Adding accent colors:** don't. Extend `--purple` / `--orange` or add a new CSS var in both `:root` and `.dark`, then expose it through `@theme inline`.
- **Accessibility:** Respect `prefers-reduced-motion` (already short-circuited in `globals.css`). All interactive elements must have visible focus states (use `focus-visible:ring-2 focus-visible:ring-ring`).

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
