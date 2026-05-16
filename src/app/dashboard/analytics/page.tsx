import { getAllTransactionsRaw } from "@/app/actions/transactions-actions";
import { AnalyticsShell } from "@/components/analytics-shell";

export default async function AnalyticsPage() {
  const transactions = await getAllTransactionsRaw();

  if (transactions.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-foreground">No transactions yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start tracking your spending to see analytics.
          </p>
          <a
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-purple px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Add transaction
          </a>
        </div>
      </div>
    );
  }

  return <AnalyticsShell transactions={transactions} />;
}
