import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listTransactions, type TransactionFilters, type TransactionType } from "@/app/actions/transactions-actions";
import { TransactionsPageHeader } from "@/components/transactions-page-header";
import { TransactionsFilterBar } from "@/components/transactions-filter-bar";
import { TransactionsList } from "@/components/transactions-list";

type Period = "all" | "this_month" | "last_month" | "last_3_months" | "this_year";

function getDateRangeFromPeriod(period: Period): { dateFrom?: string; dateTo?: string } {
  const now = new Date();
  const today = now.toISOString().split("T")[0]!;

  if (period === "all") return {};
  if (period === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { dateFrom: start.toISOString().split("T")[0] };
  }
  if (period === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      dateFrom: start.toISOString().split("T")[0],
      dateTo: end.toISOString().split("T")[0],
    };
  }
  if (period === "last_3_months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    return { dateFrom: start.toISOString().split("T")[0] };
  }
  if (period === "this_year") {
    const start = new Date(now.getFullYear(), 0, 1);
    return { dateFrom: start.toISOString().split("T")[0] };
  }

  return {};
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const params = await searchParams;
  const typeParam = params.type as string | undefined;
  const categoryParam = params.category as string | undefined;
  const periodParam = (params.period as Period | undefined) ?? "all";

  const type = typeParam && ["expense", "income"].includes(typeParam) ? (typeParam as TransactionType) : undefined;
  const dateRange = getDateRangeFromPeriod(periodParam);

  const filters: TransactionFilters = {
    type,
    category: categoryParam,
    ...dateRange,
  };

  const transactions = await listTransactions(filters);

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <TransactionsPageHeader />

        {/* Filter Bar */}
        <TransactionsFilterBar
          transactions={transactions}
          currentType={type}
          currentCategory={categoryParam}
          currentPeriod={periodParam}
        />

        {/* Transactions List */}
        <TransactionsList transactions={transactions} />
      </div>
    </div>
  );
}
