import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-1 flex-col">
      <div className="auth-backdrop" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span
            className="inline-block h-6 w-6 rounded-md"
            style={{
              background:
                "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
            }}
          />
          ExpenseTracking <span className="text-muted-foreground">Audit</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-6xl">
          Audit-grade clarity for{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--purple), var(--orange))",
            }}
          >
            every expense.
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          A secure, multi-user financial dashboard built for teams that take
          their numbers seriously.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
              boxShadow: "0 12px 30px -10px rgba(168, 85, 247, 0.55)",
            }}
          >
            Sign in
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-xl border border-border bg-card/60 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-card"
          >
            Create account
          </Link>
        </div>
      </main>
    </div>
  );
}
