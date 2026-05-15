import { ArrowRight, Utensils, Car, Zap, ShoppingBag, Briefcase } from "lucide-react";

type TxType = "expense" | "income";

type Transaction = {
  id: string;
  label: string;
  category: string;
  date: string;
  amount: number;
  type: TxType;
  icon: React.ElementType;
};

const TRANSACTIONS: Transaction[] = [
  { id: "1", label: "Lunch — Cafe Noir",     category: "Food",      date: "May 14", amount: 24,  type: "expense", icon: Utensils },
  { id: "2", label: "Uber to office",        category: "Transport", date: "May 13", amount: 8,   type: "expense", icon: Car },
  { id: "3", label: "Electricity bill",      category: "Utilities", date: "May 12", amount: 95,  type: "expense", icon: Zap },
  { id: "4", label: "Freelance — Acme Co",   category: "Income",    date: "May 10", amount: 850, type: "income",  icon: Briefcase },
  { id: "5", label: "Groceries — BigBasket", category: "Food",      date: "May 9",  amount: 64,  type: "expense", icon: ShoppingBag },
];

function formatAmount(amount: number, type: TxType): string {
  const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount);
  return `${type === "income" ? "+" : "−"}₹${formatted}`;
}

export function DashboardRecentTransactions() {
  return (
    <section
      aria-label="Recent transactions"
      className="flex h-full flex-col rounded-2xl border border-border bg-card/60 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">Recent transactions</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Latest activity across all categories</p>
        </div>
        <button
          type="button"
          className="group inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        </button>
      </div>

      <ul className="flex-1 divide-y divide-border">
        {TRANSACTIONS.map((tx) => {
          const Icon = tx.icon;
          const isIncome = tx.type === "income";
          return (
            <li
              key={tx.id}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40 sm:gap-4 sm:px-6"
            >
              <span
                aria-hidden
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isIncome ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" : "bg-purple-soft text-purple"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2.25} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground sm:text-sm">
                  {tx.label}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {tx.category} · {tx.date}
                </p>
              </div>

              <span
                className={`shrink-0 text-[13px] font-semibold tabular-nums sm:text-sm ${
                  isIncome ? "text-emerald-500 dark:text-emerald-400" : "text-foreground"
                }`}
              >
                {formatAmount(tx.amount, tx.type)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
