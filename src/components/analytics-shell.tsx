"use client";

import * as React from "react";
import { RawTransaction } from "@/app/actions/transactions-actions";
import { AnalyticsFilterBar } from "./analytics-filter-bar";
import { AnalyticsKpiStrip } from "./analytics-kpi-strip";
import { AnalyticsTrendChart } from "./analytics-trend-chart";
import { AnalyticsCategoryChart } from "./analytics-category-chart";
import { AnalyticsPaymentChart } from "./analytics-payment-chart";
import { AnalyticsSpendTrend } from "./analytics-spend-trend";

type Range = "30d" | "3m" | "6m" | "12m" | "all";

const RANGE_LABEL: Record<Range, string> = {
  "30d": "the last 30 days",
  "3m": "the last 3 months",
  "6m": "the last 6 months",
  "12m": "the last 12 months",
  all: "all time",
};

export type AnalyticsInsights = {
  range: Range;
  daysInRange: number;
  activeDays: number;
  avgDailySpend: number;
  topCategory: { label: string; amount: number } | null;
  biggestExpense: { amount: number; category: string; date: string } | null;
  spendDeltaPct: number | null;
  prevSpent: number | null;
  totalSpent: number;
};

export type AnalyticsData = {
  monthlyBreakdown: { month: string; monthLabel: string; income: number; spent: number }[];
  categoryBreakdown: { label: string; amount: number; pct: number }[];
  paymentModeBreakdown: { mode: string; amount: number; count: number }[];
  dailyCumulative: { date: string; dateLabel: string; cumSpent: number }[];
  insights: AnalyticsInsights;
  totals: {
    income: number;
    spent: number;
    net: number;
    savingsRate: number;
    txCount: number;
  };
};

export interface AnalyticsShellProps {
  transactions: RawTransaction[];
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MS_PER_DAY = 86_400_000;

export function AnalyticsShell({ transactions }: AnalyticsShellProps) {
  const [range, setRange] = React.useState<Range>("6m");

  const data: AnalyticsData = React.useMemo(() => {
    const emptyInsights: AnalyticsInsights = {
      range,
      daysInRange: 0,
      activeDays: 0,
      avgDailySpend: 0,
      topCategory: null,
      biggestExpense: null,
      spendDeltaPct: null,
      prevSpent: null,
      totalSpent: 0,
    };

    if (transactions.length === 0) {
      return {
        monthlyBreakdown: [],
        categoryBreakdown: [],
        paymentModeBreakdown: [],
        dailyCumulative: [],
        insights: emptyInsights,
        totals: { income: 0, spent: 0, net: 0, savingsRate: 0, txCount: 0 },
      };
    }

    const now = new Date();
    let fromDate: Date;
    switch (range) {
      case "30d":
        fromDate = new Date(now);
        fromDate.setDate(fromDate.getDate() - 30);
        break;
      case "3m":
        fromDate = new Date(now);
        fromDate.setMonth(fromDate.getMonth() - 3);
        break;
      case "6m":
        fromDate = new Date(now);
        fromDate.setMonth(fromDate.getMonth() - 6);
        break;
      case "12m":
        fromDate = new Date(now);
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        break;
      case "all":
        fromDate = new Date("1970-01-01");
        break;
    }

    const fromIso = fromDate.toISOString().split("T")[0];
    const filtered = transactions.filter((tx) => tx.date >= fromIso);

    const monthMap = new Map<string, { income: number; spent: number; year: number; monthIdx: number }>();
    const categoryMap = new Map<string, number>();
    const paymentModeMap = new Map<string, { amount: number; count: number }>();
    const dailyMap = new Map<string, number>();
    const activeDaySet = new Set<string>();

    let totalIncome = 0;
    let totalSpent = 0;
    let biggestExpense: { amount: number; category: string; date: string } | null = null;

    for (const tx of filtered) {
      const amt = tx.amount;
      const [year, month] = tx.date.split("-");
      const yearNum = Number(year);
      const monthIdx = Number(month) - 1;
      const monthKey = `${year}-${month}`;

      activeDaySet.add(tx.date);

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { income: 0, spent: 0, year: yearNum, monthIdx });
      }
      const mo = monthMap.get(monthKey)!;

      if (tx.type === "expense") {
        mo.spent += amt;
        totalSpent += amt;
        categoryMap.set(tx.category, (categoryMap.get(tx.category) ?? 0) + amt);
        if (!biggestExpense || amt > biggestExpense.amount) {
          biggestExpense = { amount: amt, category: tx.category, date: tx.date };
        }
      } else {
        mo.income += amt;
        totalIncome += amt;
      }

      const pmEntry = paymentModeMap.get(tx.payment_mode) ?? { amount: 0, count: 0 };
      pmEntry.amount += amt;
      pmEntry.count += 1;
      paymentModeMap.set(tx.payment_mode, pmEntry);

      if (tx.type === "expense") {
        const daily = dailyMap.get(tx.date) ?? 0;
        dailyMap.set(tx.date, daily + amt);
      }
    }

    const monthlyBreakdown = [...monthMap.entries()]
      .map(([key, mo]) => ({
        month: key,
        monthLabel: `${MONTH_NAMES[mo.monthIdx]} ${String(mo.year).slice(2)}`,
        income: mo.income,
        spent: mo.spent,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const categoryEntries = [...categoryMap.entries()]
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => b.amount - a.amount);

    const topCategories = categoryEntries.slice(0, 8);
    const otherAmount = categoryEntries.slice(8).reduce((sum, c) => sum + c.amount, 0);
    if (otherAmount > 0) {
      topCategories.push({ label: "Other", amount: otherAmount });
    }

    const categoryBreakdown = topCategories.map((c) => ({
      ...c,
      pct: totalSpent > 0 ? (c.amount / totalSpent) * 100 : 0,
    }));

    const paymentModeBreakdown = [...paymentModeMap.entries()]
      .map(([mode, d]) => ({ mode, ...d }))
      .sort((a, b) => b.amount - a.amount);

    const sortedDates = [...dailyMap.entries()].sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    let cumSum = 0;
    const dailyCumulative = sortedDates.map(([date, amount]) => {
      cumSum += amount;
      const [, mm, dd] = date.split("-");
      const monthIdx = Number(mm) - 1;
      return {
        date,
        dateLabel: `${MONTH_NAMES[monthIdx]} ${Number(dd)}`,
        cumSpent: cumSum,
      };
    });

    // ── Insights ──
    let daysInRange: number;
    if (range === "all") {
      const earliest = transactions[0]?.date ?? now.toISOString().split("T")[0];
      daysInRange = Math.max(
        1,
        Math.ceil((now.getTime() - new Date(earliest).getTime()) / MS_PER_DAY)
      );
    } else {
      daysInRange = Math.max(
        1,
        Math.ceil((now.getTime() - fromDate.getTime()) / MS_PER_DAY)
      );
    }
    const avgDailySpend = totalSpent / daysInRange;
    const activeDays = activeDaySet.size;
    const topCategory =
      categoryEntries.length > 0
        ? { label: categoryEntries[0].label, amount: categoryEntries[0].amount }
        : null;

    let prevSpent: number | null = null;
    let spendDeltaPct: number | null = null;
    if (range !== "all") {
      const windowMs = now.getTime() - fromDate.getTime();
      const priorFrom = new Date(fromDate.getTime() - windowMs);
      const priorFromIso = priorFrom.toISOString().split("T")[0];
      let pSpent = 0;
      let pHasAny = false;
      for (const tx of transactions) {
        if (tx.date >= priorFromIso && tx.date < fromIso) {
          pHasAny = true;
          if (tx.type === "expense") pSpent += tx.amount;
        }
      }
      if (pHasAny) {
        prevSpent = pSpent;
        spendDeltaPct = pSpent > 0 ? ((totalSpent - pSpent) / pSpent) * 100 : null;
      }
    }

    const insights: AnalyticsInsights = {
      range,
      daysInRange,
      activeDays,
      avgDailySpend,
      topCategory,
      biggestExpense,
      spendDeltaPct,
      prevSpent,
      totalSpent,
    };

    const net = totalIncome - totalSpent;
    const savingsRate = totalIncome > 0 ? (net / totalIncome) * 100 : 0;

    return {
      monthlyBreakdown,
      categoryBreakdown,
      paymentModeBreakdown,
      dailyCumulative,
      insights,
      totals: {
        income: totalIncome,
        spent: totalSpent,
        net,
        savingsRate,
        txCount: filtered.length,
      },
    };
  }, [transactions, range]);

  return (
    <div className="w-full px-3 sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-1 py-10 sm:space-y-10 sm:px-2 sm:py-14 lg:py-16">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <span className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl">
              Analytics
            </span>
            <h1 className="break-words text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              Your{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
                }}
              >
                money
              </span>{" "}
              at a glance
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Showing {data.totals.txCount.toLocaleString("en-IN")} transaction
              {data.totals.txCount === 1 ? "" : "s"} from {RANGE_LABEL[range]}.
            </p>
          </div>
          <AnalyticsFilterBar range={range} onRangeChange={setRange} />
        </header>

        <AnalyticsKpiStrip insights={data.insights} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <AnalyticsTrendChart monthlyBreakdown={data.monthlyBreakdown} />
          </div>
          <div className="lg:col-span-1">
            <AnalyticsCategoryChart
              categoryBreakdown={data.categoryBreakdown}
              totalSpent={data.totals.spent}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <AnalyticsSpendTrend dailyCumulative={data.dailyCumulative} />
          </div>
          <div className="lg:col-span-1">
            <AnalyticsPaymentChart paymentModeBreakdown={data.paymentModeBreakdown} />
          </div>
        </div>
      </div>
    </div>
  );
}
