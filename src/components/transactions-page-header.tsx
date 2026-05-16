"use client";

import { useState } from "react";
import { AddTransactionModal } from "@/components/add-transaction-modal";

export function TransactionsPageHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="mt-1 text-muted-foreground">Your complete transaction history</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-purple px-4 py-2 text-sm font-medium text-white hover:bg-purple/90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          + Add Transaction
        </button>
      </div>

      <AddTransactionModal open={isOpen} onClose={() => setIsOpen(false)} mode="create" />
    </>
  );
}
