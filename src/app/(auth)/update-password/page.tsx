"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "submitting" | "error";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setErrorMsg(
        "Could not update password. The reset link may have expired — request a new one."
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
          <Lock className="h-5 w-5 text-white" />
        </motion.div>
        <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
            New password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-glow alt w-full rounded-xl border border-input bg-background/60 pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all duration-200"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
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
          {status === "submitting" ? "Updating…" : "Update password"}
        </motion.button>
      </form>
    </motion.div>
  );
}
