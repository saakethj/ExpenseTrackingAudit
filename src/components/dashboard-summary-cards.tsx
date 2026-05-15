import { ArrowDownRight, ArrowUpRight, Wallet, TrendingDown, TrendingUp, PiggyBank } from "lucide-react";

type Trend = "up" | "down" | "flat";

type Card = {
  label: string;
  value: string;
  sub: string;
  trend: Trend;
  delta: string;
  icon: React.ElementType;
  tone: "neutral" | "expense" | "income" | "savings";
};

const CARDS: Card[] = [
  {
    label: "Net this month",
    value: "+₹2,400",
    sub: "Income minus spend",
    trend: "up",
    delta: "12%",
    icon: Wallet,
    tone: "neutral",
  },
  {
    label: "Spent",
    value: "₹1,850",
    sub: "Across 14 transactions",
    trend: "down",
    delta: "5%",
    icon: TrendingDown,
    tone: "expense",
  },
  {
    label: "Income",
    value: "₹4,250",
    sub: "From 2 sources",
    trend: "up",
    delta: "3%",
    icon: TrendingUp,
    tone: "income",
  },
  {
    label: "Savings rate",
    value: "56%",
    sub: "Of income kept",
    trend: "up",
    delta: "8%",
    icon: PiggyBank,
    tone: "savings",
  },
];

function trendStyles(trend: Trend, tone: Card["tone"]) {
  // For "Spent": a *decrease* (trend down) is actually good news; flip the semantic.
  const positive = tone === "expense" ? trend === "down" : trend === "up";
  if (trend === "flat") return "text-muted-foreground";
  return positive ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400";
}

export function DashboardSummaryCards() {
  return (
    <section
      aria-label="Monthly summary"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
    >
      {CARDS.map((c) => {
        const Icon = c.icon;
        const Arrow = c.trend === "up" ? ArrowUpRight : ArrowDownRight;
        const tStyle = trendStyles(c.trend, c.tone);
        return (
          <div
            key={c.label}
            className="card-glow group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {c.label}
              </span>
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-soft text-purple transition-transform duration-200 group-hover:scale-105"
              >
                <Icon className="h-4 w-4" strokeWidth={2.25} />
              </span>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-[26px]">
              {c.value}
            </p>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="truncate text-[11px] leading-snug text-muted-foreground">
                {c.sub}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${tStyle}`}
              >
                <Arrow className="h-3 w-3" strokeWidth={2.5} />
                {c.delta}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
