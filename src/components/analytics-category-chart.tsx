"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export interface AnalyticsCategoryChartProps {
  categoryBreakdown: { label: string; amount: number; pct: number }[];
  totalSpent: number;
}

const COLORS = [
  "var(--purple)",
  "var(--orange)",
  "#60a5fa",
  "#34d399",
  "#f472b6",
  "#22d3ee",
  "#fbbf24",
  "#a3a3a3",
  "#94a3b8",
];

function formatCompact(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${Math.round(value)}`;
}

export function AnalyticsCategoryChart({
  categoryBreakdown,
  totalSpent,
}: AnalyticsCategoryChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  if (categoryBreakdown.length === 0) {
    return (
      <div className="card-glow flex h-full flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 className="text-base font-semibold text-foreground">
          Category breakdown
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Where your money went</p>
        <div className="mt-6 flex flex-1 items-center justify-center py-10 text-sm text-muted-foreground">
          No expenses to show
        </div>
      </div>
    );
  }

  return (
    <div className="card-glow flex h-full flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h3 className="text-base font-semibold text-foreground">
        Category breakdown
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Where your money went</p>

      <div className="relative mx-auto mt-4 h-[180px] w-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryBreakdown}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={1.5}
              dataKey="amount"
              stroke="none"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {categoryBreakdown.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={
                    activeIndex === null || activeIndex === index ? 1 : 0.35
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {activeIndex !== null ? categoryBreakdown[activeIndex].label : "Total"}
          </span>
          <span className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
            {formatCompact(
              activeIndex !== null
                ? categoryBreakdown[activeIndex].amount
                : totalSpent
            )}
          </span>
          {activeIndex !== null && (
            <span className="text-[10px] text-muted-foreground">
              {categoryBreakdown[activeIndex].pct.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      <ul className="mt-5 max-h-56 space-y-2 overflow-y-auto pr-1 scrollbar-none">
        {categoryBreakdown.map((category, index) => {
          const dimmed = activeIndex !== null && activeIndex !== index;
          return (
            <li
              key={category.label}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`group rounded-lg px-2 py-1.5 transition-opacity ${
                dimmed ? "opacity-40" : "opacity-100"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate text-[13px] font-medium text-foreground">
                    {category.label}
                  </span>
                </div>
                <div className="flex shrink-0 items-baseline gap-2">
                  <span className="text-[12px] font-semibold text-foreground">
                    {formatCompact(category.amount)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {category.pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
