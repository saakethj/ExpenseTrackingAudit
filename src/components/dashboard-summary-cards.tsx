import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
} from "lucide-react";
import type { MonthlySummary } from "@/app/actions/transactions-actions";

type Tone = "neutral" | "expense" | "income" | "savings";

type CardSpec = {
  label: string;
  value: string;
  sub: string;
  delta: number | null;
  deltaSuffix: string;
  icon: React.ElementType;
  tone: Tone;
};

function formatRupees(n: number, opts?: { signed?: boolean }): string {
  const abs = Math.abs(n);
  const body = `₹${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(Math.round(abs))}`;
  if (!opts?.signed) return body;
  if (n > 0) return `+${body}`;
  if (n < 0) return `−${body}`;
  return body;
}

function formatPct(n: number): string {
  return `${Math.round(n)}%`;
}

function deltaTrend(delta: number | null): "up" | "down" | "flat" {
  if (delta === null || Math.abs(delta) < 0.5) return "flat";
  return delta > 0 ? "up" : "down";
}

function deltaStyles(trend: "up" | "down" | "flat", tone: Tone): string {
  if (trend === "flat") return "text-muted-foreground";
  // For "Spent": a *decrease* (down) is positive news; invert.
  const positive = tone === "expense" ? trend === "down" : trend === "up";
  return positive
    ? "text-emerald-500 dark:text-emerald-400"
    : "text-rose-500 dark:text-rose-400";
}

export function DashboardSummaryCards({
  summary,
}: {
  summary: MonthlySummary;
}) {
  const cards: CardSpec[] = [
    {
      label: "Net this month",
      value: formatRupees(summary.net, { signed: true }),
      sub: "Income minus spend",
      delta: summary.deltas.net,
      deltaSuffix: "%",
      icon: Wallet,
      tone: "neutral",
    },
    {
      label: "Spent",
      value: formatRupees(summary.spent),
      sub:
        summary.expenseCount === 0
          ? "No expenses yet"
          : `Across ${summary.expenseCount} transaction${summary.expenseCount === 1 ? "" : "s"}`,
      delta: summary.deltas.spent,
      deltaSuffix: "%",
      icon: TrendingDown,
      tone: "expense",
    },
    {
      label: "Income",
      value: formatRupees(summary.income),
      sub:
        summary.incomeSourceCount === 0
          ? "No income yet"
          : `From ${summary.incomeSourceCount} source${summary.incomeSourceCount === 1 ? "" : "s"}`,
      delta: summary.deltas.income,
      deltaSuffix: "%",
      icon: TrendingUp,
      tone: "income",
    },
    {
      label: "Savings rate",
      value: summary.income > 0 ? formatPct(summary.savingsRate) : "—",
      sub: summary.income > 0 ? "Of income kept" : "Add income to compute",
      delta: summary.deltas.savingsRatePoints,
      deltaSuffix: "pp",
      icon: PiggyBank,
      tone: "savings",
    },
  ];

  return (
    <section
      aria-label="Monthly summary"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
    >
      {cards.map((c) => {
        const Icon = c.icon;
        const trend = deltaTrend(c.delta);
        const tStyle = deltaStyles(trend, c.tone);
        const Arrow =
          trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
        const deltaText =
          c.delta === null
            ? "—"
            : `${Math.abs(Math.round(c.delta))}${c.deltaSuffix}`;
        return (
          <div
            key={c.label}
            className="card-glow group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {c.label}
              </span>
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-soft text-purple transition-transform duration-200 group-hover:scale-105"
              >
                <Icon className="h-4 w-4" strokeWidth={2.25} />
              </span>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-[26px]">
              {c.value}
            </p>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="truncate text-[11px] leading-snug text-muted-foreground">
                {c.sub}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${tStyle}`}
                aria-label={
                  c.delta === null
                    ? "No prior month data"
                    : `${deltaText} vs last month`
                }
              >
                <Arrow className="h-3 w-3" strokeWidth={2.5} />
                {deltaText}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
