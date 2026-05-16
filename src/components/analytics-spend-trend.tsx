"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface AnalyticsSpendTrendProps {
  dailyCumulative: { date: string; cumSpent: number }[];
}

export function AnalyticsSpendTrend({ dailyCumulative }: AnalyticsSpendTrendProps) {
  if (dailyCumulative.length === 0) {
    return (
      <div className="card-glow rounded-2xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground">Spending trend</h3>
        <div className="mt-6 flex items-center justify-center py-12 text-sm text-muted-foreground">
          No data for this period
        </div>
      </div>
    );
  }

  return (
    <div className="card-glow rounded-2xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground">Spending trend</h3>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={dailyCumulative}>
            <defs>
              <linearGradient id="colorCumSpent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
            />
            <Area
              type="monotone"
              dataKey="cumSpent"
              stroke="var(--purple)"
              fillOpacity={1}
              fill="url(#colorCumSpent)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
