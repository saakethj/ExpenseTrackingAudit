import { ArrowRight, Inbox } from "lucide-react";
import { listRecentTransactions } from "@/app/actions/transactions-actions";
import { DashboardRecentTransactionsList } from "./dashboard-recent-transactions-list";

export async function DashboardRecentTransactions() {
  const transactions = await listRecentTransactions(5);

  return (
    <section
      aria-label="Recent transactions"
      className="flex h-full flex-col rounded-2xl border border-border bg-card/60 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">Recent transactions</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Latest activity across all categories
          </p>
        </div>
        <button
          type="button"
          className="group inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View all
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <span
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
          >
            <Inbox className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="space-y-1">
            <p className="text-[13px] font-semibold text-foreground">No transactions yet</p>
            <p className="text-[11px] text-muted-foreground">
              Add your first transaction above to see it here.
            </p>
          </div>
        </div>
      ) : (
        <DashboardRecentTransactionsList transactions={transactions} />
      )}
    </section>
  );
}
