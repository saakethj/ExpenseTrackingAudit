# Things TBD Later

Parked items we'll come back to after the core app is built. Not forgotten — just sequenced.

---

## Security hardening

Current auth flow works end-to-end (email/password + Google OAuth, email confirmation, session middleware). What's missing is the *hardening* layer. Tackle section by section, page by page.

### Priority order

1. **Route protection in middleware**
   - Currently `src/middleware.ts` refreshes the session but doesn't gate anything.
   - Add: redirect unauthenticated users away from protected routes (`/dashboard/*`, etc.) → `/login`.
   - Add: redirect authenticated users away from `/login` and `/signup` → `/` (or dashboard).
   - Pure frontend work, no Supabase dashboard steps.

2. **Security headers** (`next.config.ts` → `headers()`)
   - `Content-Security-Policy` — lock down script/style/connect sources.
   - `Strict-Transport-Security` — HSTS, force HTTPS.
   - `X-Frame-Options: DENY` — block clickjacking.
   - `Referrer-Policy: strict-origin-when-cross-origin`.
   - `Permissions-Policy` — explicitly deny camera, microphone, geolocation, USB, etc. (we don't use them; keep it that way).
   - `X-Content-Type-Options: nosniff`.

3. **Password policy**
   - Bump `minLength` from 6 → 10 or 12 in [src/components/auth-card.tsx](src/components/auth-card.tsx).
   - Enable Supabase Dashboard → Authentication → Policies → "Check passwords against HaveIBeenPwned" toggle.
   - Consider requiring a mix (letter + number + symbol) client-side with clear feedback.

4. **RLS (Row-Level Security) — non-negotiable before first data table**
   - The moment we create the `expenses` table (or any user-owned data table), enable RLS *immediately*.
   - Policy template: `user_id = auth.uid()` on SELECT / INSERT / UPDATE / DELETE.
   - No table goes live without RLS on. This is the single biggest protection against a leak.

5. **Forgot password flow**
   - Currently the "Forgot password?" link in [auth-card.tsx](src/components/auth-card.tsx) is `href="#"` — dead.
   - Wire `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/reset' })`.
   - Build `/auth/reset` page that calls `supabase.auth.updateUser({ password })`.

6. **CAPTCHA on signup**
   - Stops automated signups draining email-send quota and polluting the user table.
   - Supabase supports hCaptcha and Cloudflare Turnstile natively (Dashboard → Authentication → Settings → Captcha protection).
   - Add the widget to the signup form, pass token in `signUp({ options: { captchaToken } })`.

7. **MFA / 2FA (TOTP)**
   - Supabase supports it via `supabase.auth.mfa.*`.
   - Enable after the dashboard exists so users have a settings page to manage enrolled factors.

8. **Email enumeration on signup**
   - Supabase's `signUp` response differs when email already exists — leaks membership.
   - Mitigation: always show the "Check your email" success card regardless of whether the email was new or existing. Supabase will silently no-op the duplicate.

9. **Audit log surfacing**
   - Supabase logs auth events server-side. We don't surface them yet.
   - Eventually: per-user "Recent sign-ins" view + email alert on new device/location.

10. **Inactivity auto-logout**
    - Deferred during test phase (user is logging in/out repeatedly with own emails — no alerts wanted right now).
    - Later: idle-timeout watcher (e.g., 15–30 min no activity) → `supabase.auth.signOut()` + redirect to `/login?reason=idle`.
    - Pair with a soft warning modal ~1 min before forced logout.
    - Major concern once real financial data is in the DB.

---

## Working agreement

- Test phase: using personal email + a secondary email for the two-user test scenarios. No real PII in the DB yet, so deferral is safe.
- Tackle security hardening **section by section, page by page** — not a big bang.
- Each section gets its own small PR/commit so it's easy to review and roll back.
