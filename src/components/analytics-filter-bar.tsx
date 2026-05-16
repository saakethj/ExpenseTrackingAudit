"use client";

type Range = "30d" | "3m" | "6m" | "12m" | "all";

const RANGE_OPTIONS: { label: string; value: Range }[] = [
  { label: "30D", value: "30d" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "12m" },
  { label: "All", value: "all" },
];

export interface AnalyticsFilterBarProps {
  range: Range;
  onRangeChange: (range: Range) => void;
}

export function AnalyticsFilterBar({ range, onRangeChange }: AnalyticsFilterBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Time range"
      className="inline-flex shrink-0 self-start rounded-full border border-border bg-card/60 p-1 backdrop-blur-xl sm:self-end"
    >
      {RANGE_OPTIONS.map((option) => {
        const active = range === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onRangeChange(option.value)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold tracking-wide transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4 sm:text-[13px] ${
              active
                ? "bg-purple text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
