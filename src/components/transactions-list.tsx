"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { RecentTransaction } from "@/app/actions/transactions-actions";
import { AddTransactionModal } from "@/components/add-transaction-modal";

interface TransactionsListProps {
  transactions: RecentTransaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<RecentTransaction | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No transactions found. Start by adding or importing transactions.</p>
      </div>
    );
  }

  const handleRowClick = (transaction: RecentTransaction) => {
    setEditingTransaction(transaction);
    setEditingId(transaction.id);
  };

  const handleEditClose = () => {
    setEditingId(null);
    setEditingTransaction(null);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Description</th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">Amount</th>
              <th className="w-12 px-4 py-3 text-right font-semibold text-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => handleRowClick(transaction)}
              >
                <td className="px-4 py-3 text-foreground">
                  {new Date(transaction.date + "T00:00:00").toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{transaction.note || transaction.category}</div>
                  <div className="text-xs text-muted-foreground">{transaction.category}</div>
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  <span className={transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-rose-600 dark:text-rose-400"}>
                    {transaction.type === "income" ? "+" : "−"}₹{transaction.amount.toLocaleString("en-IN")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(transaction);
                    }}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-purple hover:bg-purple/10 focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Edit transaction"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <AddTransactionModal
        open={editingId !== null}
        mode="edit"
        transactionId={editingId || ""}
        initialValues={
          editingTransaction
            ? {
                type: editingTransaction.type,
                amount: editingTransaction.amount,
                category: editingTransaction.category,
                payment_mode: editingTransaction.payment_mode,
                date: editingTransaction.date,
                note: editingTransaction.note || null,
              }
            : undefined
        }
        onClose={handleEditClose}
        onDeleted={() => handleEditClose()}
      />
    </>
  );
}
