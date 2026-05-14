"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User2,
  Mail,
  Lock,
  Pencil,
  Check,
  X,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  displayName: string;
  email: string;
  hasPassword: boolean;
};

const MIN_PASSWORD_LENGTH = 8;

export function AccountPanel({
  displayName: initialName,
  email,
  hasPassword,
}: Props) {
  const router = useRouter();
  const [name, setName] = React.useState(initialName);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(initialName);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  function closePwModal() {
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
    if (pwNext.length < MIN_PASSWORD_LENGTH) {
      setPwError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (hasPassword && pwNext === pwCurrent) {
      setPwError("New password must be different from current password.");
      return;
    }
    if (pwNext !== pwConfirm) {
      setPwError("New password and confirmation do not match.");
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
        if (signInErr) {
          throw new Error("Current password is incorrect.");
        }
      }
      const { error: updErr } = await supabase.auth.updateUser({
        password: pwNext,
      });
      if (updErr) throw new Error(updErr.message);
      setPwDone(true);
      setPwCurrent("");
      setPwNext("");
      setPwConfirm("");
      setTimeout(() => {
        setPwOpen(false);
        setPwDone(false);
        router.refresh();
      }, 1400);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : "Could not update password.");
    } finally {
      setPwBusy(false);
    }
  }

  React.useEffect(() => {
    setName(initialName);
  }, [initialName]);

  function startEdit() {
    setDraft(name);
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(name);
    setError(null);
    setEditing(false);
  }

  async function saveEdit() {
    const next = draft.trim();
    if (!next || next === name) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: updErr } = await supabase.auth.updateUser({
        data: { full_name: next },
      });
      if (updErr) throw new Error(updErr.message);
      setName(next);
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update name.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-glow rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 border-b border-border pb-4 text-base font-semibold text-foreground">
        <User2 className="h-4 w-4 text-purple" />
        Account
      </h2>

      <div className="mt-5 flex flex-col gap-5">
        {/* Display name */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Display name
          </label>

          <AnimatePresence mode="wait" initial={false}>
            {editing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                  maxLength={48}
                  className="w-full flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Your name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                />
                <div className="flex gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    aria-label="Cancel"
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 sm:flex-none"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveEdit()}
                    disabled={saving || !draft.trim() || draft.trim() === name}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Save</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between gap-3"
              >
                <span className="truncate text-sm text-foreground">{name}</span>
                <button
                  type="button"
                  onClick={startEdit}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-purple/40 hover:bg-purple/10 hover:text-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Pencil className="h-3 w-3" />
                  <span>Edit</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Email (read-only) */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Email
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm text-foreground">{email}</span>
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Password
          </label>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              {hasPassword ? (
                <span className="text-sm tracking-[0.3em] text-foreground">
                  ••••••••
                </span>
              ) : (
                <span className="text-sm italic text-muted-foreground">
                  Not set · sign in via Google
                </span>
              )}
            </div>
            <motion.button
              type="button"
              onClick={() => setPwOpen(true)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-purple/40 hover:bg-purple/10 hover:text-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>{hasPassword ? "Change" : "Set password"}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {pwOpen && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closePwModal}
            onKeyDown={(e) => {
              if (e.key === "Escape") closePwModal();
            }}
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
              aria-labelledby="change-password-title"
            >
              <h2
                id="change-password-title"
                className="flex items-center gap-2 text-base font-semibold text-foreground"
              >
                <Lock className="h-4 w-4 text-purple" />
                {hasPassword ? "Change password" : "Set a password"}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {hasPassword
                  ? "For your security, confirm your current password before setting a new one."
                  : "Add a password so you can sign in with email in addition to Google."}
              </p>

              {pwDone ? (
                <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-3 text-sm text-green-500">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    {hasPassword
                      ? "Password updated successfully."
                      : "Password set successfully."}
                  </span>
                </div>
              ) : (
                <>
                  <div className="mt-5 flex flex-col gap-3">
                    {hasPassword && (
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="pw-current"
                          className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                        >
                          Current password
                        </label>
                        <input
                          id="pw-current"
                          type={pwShow ? "text" : "password"}
                          value={pwCurrent}
                          onChange={(e) => setPwCurrent(e.target.value)}
                          autoFocus
                          autoComplete="current-password"
                          disabled={pwBusy}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="pw-next"
                        className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        New password
                      </label>
                      <div className="relative">
                        <input
                          id="pw-next"
                          type={pwShow ? "text" : "password"}
                          value={pwNext}
                          onChange={(e) => setPwNext(e.target.value)}
                          autoFocus={!hasPassword}
                          autoComplete="new-password"
                          disabled={pwBusy}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={() => setPwShow((s) => !s)}
                          aria-label={pwShow ? "Hide passwords" : "Show passwords"}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {pwShow ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        At least {MIN_PASSWORD_LENGTH} characters.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="pw-confirm"
                        className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        Confirm new password
                      </label>
                      <input
                        id="pw-confirm"
                        type={pwShow ? "text" : "password"}
                        value={pwConfirm}
                        onChange={(e) => setPwConfirm(e.target.value)}
                        autoComplete="new-password"
                        disabled={pwBusy}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void changePassword();
                        }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
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
                      onClick={closePwModal}
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
                      <span>{hasPassword ? "Update password" : "Set password"}</span>
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
