import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Sparkles,
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
      label: "Cash flow",
      value: formatRupees(summary.net, { signed: true }),
      sub: "This month's in − out",
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

  const balance = summary.balance;
  const balanceTone: "positive" | "negative" | "empty" =
    summary.totalTransactions === 0
      ? "empty"
      : balance < 0
        ? "negative"
        : "positive";

  const balanceSub =
    balanceTone === "empty"
      ? "Add or import transactions to see your balance"
      : balanceTone === "negative" && summary.income === 0 && summary.spent === 0
        ? "No income tracked yet — you may need to import earlier months"
        : balanceTone === "negative"
          ? "Spent more than tracked income — older income may be missing"
          : `Across ${summary.totalTransactions} transaction${summary.totalTransactions === 1 ? "" : "s"}${
              summary.firstTransactionDate
                ? ` since ${new Date(summary.firstTransactionDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}`
                : ""
            }`;

  return (
    <div className="space-y-3 sm:space-y-4">
      <section
        aria-label="All-time balance"
        className="card-glow relative overflow-hidden rounded-2xl border border-border bg-card/60 px-5 py-6 backdrop-blur-xl sm:px-7 sm:py-7"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-soft text-purple"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                All-time balance
              </span>
            </div>
            <p
              className={`text-4xl font-semibold leading-none tracking-tight tabular-nums sm:text-5xl ${
                balanceTone === "negative"
                  ? "text-rose-500 dark:text-rose-400"
                  : balanceTone === "empty"
                    ? "text-muted-foreground"
                    : "bg-clip-text text-transparent"
              }`}
              style={
                balanceTone === "positive"
                  ? {
                      backgroundImage:
                        "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
                    }
                  : undefined
              }
            >
              {balanceTone === "empty"
                ? "₹0"
                : formatRupees(balance, { signed: balance < 0 })}
            </p>
            <p className="text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
              {balanceSub}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1 border-t border-border/60 pt-3 sm:items-end sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {summary.monthLabel}
            </span>
            <span className="text-[18px] font-semibold tabular-nums text-foreground">
              {formatRupees(summary.net, { signed: true })}
            </span>
            <span className="text-[11px] text-muted-foreground">
              this month&apos;s flow
            </span>
          </div>
        </div>
      </section>

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
    </div>
  );
}
