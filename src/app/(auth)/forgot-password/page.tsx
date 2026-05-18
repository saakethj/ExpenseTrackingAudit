"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, KeyRound, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "submitting" | "success" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setStatus("error");
      setErrorMsg("Could not send reset email. Please try again.");
      return;
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card-glow w-full max-w-md rounded-2xl border border-border bg-card/80 p-7 text-center shadow-xl backdrop-blur-xl sm:p-9"
      >
        <div
          className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
            boxShadow: "0 10px 30px -10px rgba(168, 85, 247, 0.5)",
          }}
        >
          <CheckCircle2 className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We sent a password reset link to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Didn&apos;t get it? Check spam, or{" "}
          <button
            onClick={() => setStatus("idle")}
            className="text-foreground underline-offset-4 hover:text-purple hover:underline"
          >
            try again
          </button>
          .
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="card-glow w-full max-w-md rounded-2xl border border-border bg-card/80 p-7 shadow-xl backdrop-blur-xl sm:p-9"
    >
      <div className="mb-7 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
            boxShadow: "0 10px 30px -10px rgba(168, 85, 247, 0.5)",
          }}
        >
          <KeyRound className="h-5 w-5 text-white" />
        </motion.div>
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
            Email
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glow w-full rounded-xl border border-input bg-background/60 pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all duration-200"
            />
          </div>
        </div>

        {status === "error" && errorMsg && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400"
          >
            {errorMsg}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={status === "submitting"}
          whileHover={status === "submitting" ? undefined : { y: -1 }}
          whileTap={status === "submitting" ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="relative w-full overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background:
              "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
            boxShadow: "0 12px 30px -10px rgba(168, 85, 247, 0.55)",
          }}
        >
          {status === "submitting" ? "Sending…" : "Send reset link"}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 transition-colors hover:text-purple hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </motion.div>
  );
}
