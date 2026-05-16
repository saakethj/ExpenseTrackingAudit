"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

export interface AnalyticsKpiStripProps {
  totals: {
    income: number;
    spent: number;
    net: number;
    savingsRate: number;
  };
}

function formatCurrency(amount: number): string {
  return `₹${Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function AnalyticsKpiStrip({ totals }: AnalyticsKpiStripProps) {
  const kpis = [
    {
      label: "Income",
      value: formatCurrency(totals.income),
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Spent",
      value: formatCurrency(totals.spent),
      icon: TrendingDown,
      color: "text-red-500",
    },
    {
      label: "Net",
      value: formatCurrency(totals.net),
      icon: null,
      color: totals.net >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      label: "Savings rate",
      value: `${totals.savingsRate.toFixed(1)}%`,
      icon: null,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="card-glow rounded-2xl border border-border bg-card px-4 py-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                <p className={`mt-2 text-lg font-semibold ${kpi.color}`}>
                  {kpi.value}
                </p>
              </div>
              {Icon && <Icon className={`h-4 w-4 shrink-0 ${kpi.color}`} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
