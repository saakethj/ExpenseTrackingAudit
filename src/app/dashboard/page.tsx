import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardPage() {
  return (
    <div className="relative flex min-h-svh w-full flex-1 flex-col">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(45% 40% at 85% 15%, var(--purple-soft) 0%, transparent 65%), radial-gradient(40% 35% at 10% 85%, var(--orange-soft) 0%, transparent 65%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span
            className="inline-block h-6 w-6 rounded-md"
            style={{
              background:
                "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
            }}
          />
          ExpenseTracking <span className="text-muted-foreground">Audit</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome
        </h1>
      </main>
    </div>
  );
}
