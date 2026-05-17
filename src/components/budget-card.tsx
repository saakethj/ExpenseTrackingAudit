"use client";

import * as React from "react";
import { Pencil, Wallet, TrendingUp } from "lucide-react";
import type { BudgetWithSpend } from "@/app/actions/budgets-actions";

export interface BudgetCardProps {
  budget: BudgetWithSpend;
  onEdit: (budget: BudgetWithSpend) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatCurrency(amount: number): string {
  return `₹${Math.round(Math.abs(amount)).toLocaleString("en-IN")}`;
}

function formatPeriodLabel(
  periodType: BudgetWithSpend["period_type"],
  periodStart: string
): string {
  const [yyyy, mm] = periodStart.split("-").map(Number);
  if (periodType === "yearly") return String(yyyy);
  if (periodType === "quarterly") {
    const quarter = Math.floor((mm! - 1) / 3) + 1;
    return `Q${quarter} ${yyyy}`;
  }
  return `${MONTH_NAMES[mm! - 1]} ${yyyy}`;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0]!;
}

function getPeriodStatus(
  periodStart: string,
  periodEnd: string
): "active" | "ended" | "upcoming" {
  const today = todayISO();
  if (today < periodStart) return "upcoming";
  if (today > periodEnd) return "ended";
  return "active";
}

type Tone = "ok" | "warn" | "over";

function getTone(percent: number): Tone {
  if (percent >= 100) return "over";
  if (percent >= 80) return "warn";
  return "ok";
}

const TONE_STYLES: Record<
  Tone,
  { bar: string; text: string; bg: string; pillText: string }
> = {
  ok: {
    bar: "var(--purple)",
    text: "text-foreground",
    bg: "bg-purple-soft",
    pillText: "text-purple",
  },
  warn: {
    bar: "var(--orange)",
    text: "text-orange",
    bg: "bg-orange-soft",
    pillText: "text-orange",
  },
  over: {
    bar: "rgb(244 63 94)",
    text: "text-rose-500",
    bg: "bg-rose-500/10",
    pillText: "text-rose-500",
  },
};

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const tone = getTone(budget.percent_used);
  const styles = TONE_STYLES[tone];
  const status = getPeriodStatus(budget.period_start, budget.period_end);
  const remaining = budget.limit_amount - budget.current_spent;
  const cappedPct = Math.min(100, budget.percent_used);
  const periodLabel = formatPeriodLabel(budget.period_type, budget.period_start);
  const label = budget.category ?? "Overall";

  return (
    <button
      type="button"
      onClick={() => onEdit(budget)}
      className="card-glow group relative flex w-full flex-col rounded-2xl border border-border bg-card p-5 text-left transition-transform hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles.bg}`}
            >
              {budget.category === null ? (
                <Wallet className={`h-3.5 w-3.5 ${styles.pillText}`} />
              ) : (
                <TrendingUp className={`h-3.5 w-3.5 ${styles.pillText}`} />
              )}
            </span>
            <h3 className="truncate text-base font-semibold text-foreground">
              {label}
            </h3>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <span>{periodLabel}</span>
            <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span className="capitalize">{status}</span>
          </div>
        </div>

        <span
          aria-hidden
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all duration-150 group-hover:bg-purple-soft group-hover:text-purple group-hover:opacity-100"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-2xl font-semibold tracking-tight tabular-nums ${styles.text}`}>
            {formatCurrency(budget.current_spent)}
          </span>
          <span className="text-[12px] font-medium text-muted-foreground">
            of {formatCurrency(budget.limit_amount)}
          </span>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${cappedPct}%`,
              backgroundColor: styles.bar,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-medium">
          <span className={`tabular-nums ${styles.pillText}`}>
            {budget.percent_used.toFixed(0)}% used
          </span>
          <span className="text-muted-foreground">
            {remaining >= 0
              ? `${formatCurrency(remaining)} left`
              : `${formatCurrency(remaining)} over`}
          </span>
        </div>
      </div>
    </button>
  );
}
