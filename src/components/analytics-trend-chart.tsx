"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface AnalyticsTrendChartProps {
  monthlyBreakdown: {
    month: string;
    monthLabel: string;
    income: number;
    spent: number;
  }[];
}

function formatCompact(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

function formatFull(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

type TooltipPayloadEntry = {
  dataKey: string;
  value: number;
  color: string;
  name: string;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg backdrop-blur-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-semibold text-foreground">
              {formatFull(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsTrendChart({ monthlyBreakdown }: AnalyticsTrendChartProps) {
  return (
    <div className="card-glow flex h-full flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Income vs Expense
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Monthly comparison
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "var(--purple)" }}
            />
            Income
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "var(--orange)" }}
            />
            Expense
          </span>
        </div>
      </div>

      <div className="mt-5 flex-1">
        {monthlyBreakdown.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={monthlyBreakdown}
              margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
              barCategoryGap="28%"
              barGap={6}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="monthLabel"
                stroke="var(--muted-foreground)"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={formatCompact}
                width={56}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="var(--purple)"
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
              />
              <Bar
                dataKey="spent"
                name="Expense"
                fill="var(--orange)"
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
