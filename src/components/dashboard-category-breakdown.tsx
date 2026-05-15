import {
  Utensils,
  Car,
  Zap,
  Tv,
  ShoppingBag,
  HeartPulse,
  Briefcase,
  Wallet,
  TrendingUp,
  Gift,
  Receipt,
  PieChart,
} from "lucide-react";
import type { MonthlySummary } from "@/app/actions/transactions-actions";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Food: Utensils,
  Transport: Car,
  Utilities: Zap,
  Shopping: ShoppingBag,
  Entertainment: Tv,
  Health: HeartPulse,
  Salary: Wallet,
  Freelance: Briefcase,
  Investment: TrendingUp,
  Gift: Gift,
};

function iconFor(label: string): React.ElementType {
  return CATEGORY_ICONS[label] ?? Receipt;
}

function formatAmount(n: number): string {
  return `₹${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.round(n))}`;
}

const TOP_N = 5;

export function DashboardCategoryBreakdown({
  summary,
}: {
  summary: MonthlySummary;
}) {
  const total = summary.spent;
  const sorted = summary.categories;
  const top = sorted.slice(0, TOP_N);
  const rest = sorted.slice(TOP_N);
  const restTotal = rest.reduce((s, c) => s + c.amount, 0);
  const rows =
    restTotal > 0
      ? [...top, { label: "Other", amount: restTotal }]
      : top;

  return (
    <section
      aria-label="Spend by category"
      className="flex h-full flex-col rounded-2xl border border-border bg-card/60 backdrop-blur-xl"
    >
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold text-foreground">
          This month by category
        </h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {total > 0
            ? `Where your ${formatAmount(total)} went`
            : "No expenses yet this month"}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <span
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
          >
            <PieChart className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="space-y-1">
            <p className="text-[13px] font-semibold text-foreground">
              Nothing to break down
            </p>
            <p className="text-[11px] text-muted-foreground">
              Add an expense to see where your money goes.
            </p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-1 flex-col justify-between gap-4 px-5 py-5 sm:px-6 sm:py-6">
          {rows.map((c) => {
            const pct = total > 0 ? Math.round((c.amount / total) * 100) : 0;
            const Icon = iconFor(c.label);
            return (
              <li key={c.label}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-soft text-purple"
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </span>
                    <span className="truncate text-[12px] font-medium text-foreground">
                      {c.label}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-2 tabular-nums">
                    <span className="text-[12px] font-semibold text-foreground">
                      {formatAmount(c.amount)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                </div>

                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${c.label} ${pct} percent of total spend`}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background:
                        "linear-gradient(90deg, var(--purple) 0%, var(--orange) 100%)",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
