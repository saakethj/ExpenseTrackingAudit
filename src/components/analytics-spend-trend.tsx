"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface AnalyticsSpendTrendProps {
  dailyCumulative: { date: string; dateLabel: string; cumSpent: number }[];
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
      <p className="mt-1 text-sm font-semibold text-foreground">
        {formatFull(payload[0].value)}
      </p>
      <p className="text-[10px] text-muted-foreground">cumulative spend</p>
    </div>
  );
}

export function AnalyticsSpendTrend({ dailyCumulative }: AnalyticsSpendTrendProps) {
  if (dailyCumulative.length === 0) {
    return (
      <div className="card-glow flex h-full flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 className="text-base font-semibold text-foreground">Spending trend</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Cumulative expenses over time
        </p>
        <div className="mt-6 flex h-[260px] items-center justify-center text-sm text-muted-foreground">
          No data for this period
        </div>
      </div>
    );
  }

  const total = dailyCumulative[dailyCumulative.length - 1].cumSpent;
  const tickInterval = Math.max(
    0,
    Math.floor(dailyCumulative.length / 6) - 1
  );

  return (
    <div className="card-glow flex h-full flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Spending trend
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cumulative expenses over time
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Period total
          </p>
          <p className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
            {formatFull(total)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex-1">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={dailyCumulative}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCumSpent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--purple)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="dateLabel"
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              interval={tickInterval}
              minTickGap={20}
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
              cursor={{ stroke: "var(--purple)", strokeOpacity: 0.4, strokeWidth: 1 }}
              content={<CustomTooltip />}
            />
            <Area
              type="monotone"
              dataKey="cumSpent"
              stroke="var(--purple)"
              strokeWidth={2}
              fill="url(#colorCumSpent)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
