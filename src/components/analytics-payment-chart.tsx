"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export interface AnalyticsPaymentChartProps {
  paymentModeBreakdown: { mode: string; amount: number; count: number }[];
}

const PAYMENT_COLORS: Record<string, string> = {
  cash: "var(--purple)",
  card: "var(--orange)",
  upi: "#3b82f6",
  bank: "#10b981",
  other: "#6b7280",
};

export function AnalyticsPaymentChart({ paymentModeBreakdown }: AnalyticsPaymentChartProps) {
  if (paymentModeBreakdown.length === 0) {
    return (
      <div className="card-glow rounded-2xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground">Payment mode</h3>
        <div className="mt-6 flex items-center justify-center py-12 text-sm text-muted-foreground">
          No data for this period
        </div>
      </div>
    );
  }

  const totalCount = paymentModeBreakdown.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="card-glow rounded-2xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground">Payment mode</h3>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={paymentModeBreakdown}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="count"
              label={false}
            >
              {paymentModeBreakdown.map((entry) => (
                <Cell key={entry.mode} fill={PAYMENT_COLORS[entry.mode] || "#6b7280"} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => `${value} transaction${value > 1 ? "s" : ""}`}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <p className="text-2xl font-semibold text-foreground">{totalCount}</p>
          <p className="text-xs text-muted-foreground">total transactions</p>
        </div>
      </div>
    </div>
  );
}
