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

export type AnalyticsData = {
  monthlyBreakdown: { month: string; income: number; spent: number }[];
  categoryBreakdown: { label: string; amount: number; pct: number }[];
  paymentModeBreakdown: { mode: string; amount: number; count: number }[];
  dailyCumulative: { date: string; cumSpent: number }[];
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

export function AnalyticsShell({ transactions }: AnalyticsShellProps) {
  const [range, setRange] = React.useState<Range>("6m");

  const data: AnalyticsData = React.useMemo(() => {
    if (transactions.length === 0) {
      return {
        monthlyBreakdown: [],
        categoryBreakdown: [],
        paymentModeBreakdown: [],
        dailyCumulative: [],
        totals: { income: 0, spent: 0, net: 0, savingsRate: 0, txCount: 0 },
      };
    }

    // Determine date range
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

    // Monthly breakdown
    const monthMap = new Map<string, { income: number; spent: number }>();
    const categoryMap = new Map<string, number>();
    const paymentModeMap = new Map<string, { amount: number; count: number }>();
    const dailyMap = new Map<string, number>();

    let totalIncome = 0;
    let totalSpent = 0;

    for (const tx of filtered) {
      const amt = tx.amount;
      const [year, month] = tx.date.split("-");
      const monthKey = `${month}/${year}`;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { income: 0, spent: 0 });
      }
      const mo = monthMap.get(monthKey)!;

      if (tx.type === "expense") {
        mo.spent += amt;
        totalSpent += amt;
        categoryMap.set(tx.category, (categoryMap.get(tx.category) ?? 0) + amt);
      } else {
        mo.income += amt;
        totalIncome += amt;
      }

      const pmEntry = paymentModeMap.get(tx.payment_mode) ?? { amount: 0, count: 0 };
      pmEntry.amount += amt;
      pmEntry.count += 1;
      paymentModeMap.set(tx.payment_mode, pmEntry);

      const daily = dailyMap.get(tx.date) ?? 0;
      if (tx.type === "expense") {
        dailyMap.set(tx.date, daily + amt);
      }
    }

    // Convert month map to sorted array
    const monthlyBreakdown = [...monthMap.entries()]
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Category breakdown: top 8 + "Other"
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

    // Payment mode breakdown
    const paymentModeBreakdown = [...paymentModeMap.entries()]
      .map(([mode, data]) => ({ mode, ...data }))
      .sort((a, b) => b.amount - a.amount);

    // Daily cumulative spend
    const sortedDates = [...dailyMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]));
    let cumSum = 0;
    const dailyCumulative = sortedDates.map(([date, amount]) => {
      cumSum += amount;
      return { date, cumSpent: cumSum };
    });

    const net = totalIncome - totalSpent;
    const savingsRate = totalIncome > 0 ? (net / totalIncome) * 100 : 0;

    return {
      monthlyBreakdown,
      categoryBreakdown,
      paymentModeBreakdown,
      dailyCumulative,
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
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <AnalyticsFilterBar range={range} onRangeChange={setRange} />
      <AnalyticsKpiStrip totals={data.totals} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalyticsTrendChart monthlyBreakdown={data.monthlyBreakdown} />
        </div>
        <div className="lg:col-span-1">
          <AnalyticsCategoryChart categoryBreakdown={data.categoryBreakdown} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalyticsSpendTrend dailyCumulative={data.dailyCumulative} />
        </div>
        <div className="lg:col-span-1">
          <AnalyticsPaymentChart paymentModeBreakdown={data.paymentModeBreakdown} />
        </div>
      </div>
    </div>
  );
}
