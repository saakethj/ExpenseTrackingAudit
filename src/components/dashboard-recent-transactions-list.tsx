"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  Car,
  Zap,
  ShoppingBag,
  Briefcase,
  Tv,
  HeartPulse,
  Wallet,
  TrendingUp,
  Gift,
  Receipt,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import {
  AddTransactionModal,
  type TransactionInitialValues,
} from "./add-transaction-modal";
import type { RecentTransaction } from "@/app/actions/transactions-actions";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Food: Utensils,
  Transport: Car,
  Utilities: Zap,
  Shopping: ShoppingBag,
  Entertainment: Tv,
  Health: HeartPulse,
  Salary: Wallet,
  Freelance: Briefcase,
  Investment: TrendingUp,
  Gift: Gift,
};

function iconFor(category: string): React.ElementType {
  return CATEGORY_ICONS[category] ?? Receipt;
}

function formatAmount(amount: number, type: "expense" | "income"): string {
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(amount);
  return `${type === "income" ? "+" : "−"}₹${formatted}`;
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function labelFor(tx: { note: string | null; category: string }): string {
  return tx.note?.trim() || tx.category;
}

type ToastInfo = { kind: "saved" | "deleted"; message: string };

type Props = { transactions: RecentTransaction[] };

export function DashboardRecentTransactionsList({ transactions }: Props) {
  const [editing, setEditing] = React.useState<RecentTransaction | null>(null);
  const [toast, setToast] = React.useState<ToastInfo | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const initialValues: TransactionInitialValues | undefined = editing
    ? {
        type: editing.type,
        amount: editing.amount,
        category: editing.category,
        payment_mode: editing.payment_mode,
        date: editing.date,
        note: editing.note,
      }
    : undefined;

  return (
    <>
      <ul className="flex-1 divide-y divide-border">
        {transactions.map((tx) => {
          const Icon = iconFor(tx.category);
          const isIncome = tx.type === "income";
          return (
            <li key={tx.id}>
              <button
                type="button"
                onClick={() => setEditing(tx)}
                aria-label={`Edit ${labelFor(tx)}`}
                className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:gap-4 sm:px-6"
              >
                <span
                  aria-hidden
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isIncome
                      ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                      : "bg-purple-soft text-purple"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground sm:text-sm">
                    {labelFor(tx)}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {tx.category} · {formatDate(tx.date)}
                  </p>
                </div>

                <span
                  className={`shrink-0 text-[13px] font-semibold tabular-nums sm:text-sm ${
                    isIncome
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-foreground"
                  }`}
                >
                  {formatAmount(tx.amount, tx.type)}
                </span>

                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card/60 text-muted-foreground transition-colors duration-200 group-hover:border-purple/40 group-hover:bg-purple-soft group-hover:text-purple"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <AddTransactionModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        mode="edit"
        transactionId={editing?.id}
        initialValues={initialValues}
        onSaved={({ type, amount }) =>
          setToast({
            kind: "saved",
            message: `${type === "income" ? "Income" : "Expense"} updated · ${formatAmount(amount, type)}`,
          })
        }
        onDeleted={() =>
          setToast({ kind: "deleted", message: "Transaction deleted" })
        }
      />

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {toast && (
              <motion.div
                key="row-toast"
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                role="status"
                aria-live="polite"
                className={`fixed left-1/2 top-24 z-[300] flex -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-xl ${
                  toast.kind === "deleted"
                    ? "border-rose-500/30 bg-card/95 shadow-[0_8px_32px_-8px_rgba(244,63,94,0.4)]"
                    : "border-emerald-500/30 bg-card/95 shadow-[0_8px_32px_-8px_rgba(16,185,129,0.4)]"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    toast.kind === "deleted"
                      ? "bg-rose-500/10 text-rose-500"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <p className="text-[13px] font-semibold text-foreground">
                  {toast.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
