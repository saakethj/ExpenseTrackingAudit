"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export interface AnalyticsCategoryChartProps {
  categoryBreakdown: { label: string; amount: number; pct: number }[];
}

const COLORS = [
  "var(--purple)",
  "var(--orange)",
  "#3b82f6",
  "#ec4899",
  "#06b6d4",
  "#eab308",
  "#f59e0b",
  "#10b981",
];

export function AnalyticsCategoryChart({ categoryBreakdown }: AnalyticsCategoryChartProps) {
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  if (categoryBreakdown.length === 0) {
    return (
      <div className="card-glow rounded-2xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground">Category breakdown</h3>
        <div className="mt-6 flex items-center justify-center py-12 text-sm text-muted-foreground">
          No expenses to show
        </div>
      </div>
    );
  }

  return (
    <div className="card-glow rounded-2xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground">Category breakdown</h3>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
                onMouseEnter={(_, index) => setActiveCategory(categoryBreakdown[index].label)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={!activeCategory || activeCategory === entry.label ? 1 : 0.4}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {categoryBreakdown.map((category, index) => (
            <div
              key={category.label}
              onMouseEnter={() => setActiveCategory(category.label)}
              onMouseLeave={() => setActiveCategory(null)}
              className={`rounded-lg px-3 py-2 transition-colors ${
                !activeCategory || activeCategory === category.label
                  ? "bg-muted/40"
                  : "opacity-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate text-xs font-medium text-foreground">
                    {category.label}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {category.pct.toFixed(0)}%
                </span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full"
                  style={{
                    width: `${category.pct}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
