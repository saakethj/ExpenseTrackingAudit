"use client";

type Range = "30d" | "3m" | "6m" | "12m" | "all";

const RANGE_OPTIONS: { label: string; value: Range }[] = [
  { label: "30 days", value: "30d" },
  { label: "3 months", value: "3m" },
  { label: "6 months", value: "6m" },
  { label: "1 year", value: "12m" },
  { label: "All time", value: "all" },
];

export interface AnalyticsFilterBarProps {
  range: Range;
  onRangeChange: (range: Range) => void;
}

export function AnalyticsFilterBar({ range, onRangeChange }: AnalyticsFilterBarProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onRangeChange(option.value)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              range === option.value
                ? "bg-purple text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
