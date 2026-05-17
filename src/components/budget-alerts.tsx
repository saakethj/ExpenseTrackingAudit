import Link from "next/link";
import { AlertTriangle, ArrowRight, Wallet } from "lucide-react";
import { getBudgetAlerts } from "@/app/actions/budgets-actions";
import type { BudgetWithSpend } from "@/app/actions/budgets-actions";

function formatCurrency(amount: number): string {
  return `₹${Math.round(Math.abs(amount)).toLocaleString("en-IN")}`;
}

type Tone = "warn" | "over";

function getTone(percent: number): Tone {
  return percent >= 100 ? "over" : "warn";
}

const TONE: Record<
  Tone,
  { ring: string; bar: string; text: string; bg: string; label: string }
> = {
  warn: {
    ring: "border-orange/40",
    bar: "var(--orange)",
    text: "text-orange",
    bg: "bg-orange-soft",
    label: "Near limit",
  },
  over: {
    ring: "border-rose-500/40",
    bar: "rgb(244 63 94)",
    text: "text-rose-500",
    bg: "bg-rose-500/10",
    label: "Over budget",
  },
};

export async function BudgetAlerts() {
  const result = await getBudgetAlerts();
  if ("error" in result) return null;
  if (result.alerts.length === 0) return null;

  const alerts = result.alerts.slice(0, 4);
  const overCount = alerts.filter((a) => a.percent_used >= 100).length;
  const headline =
    overCount > 0
      ? `${overCount} budget${overCount > 1 ? "s" : ""} over limit`
      : "Watch out — close to limit";

  return (
    <section className="card-glow rounded-2xl border border-border bg-card px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
              overCount > 0 ? "bg-rose-500/10 text-rose-500" : "bg-orange-soft text-orange"
            }`}
          >
            <AlertTriangle className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground sm:text-base">
              {headline}
            </h3>
            <p className="text-[12px] text-muted-foreground">
              Active budgets at 80% or more this period
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/budgets"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-foreground transition-all duration-150 hover:-translate-y-[1px] hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View budgets
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
        </Link>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {alerts.map((b) => (
          <BudgetAlertRow key={b.id} budget={b} />
        ))}
      </ul>
    </section>
  );
}

function BudgetAlertRow({ budget }: { budget: BudgetWithSpend }) {
  const tone = getTone(budget.percent_used);
  const styles = TONE[tone];
  const label = budget.category ?? "Overall";
  const cappedPct = Math.min(100, budget.percent_used);
  const remaining = budget.limit_amount - budget.current_spent;

  return (
    <li
      className={`rounded-xl border ${styles.ring} bg-card/60 px-4 py-3.5 backdrop-blur-xl`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles.bg}`}
          >
            <Wallet className={`h-3.5 w-3.5 ${styles.text}`} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-foreground">
              {label}
            </p>
            <p className={`text-[11px] font-medium ${styles.text}`}>
              {styles.label}
            </p>
          </div>
        </div>
        <span className={`text-[13px] font-semibold tabular-nums ${styles.text}`}>
          {budget.percent_used.toFixed(0)}%
        </span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${cappedPct}%`, backgroundColor: styles.bar }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span className="tabular-nums">
          {formatCurrency(budget.current_spent)} of{" "}
          {formatCurrency(budget.limit_amount)}
        </span>
        <span className="tabular-nums">
          {remaining >= 0
            ? `${formatCurrency(remaining)} left`
            : `${formatCurrency(remaining)} over`}
        </span>
      </div>
    </li>
  );
}
