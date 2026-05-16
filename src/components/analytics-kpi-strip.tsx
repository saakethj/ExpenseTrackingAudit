"use client";

import {
  CalendarDays,
  Activity,
  Crown,
  Receipt,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import type { AnalyticsInsights } from "./analytics-shell";

export interface AnalyticsKpiStripProps {
  insights: AnalyticsInsights;
}

function formatCurrency(amount: number): string {
  return `₹${Math.round(Math.abs(amount)).toLocaleString("en-IN")}`;
}

const RANGE_PRIOR_LABEL: Record<AnalyticsInsights["range"], string> = {
  "30d": "prior 30 days",
  "3m": "prior 3 months",
  "6m": "prior 6 months",
  "12m": "prior year",
  all: "",
};

export function AnalyticsKpiStrip({ insights }: AnalyticsKpiStripProps) {
  const {
    range,
    daysInRange,
    activeDays,
    avgDailySpend,
    topCategory,
    biggestExpense,
    spendDeltaPct,
    totalSpent,
  } = insights;

  // ── Card 1: Avg daily spend
  const card1 = (
    <Card
      label="Avg daily spend"
      icon={<CalendarDays className="h-3.5 w-3.5" />}
      iconClass="text-orange bg-orange-soft"
      value={totalSpent > 0 ? formatCurrency(avgDailySpend) : "—"}
      hint={
        totalSpent > 0
          ? `across ${daysInRange.toLocaleString("en-IN")} days`
          : "No expenses in range"
      }
    />
  );

  // ── Card 2: Top category
  const card2 = (
    <Card
      label="Top category"
      icon={<Crown className="h-3.5 w-3.5" />}
      iconClass="text-purple bg-purple-soft"
      value={topCategory ? topCategory.label : "—"}
      valueClass="text-xl sm:text-2xl truncate"
      hint={
        topCategory
          ? `${formatCurrency(topCategory.amount)} spent`
          : "No expenses"
      }
    />
  );

  // ── Card 3: Biggest expense
  const card3 = (
    <Card
      label="Biggest expense"
      icon={<Receipt className="h-3.5 w-3.5" />}
      iconClass="text-rose-500 bg-rose-500/10"
      value={biggestExpense ? formatCurrency(biggestExpense.amount) : "—"}
      hint={
        biggestExpense
          ? `in ${biggestExpense.category}`
          : "No expenses"
      }
      hintClass="truncate"
    />
  );

  // ── Card 4: vs prior period (or active days when "all")
  let card4: React.ReactNode;
  if (range === "all") {
    const ratio =
      daysInRange > 0 ? Math.round((activeDays / daysInRange) * 100) : 0;
    card4 = (
      <Card
        label="Active days"
        icon={<Activity className="h-3.5 w-3.5" />}
        iconClass="text-emerald-500 bg-emerald-500/10"
        value={activeDays.toLocaleString("en-IN")}
        hint={`${ratio}% of ${daysInRange.toLocaleString("en-IN")} days`}
      />
    );
  } else if (spendDeltaPct === null) {
    card4 = (
      <Card
        label={`vs ${RANGE_PRIOR_LABEL[range]}`}
        icon={<Minus className="h-3.5 w-3.5" />}
        iconClass="text-muted-foreground bg-muted"
        value="—"
        hint="No prior data"
      />
    );
  } else {
    const spendingMore = spendDeltaPct > 0;
    const Arrow = spendingMore ? TrendingUp : TrendingDown;
    // Spending less is good (green), more is bad (rose)
    const tone = spendingMore
      ? "text-rose-500 bg-rose-500/10"
      : "text-emerald-500 bg-emerald-500/10";
    const sign = spendingMore ? "+" : "−";
    const abs = Math.abs(spendDeltaPct);
    card4 = (
      <Card
        label={`vs ${RANGE_PRIOR_LABEL[range]}`}
        icon={<Arrow className="h-3.5 w-3.5" />}
        iconClass={tone}
        value={`${sign}${abs.toFixed(1)}%`}
        valueClass={spendingMore ? "text-rose-500" : "text-emerald-500"}
        hint={spendingMore ? "spending more" : "spending less"}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {card1}
      {card2}
      {card3}
      {card4}
    </div>
  );
}

function Card({
  label,
  icon,
  iconClass,
  value,
  valueClass,
  hint,
  hintClass,
}: {
  label: string;
  icon: React.ReactNode;
  iconClass: string;
  value: string;
  valueClass?: string;
  hint: string;
  hintClass?: string;
}) {
  return (
    <div className="card-glow rounded-2xl border border-border bg-card px-4 py-5 sm:px-5 sm:py-6">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </span>
      </div>
      <p
        className={`mt-3 font-semibold tracking-tight text-foreground ${
          valueClass ?? "text-2xl sm:text-[26px]"
        }`}
      >
        {value}
      </p>
      <p className={`mt-1 text-[11px] text-muted-foreground ${hintClass ?? ""}`}>
        {hint}
      </p>
    </div>
  );
}
