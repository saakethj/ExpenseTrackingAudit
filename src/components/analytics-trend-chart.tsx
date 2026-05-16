"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface AnalyticsTrendChartProps {
  monthlyBreakdown: { month: string; income: number; spent: number }[];
}

export function AnalyticsTrendChart({ monthlyBreakdown }: AnalyticsTrendChartProps) {
  if (monthlyBreakdown.length === 0) {
    return (
      <div className="card-glow rounded-2xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground">Income vs Expense</h3>
        <div className="mt-6 flex items-center justify-center py-12 text-sm text-muted-foreground">
          No data for this period
        </div>
      </div>
    );
  }

  return (
    <div className="card-glow rounded-2xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground">Income vs Expense</h3>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyBreakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
            <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
            />
            <Legend />
            <Bar dataKey="income" fill="var(--purple)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spent" fill="var(--orange)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
