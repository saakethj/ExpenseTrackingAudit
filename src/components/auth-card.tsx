"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { GoogleButton } from "./google-button";

type Mode = "login" | "signup";

export function AuthCard({ mode }: { mode: Mode }) {
  const isLogin = mode === "login";
  const [showPw, setShowPw] = React.useState(false);

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
        <h1 className="text-2xl font-semibold tracking-tight">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLogin
            ? "Sign in to access your audit dashboard."
            : "Start tracking expenses with confidence."}
        </p>
      </div>

      <GoogleButton
        label={isLogin ? "Sign in with Google" : "Sign up with Google"}
      />

      <Separator>or {isLogin ? "sign in" : "sign up"} manually</Separator>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {!isLogin && (
          <Field
            id="name"
            label="Full name"
            placeholder="Jane Doe"
            icon={<User className="h-4 w-4" />}
            autoComplete="name"
          />
        )}
        <Field
          id="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
        />
        <Field
          id="password"
          label="Password"
          type={showPw ? "text" : "password"}
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          autoComplete={isLogin ? "current-password" : "new-password"}
          accent="orange"
          trailing={
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPw ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        {isLogin && (
          <div className="flex items-center justify-between text-xs">
            <label className="inline-flex items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-border bg-transparent accent-[var(--purple)]"
              />
              Remember me
            </label>
            <Link
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <motion.button
          type="submit"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="relative w-full overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            background:
              "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
            boxShadow: "0 12px 30px -10px rgba(168, 85, 247, 0.55)",
          }}
        >
          {isLogin ? "Sign in" : "Create account"}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isLogin ? "New here?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-medium text-foreground underline-offset-4 transition-colors hover:text-purple hover:underline"
        >
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </motion.div>
  );
}

function Separator({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
  icon,
  trailing,
  autoComplete,
  accent = "purple",
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  autoComplete?: string;
  accent?: "purple" | "orange";
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`input-glow ${accent === "orange" ? "alt" : ""} w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all duration-200 ${icon ? "pl-9" : ""} ${trailing ? "pr-10" : ""}`}
        />
        {trailing && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            {trailing}
          </span>
        )}
      </div>
    </div>
  );
}
