# Testing Findings & Updates Needed

**Date Started:** 2026-05-17

This file tracks issues, bugs, and needed updates discovered during Auth QA testing.
Add items as you find them — we'll prioritize and develop later.

---

## Format

```
### [TITLE] — [PRIORITY: P1/P2/P3]

**Where:** File path or page
**What:** Description of the issue
**Status:** [ ] Found [ ] Confirmed [ ] Fixed
**Notes:** Any additional context
```

---

## Issues Found
### Create account section (sign up) - P2
* Email confirmation needs to be checked
* The confirmation is getting via email but when the link is clicked it's showing new login page instead of re routing to opened session

### Create account section (sign up) - P3

**Few Changes**
* Need forget password functionality
* When it' not a valid gmail address it must throw error in the form itself like live error becaue it's no use if I enter random email and it show waiting for confirmation
* Instead of full name, first name and last name must be added these must be updated in userprofile section

### Login page - Google Auth

1. Once the sign up google is clicked it is showng some random words.supabase.co beside that it is showing email addres this is fine
2. Is the common or can we change that to give my website or anything other than random link

### Login page - "Remember Me" checkbox - P2
**Where:** Login form, checkbox before sign-in button
**What:** The "Remember me" checkbox is purely decorative with zero effect on session duration
**Status:** [x] Found [x] Confirmed [ ] Fixed
**Notes:** Both sessions expire at identical timestamps regardless of checkbox state. Checkbox state is not stored or validated. This is a low-priority cosmetic bug (user can still sign in, just not additional functionality).

### Login page - "Forgot Password?" link - P2
**Where:** Login form, below password field
**What:** The "Forgot password?" link is non-functional — it is `href="#"` (dead link). No password reset flow exists.
**Status:** [x] Found [x] Confirmed [ ] Fixed
**Notes:** Clicking the link does nothing. User has no way to reset forgotten passwords currently.


### Logo - Landing, signup, login page - p3
**Notes** - I have logo but it's not the correct size, I need exact dimensions so that I can create it 
this needs to go in landing page, login & signup page

### Session — No Automatic Timeout - P3
**Where:** All authenticated pages (`/dashboard/*`)
**What:** Session persists indefinitely — closing the browser and reopening still keeps the user logged in with no expiry. For a financial app, an inactivity timeout (e.g., 30 minutes idle → auto-logout) is expected.
**Status:** [x] Found [ ] Confirmed [ ] Fixed
**Notes:** Supabase sessions have a long expiry by default (~1 year for persistent sessions). Implement idle detection on the client side — after X minutes of no interaction, call `supabase.auth.signOut()` and redirect to `/login`. This is a backlog item, not a blocker.


