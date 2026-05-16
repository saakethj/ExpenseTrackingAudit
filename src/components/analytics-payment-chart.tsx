"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export interface AnalyticsPaymentChartProps {
  paymentModeBreakdown: { mode: string; amount: number; count: number }[];
}

const PAYMENT_COLORS: Record<string, string> = {
  cash: "var(--purple)",
  card: "var(--orange)",
  upi: "#60a5fa",
  bank: "#34d399",
  other: "#94a3b8",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  bank: "Bank",
  other: "Other",
};

export function AnalyticsPaymentChart({
  paymentModeBreakdown,
}: AnalyticsPaymentChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  if (paymentModeBreakdown.length === 0) {
    return (
      <div className="card-glow flex h-full flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 className="text-base font-semibold text-foreground">Payment mode</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">How you paid</p>
        <div className="mt-6 flex flex-1 items-center justify-center py-10 text-sm text-muted-foreground">
          No data for this period
        </div>
      </div>
    );
  }

  const totalCount = paymentModeBreakdown.reduce((s, p) => s + p.count, 0);
  const data = paymentModeBreakdown.map((p) => ({
    ...p,
    pct: totalCount > 0 ? (p.count / totalCount) * 100 : 0,
  }));

  return (
    <div className="card-glow flex h-full flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h3 className="text-base font-semibold text-foreground">Payment mode</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">How you paid</p>

      <div className="relative mx-auto mt-4 h-[180px] w-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={1.5}
              dataKey="count"
              stroke="none"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.mode}
                  fill={PAYMENT_COLORS[entry.mode] ?? "#94a3b8"}
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
            {activeIndex !== null
              ? PAYMENT_LABELS[data[activeIndex].mode] ?? data[activeIndex].mode
              : "Total"}
          </span>
          <span className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
            {activeIndex !== null ? data[activeIndex].count : totalCount}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {activeIndex !== null
              ? `${data[activeIndex].pct.toFixed(1)}%`
              : `transaction${totalCount === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-2">
        {data.map((entry, index) => {
          const dimmed = activeIndex !== null && activeIndex !== index;
          return (
            <li
              key={entry.mode}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-opacity ${
                dimmed ? "opacity-40" : "opacity-100"
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: PAYMENT_COLORS[entry.mode] ?? "#94a3b8",
                }}
              />
              <span className="truncate text-[12px] font-medium text-foreground">
                {PAYMENT_LABELS[entry.mode] ?? entry.mode}
              </span>
              <span className="ml-auto text-[11px] text-muted-foreground">
                {entry.pct.toFixed(0)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
