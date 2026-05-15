import { redirect } from "next/navigation";
import { Plus, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardSummaryCards } from "@/components/dashboard-summary-cards";
import { DashboardRecentTransactions } from "@/components/dashboard-recent-transactions";
import { DashboardCategoryBreakdown } from "@/components/dashboard-category-breakdown";

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

  const firstName = getFirstName(user.user_metadata ?? {}, user.email);
  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const monthYear = now.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full px-3 sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-1 py-10 sm:space-y-12 sm:px-2 sm:py-14 lg:space-y-14 lg:py-16">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="min-w-0 space-y-3">
            <span
              className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl"
            >
              {monthYear}
            </span>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
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

          <button
            type="button"
            className="card-glow group relative flex w-full shrink-0 items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card/60 px-5 py-4 text-left backdrop-blur-xl transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:min-w-[280px]"
          >
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-soft text-purple transition-transform duration-200 group-hover:scale-105"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold leading-tight text-foreground">
                Add Transaction
              </span>
              <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                Log a new expense or income
              </span>
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden
            />
          </button>
        </header>

        <DashboardSummaryCards />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <DashboardRecentTransactions />
          </div>
          <div className="lg:col-span-1">
            <DashboardCategoryBreakdown />
          </div>
        </div>
      </div>
    </div>
  );
}
