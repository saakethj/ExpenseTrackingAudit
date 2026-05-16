import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMonthlySummary } from "@/app/actions/transactions-actions";
import { DashboardSummaryCards } from "@/components/dashboard-summary-cards";
import { DashboardRecentTransactions } from "@/components/dashboard-recent-transactions";
import { DashboardCategoryBreakdown } from "@/components/dashboard-category-breakdown";
import { DashboardActions } from "@/components/dashboard-actions";
import { BudgetAlerts } from "@/components/budget-alerts";

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(meta: Record<string, unknown>, email: string): string {
  const first = (meta.first_name as string | undefined) ?? "";
  if (first) return first;
  const full = (meta.full_name as string | undefined) ?? "";
  if (full) return full.trim().split(/\s+/)[0] ?? "";
  return email.split("@")[0] ?? "there";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const summary = await getMonthlySummary();
  const firstName = getFirstName(user.user_metadata ?? {}, user.email);
  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const monthYear = now.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const weekday = now.toLocaleDateString(undefined, { weekday: "long" });
  const dayNumber = now.getDate();
  const longMonth = now.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86_400_000
  );

  return (
    <div className="w-full px-3 sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-1 py-10 sm:space-y-12 sm:px-2 sm:py-14 lg:space-y-14 lg:py-16">
        <header className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:text-left">
          <div className="min-w-0 space-y-3">
            <span
              className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl"
            >
              {monthYear}
            </span>

            <h1 className="break-words text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {greeting},{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
                }}
              >
                {firstName}
              </span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Here&apos;s your financial snapshot — a quick view of where your
              money moved this month.
            </p>
          </div>

          <aside
            aria-label="Today's date"
            className="glass-pill hidden shrink-0 items-stretch gap-6 rounded-2xl px-8 py-6 sm:flex lg:gap-8 lg:px-10"
          >
            <div className="flex flex-col items-center justify-center">
              <span className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {weekday}
              </span>
              <span
                className="bg-clip-text text-7xl font-semibold leading-none tracking-tight text-transparent lg:text-8xl"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
                }}
              >
                {dayNumber}
              </span>
            </div>
            <div className="flex flex-col justify-center gap-1.5 border-l border-border/60 pl-6 lg:pl-8">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Today
              </span>
              <span className="text-[18px] font-semibold leading-tight text-foreground">
                {longMonth}
              </span>
              <span className="text-[12px] text-muted-foreground">
                Day {dayOfYear} of {now.getFullYear()}
              </span>
              <span className="mt-1 text-[11px] text-muted-foreground">
                {Math.max(
                  0,
                  Math.ceil(
                    (new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() -
                      now.getDate())
                  )
                )}{" "}
                days left in {now.toLocaleDateString(undefined, { month: "long" })}
              </span>
            </div>
          </aside>
        </header>

        <DashboardActions />

        <DashboardSummaryCards summary={summary} />

        <BudgetAlerts />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <DashboardRecentTransactions />
          </div>
          <div className="lg:col-span-1">
            <DashboardCategoryBreakdown summary={summary} />
          </div>
        </div>
      </div>
    </div>
  );
}
