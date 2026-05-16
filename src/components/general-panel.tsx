"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User2,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  ChevronDown,
  Check,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  X,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveProfileAction } from "@/app/actions/profile-actions";
import { CountrySelect } from "@/components/country-select";

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;


const MIN_PW = 8;

export type GeneralPanelProps = {
  email: string;
  provider: string;
  hasPassword: boolean;
  firstName: string;
  lastName: string;
  gender: string;
  country: string;
};

export function GeneralPanel({
  email,
  provider,
  hasPassword,
  firstName: initFirst,
  lastName: initLast,
  gender: initGender,
  country: initCountry,
}: GeneralPanelProps) {
  const isGoogle = provider === "google";

  // ── Profile section ────────────────────────────────────────────
  const [firstName, setFirstName] = React.useState(initFirst);
  const [lastName, setLastName] = React.useState(initLast);
  const [gender, setGender] = React.useState(initGender);
  const [country, setCountry] = React.useState(initCountry);
  const [profileBusy, setProfileBusy] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [profileDone, setProfileDone] = React.useState(false);

  const profileDirty =
    firstName.trim() !== initFirst ||
    lastName.trim() !== initLast ||
    gender !== initGender ||
    country !== initCountry;

  async function saveProfile() {
    setProfileError(null);
    if (!firstName.trim()) {
      setProfileError("First name is required.");
      return;
    }
    setProfileBusy(true);
    try {
      const result = await saveProfileAction({ firstName, lastName, gender, country });
      if (result.error) throw new Error(result.error);
      setProfileDone(true);
      setTimeout(() => {
        setProfileDone(false);
        window.location.reload();
      }, 800);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setProfileBusy(false);
    }
  }

  // ── Contact section ────────────────────────────────────────────
  const [emailDraft, setEmailDraft] = React.useState(email);
  const [emailBusy, setEmailBusy] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [emailSent, setEmailSent] = React.useState(false);

  async function updateEmail() {
    setEmailError(null);
    if (!emailDraft.trim() || emailDraft.trim() === email) return;
    setEmailBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: emailDraft.trim() });
      if (error) throw new Error(error.message);
      setEmailSent(true);
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : "Could not update email.");
    } finally {
      setEmailBusy(false);
    }
  }

  // ── Password modal ─────────────────────────────────────────────
  const [pwOpen, setPwOpen] = React.useState(false);
  const [pwCurrent, setPwCurrent] = React.useState("");
  const [pwNext, setPwNext] = React.useState("");
  const [pwConfirm, setPwConfirm] = React.useState("");
  const [pwShow, setPwShow] = React.useState(false);
  const [pwBusy, setPwBusy] = React.useState(false);
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [pwDone, setPwDone] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  function closePw() {
    if (pwBusy) return;
    setPwOpen(false);
    setPwCurrent("");
    setPwNext("");
    setPwConfirm("");
    setPwShow(false);
    setPwError(null);
    setPwDone(false);
  }

  async function changePassword() {
    setPwError(null);
    if (hasPassword && !pwCurrent) {
      setPwError("Enter your current password.");
      return;
    }
    if (pwNext.length < MIN_PW) {
      setPwError(`New password must be at least ${MIN_PW} characters.`);
      return;
    }
    if (hasPassword && pwNext === pwCurrent) {
      setPwError("New password must differ from current.");
      return;
    }
    if (pwNext !== pwConfirm) {
      setPwError("Passwords don't match.");
      return;
    }
    setPwBusy(true);
    try {
      const supabase = createClient();
      if (hasPassword) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password: pwCurrent,
        });
        if (signInErr) throw new Error("Current password is incorrect.");
      }
      const { error } = await supabase.auth.updateUser({ password: pwNext });
      if (error) throw new Error(error.message);
      setPwDone(true);
      setTimeout(() => {
        setPwOpen(false);
        setPwDone(false);
      }, 1400);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : "Could not update password.");
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">General</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, contact information, and account security.
        </p>
      </div>

      {/* ── Section 1: Profile ── */}
      <section className="card-glow rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 border-b border-border pb-4 text-sm font-semibold text-foreground">
          <User2 className="h-4 w-4 text-purple" />
          Profile
        </h2>

        <div className="mt-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="First name" htmlFor="gp-first-name">
              <input
                id="gp-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={48}
                disabled={profileBusy}
                placeholder="Jane"
                className="input-glow w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
              />
            </Field>
            <Field label="Last name" htmlFor="gp-last-name">
              <input
                id="gp-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={48}
                disabled={profileBusy}
                placeholder="Doe"
                className="input-glow w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
              />
            </Field>
          </div>

          <Field label="Gender" htmlFor="gp-gender">
            <div className="relative">
              <select
                id="gp-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={profileBusy}
                className="input-glow w-full cursor-pointer appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground focus:outline-none disabled:opacity-60"
              >
                <option value="">Prefer not to say</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </Field>

          <Field label="Country" htmlFor="gp-country">
            <CountrySelect
              id="gp-country"
              value={country}
              onChange={setCountry}
              disabled={profileBusy}
            />
          </Field>

          <AnimatePresence>
            {profileError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{profileError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-end gap-3 pt-1">
            <AnimatePresence>
              {profileDone && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 text-xs text-green-500"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved
                </motion.span>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={profileBusy || !profileDirty}
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              {profileBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Save changes
            </button>
          </div>
        </div>
      </section>

      {/* ── Section 2: Contact ── */}
      <section className="card-glow rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 border-b border-border pb-4 text-sm font-semibold text-foreground">
          <Mail className="h-4 w-4 text-purple" />
          Contact
        </h2>

        <div className="mt-5 flex flex-col gap-4">
          <Field label="Email address" htmlFor="gp-email">
            {isGoogle ? (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-sm text-foreground">{email}</span>
                <span className="shrink-0 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-500 ring-1 ring-inset ring-blue-500/20">
                  Managed by Google
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  id="gp-email"
                  type="email"
                  value={emailDraft}
                  onChange={(e) => {
                    setEmailDraft(e.target.value);
                    setEmailSent(false);
                    setEmailError(null);
                  }}
                  disabled={emailBusy || emailSent}
                  className="input-glow flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => void updateEmail()}
                  disabled={
                    emailBusy ||
                    emailSent ||
                    !emailDraft.trim() ||
                    emailDraft.trim() === email
                  }
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {emailBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Update
                </button>
              </div>
            )}
          </Field>

          {!isGoogle && !emailSent && (
            <p className="flex items-start gap-2 text-[12px] text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              A confirmation link will be sent to the new address. Your current login is
              unaffected until confirmed.
            </p>
          )}

          <AnimatePresence>
            {emailSent && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-500"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Confirmation sent to <strong>{emailDraft}</strong>. Check your inbox.
                </span>
              </motion.div>
            )}
            {emailError && (
              <motion.div
                key="email-err"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{emailError}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Section 3: Security ── */}
      <section className="card-glow rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 border-b border-border pb-4 text-sm font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-purple" />
          Security
        </h2>

        <div className="mt-5 flex flex-col gap-5">
          <SecurityRow icon={KeyRound} label="Sign-in method">
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                isGoogle
                  ? "bg-blue-500/10 text-blue-500 ring-blue-500/20"
                  : "bg-purple/10 text-purple ring-purple/20"
              }`}
            >
              {isGoogle ? "Google" : "Email & password"}
            </span>
          </SecurityRow>

          <SecurityRow icon={Lock} label="Password">
            <div className="flex items-center gap-3">
              {hasPassword ? (
                <span className="text-sm tracking-[0.3em] text-muted-foreground">
                  ••••••••
                </span>
              ) : (
                <span className="text-xs italic text-muted-foreground">Not set</span>
              )}
              <button
                type="button"
                onClick={() => setPwOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-purple/40 hover:bg-purple/10 hover:text-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {hasPassword ? "Change" : "Set password"}
              </button>
            </div>
          </SecurityRow>
        </div>
      </section>

      {/* Password modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {pwOpen && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={closePw}
              >
                <motion.div
                  className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.18 }}
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="gp-pw-title"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2
                      id="gp-pw-title"
                      className="flex items-center gap-2 text-base font-semibold text-foreground"
                    >
                      <Lock className="h-4 w-4 text-purple" />
                      {hasPassword ? "Change password" : "Set a password"}
                    </h2>
                    <button
                      type="button"
                      onClick={closePw}
                      disabled={pwBusy}
                      aria-label="Close"
                      className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {hasPassword
                      ? "Confirm your current password before setting a new one."
                      : "Add a password so you can sign in with email in addition to Google."}
                  </p>

                  {pwDone ? (
                    <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-3 text-sm text-green-500">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        {hasPassword ? "Password updated." : "Password set."}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="mt-5 flex flex-col gap-3">
                        {hasPassword && (
                          <div className="flex flex-col gap-1.5">
                            <label
                              htmlFor="gp-pw-current"
                              className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                            >
                              Current password
                            </label>
                            <input
                              id="gp-pw-current"
                              type={pwShow ? "text" : "password"}
                              value={pwCurrent}
                              onChange={(e) => setPwCurrent(e.target.value)}
                              autoFocus
                              autoComplete="current-password"
                              disabled={pwBusy}
                              className="input-glow w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none disabled:opacity-60"
                            />
                          </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="gp-pw-next"
                            className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                          >
                            New password
                          </label>
                          <div className="relative">
                            <input
                              id="gp-pw-next"
                              type={pwShow ? "text" : "password"}
                              value={pwNext}
                              onChange={(e) => setPwNext(e.target.value)}
                              autoFocus={!hasPassword}
                              autoComplete="new-password"
                              disabled={pwBusy}
                              className="input-glow w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground focus:outline-none disabled:opacity-60"
                            />
                            <button
                              type="button"
                              onClick={() => setPwShow((s) => !s)}
                              aria-label={pwShow ? "Hide passwords" : "Show passwords"}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
                            >
                              {pwShow ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            At least {MIN_PW} characters.
                          </p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="gp-pw-confirm"
                            className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                          >
                            Confirm new password
                          </label>
                          <input
                            id="gp-pw-confirm"
                            type={pwShow ? "text" : "password"}
                            value={pwConfirm}
                            onChange={(e) => setPwConfirm(e.target.value)}
                            autoComplete="new-password"
                            disabled={pwBusy}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void changePassword();
                            }}
                            className="input-glow w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none disabled:opacity-60"
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {pwError && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            role="alert"
                            className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500"
                          >
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{pwError}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-5 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={closePw}
                          disabled={pwBusy}
                          className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => void changePassword()}
                          disabled={pwBusy}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {pwBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          {hasPassword ? "Update password" : "Set password"}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SecurityRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
