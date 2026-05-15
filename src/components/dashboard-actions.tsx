"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Upload, CheckCircle2 } from "lucide-react";
import { AddTransactionModal } from "./add-transaction-modal";

type ToastInfo = { type: "expense" | "income"; amount: number };

function formatAmount(n: number): string {
  return `₹${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)}`;
}

export function DashboardActions() {
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState<ToastInfo | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <section className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:text-left">
      <div className="min-w-0 space-y-3">
        <span className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl">
          Quick Actions
        </span>

        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          Manage your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
            }}
          >
            money
          </span>
        </h2>

        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Add transactions one at a time, or import an entire bank statement to
          get started faster.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2.5 sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-purple px-4 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-purple/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-5 sm:py-2.5 sm:text-[14px]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          <span>Add Transaction</span>
        </button>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Coming soon"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-[13px] font-semibold text-muted-foreground backdrop-blur-xl sm:px-5 sm:py-2.5 sm:text-[14px]"
        >
          <Upload className="h-4 w-4" strokeWidth={2.25} />
          <span>Import CSV</span>
          <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:ml-1 sm:px-2 sm:text-[10px]">
            Soon
          </span>
        </button>
      </div>

      <AddTransactionModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={({ type, amount }) => setToast({ type, amount })}
      />

      {typeof window !== "undefined" &&
        createPortal(
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
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500"
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
    </section>
  );
}
