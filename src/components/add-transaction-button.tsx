"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronRight, CheckCircle2 } from "lucide-react";
import { AddTransactionModal } from "./add-transaction-modal";

type ToastInfo = { type: "expense" | "income"; amount: number };

function formatAmount(n: number): string {
  return `₹${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)}`;
}

export function AddTransactionButton() {
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState<ToastInfo | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex w-full shrink-0 items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card/60 px-5 py-4 text-left backdrop-blur-xl transition-all duration-200 hover:-translate-y-[1px] hover:border-purple/40 hover:shadow-[0_4px_24px_-6px_var(--purple)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:min-w-[280px]"
      >
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-soft text-purple transition-transform duration-200 group-hover:scale-105"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-tight text-foreground">
            Add Transaction
          </span>
          <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
            Log a new expense or income
          </span>
        </span>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden
        />
      </button>

      <AddTransactionModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={(info) => setToast(info)}
      />

      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {toast && (
            <motion.div
              key="tx-toast"
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="status"
              aria-live="polite"
              className="fixed left-1/2 top-24 z-[300] flex -translate-x-1/2 items-center gap-3 rounded-xl border border-emerald-500/30 bg-card/95 px-4 py-3 shadow-[0_8px_32px_-8px_rgba(16,185,129,0.4)] backdrop-blur-xl"
            >
              <span
                aria-hidden
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  toast.type === "expense"
                    ? "bg-rose-500/10 text-rose-500"
                    : "bg-emerald-500/10 text-emerald-500"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground">
                  {toast.type === "expense" ? "Expense" : "Income"} saved
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatAmount(toast.amount)} added to your records
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
