import { Utensils, Car, Zap, Film, ShoppingBag } from "lucide-react";

type CategorySlice = {
  label: string;
  amount: number;
  icon: React.ElementType;
};

const TOTAL = 1850;

const CATEGORIES: CategorySlice[] = [
  { label: "Food",          amount: 620, icon: Utensils },
  { label: "Utilities",     amount: 420, icon: Zap },
  { label: "Transport",     amount: 310, icon: Car },
  { label: "Shopping",      amount: 280, icon: ShoppingBag },
  { label: "Entertainment", amount: 220, icon: Film },
];

function formatAmount(n: number): string {
  return `₹${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)}`;
}

export function DashboardCategoryBreakdown() {
  return (
    <section
      aria-label="Spend by category"
      className="flex h-full flex-col rounded-2xl border border-border bg-card/60 backdrop-blur-xl"
    >
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold text-foreground">This month by category</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Where your {formatAmount(TOTAL)} went
        </p>
      </div>

      <ul className="flex flex-1 flex-col justify-between gap-4 px-5 py-5 sm:px-6 sm:py-6">
        {CATEGORIES.map((c) => {
          const pct = Math.round((c.amount / TOTAL) * 100);
          const Icon = c.icon;
          return (
            <li key={c.label}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-soft text-purple"
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </span>
                  <span className="truncate text-[12px] font-medium text-foreground">
                    {c.label}
                  </span>
                </div>
                <div className="flex shrink-0 items-baseline gap-2 tabular-nums">
                  <span className="text-[12px] font-semibold text-foreground">
                    {formatAmount(c.amount)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{pct}%</span>
                </div>
              </div>

              <div
                className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${c.label} ${pct} percent of total spend`}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background:
                      "linear-gradient(90deg, var(--purple) 0%, var(--orange) 100%)",
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
