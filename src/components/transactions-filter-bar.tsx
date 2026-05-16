"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import type { RecentTransaction, TransactionType } from "@/app/actions/transactions-actions";

type Period = "all" | "this_month" | "last_month" | "last_3_months" | "this_year";

interface TransactionsFilterBarProps {
  transactions: RecentTransaction[];
  currentType?: TransactionType;
  currentCategory?: string;
  currentPeriod: Period;
}

export function TransactionsFilterBar({
  transactions,
  currentType,
  currentCategory,
  currentPeriod,
}: TransactionsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("");
  }, [router]);

  // Derive unique categories from current transactions
  const categories = Array.from(new Set(transactions.map((t) => t.category))).sort();

  // Compute summary stats from filtered transactions
  const spent = transactions.reduce((sum, t) => (t.type === "expense" ? sum + t.amount : sum), 0);
  const income = transactions.reduce((sum, t) => (t.type === "income" ? sum + t.amount : sum), 0);

  const hasActiveFilters = currentType || currentCategory || currentPeriod !== "all";

  return (
    <div className="mb-6 space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Filter Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
        {/* Type Filter */}
        <select
          value={currentType ?? "all"}
          onChange={(e) => updateFilter("type", e.target.value === "all" ? null : e.target.value)}
          className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">Type: All</option>
          <option value="expense">Expenses only</option>
          <option value="income">Income only</option>
        </select>

        {/* Category Filter */}
        <select
          value={currentCategory ?? "all"}
          onChange={(e) => updateFilter("category", e.target.value === "all" ? null : e.target.value)}
          className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">Category: All</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Period Filter */}
        <select
          value={currentPeriod}
          onChange={(e) => updateFilter("period", e.target.value === "all" ? null : e.target.value)}
          className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">Period: All time</option>
          <option value="this_month">This month</option>
          <option value="last_month">Last month</option>
          <option value="last_3_months">Last 3 months</option>
          <option value="this_year">This year</option>
        </select>

        {/* Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="rounded bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="flex flex-wrap gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
        <span>
          Showing <strong className="text-foreground">{transactions.length}</strong> transaction{transactions.length !== 1 ? "s" : ""}
        </span>
        {spent > 0 && (
          <span>
            · <strong className="text-foreground">₹{spent.toLocaleString("en-IN")}</strong> spent
          </span>
        )}
        {income > 0 && (
          <span>
            · <strong className="text-foreground">₹{income.toLocaleString("en-IN")}</strong> income
          </span>
        )}
      </div>
    </div>
  );
}
