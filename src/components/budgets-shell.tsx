"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Wallet, CheckCircle2, AlertTriangle } from "lucide-react";
import type { BudgetWithSpend } from "@/app/actions/budgets-actions";
import { BudgetCard } from "./budget-card";
import { BudgetFormModal, type BudgetInitialValues } from "./budget-form-modal";

type Filter = "active" | "all" | "past";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "all", label: "All" },
  { id: "past", label: "Past" },
];

export interface BudgetsShellProps {
  initialBudgets: BudgetWithSpend[];
  initialError: string | null;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0]!;
}

function formatCurrency(amount: number): string {
  return `₹${Math.round(Math.abs(amount)).toLocaleString("en-IN")}`;
}

export function BudgetsShell({
  initialBudgets,
  initialError,
}: BudgetsShellProps) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<Filter>("active");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BudgetWithSpend | null>(null);
  const [toast, setToast] = React.useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const today = todayISO();

  const filtered = React.useMemo(() => {
    if (filter === "all") return initialBudgets;
    if (filter === "active") {
      return initialBudgets.filter(
        (b) => b.period_start <= today && b.period_end >= today
      );
    }
    return initialBudgets.filter((b) => b.period_end < today);
  }, [initialBudgets, filter, today]);

  const stats = React.useMemo(() => {
    const active = initialBudgets.filter(
      (b) => b.period_start <= today && b.period_end >= today
    );
    const totalLimit = active.reduce((s, b) => s + b.limit_amount, 0);
    const totalSpent = active.reduce((s, b) => s + b.current_spent, 0);
    const overCount = active.filter((b) => b.is_over).length;
    const onTrackCount = active.filter((b) => !b.is_over).length;
    return { activeCount: active.length, totalLimit, totalSpent, overCount, onTrackCount };
  }, [initialBudgets, today]);

  function handleNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleEdit(budget: BudgetWithSpend) {
    setEditing(budget);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditing(null);
  }

  function handleSaved(info: { mode: "create" | "edit" }) {
    setToast({
      type: "success",
      msg: info.mode === "edit" ? "Budget updated" : "Budget created",
    });
    router.refresh();
  }

  function handleDeleted() {
    setToast({ type: "success", msg: "Budget deleted" });
    router.refresh();
  }

  const editInitial: BudgetInitialValues | undefined = editing
    ? {
        category: editing.category,
        limit_amount: editing.limit_amount,
        period_type: editing.period_type,
        period_start: editing.period_start,
        period_end: editing.period_end,
      }
    : undefined;

  return (
    <div className="w-full px-3 sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-1 py-10 sm:space-y-10 sm:px-2 sm:py-14 lg:py-16">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <span className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl">
              Budgets
            </span>
            <h1 className="break-words text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              Set{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
                }}
              >
                limits
              </span>{" "}
              that work for you
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Track spending against per-category or overall limits. Set one per
              period — past budgets stay around for history.
            </p>
          </div>

          <button
            type="button"
            onClick={handleNew}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-all duration-150 hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-end"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--purple) 80%, black) 0%, var(--purple) 100%)",
            }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New Budget
          </button>
        </header>

        {initialError && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-[13px] font-medium text-rose-500">
            {initialError}
          </div>
        )}

        {/* Stats strip — only shows when there are active budgets */}
        {stats.activeCount > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <StatCard
              label="Active budgets"
              value={String(stats.activeCount)}
              icon={<Wallet className="h-3.5 w-3.5" />}
              iconClass="text-purple bg-purple-soft"
            />
            <StatCard
              label="Total limit"
              value={formatCurrency(stats.totalLimit)}
              icon={<Wallet className="h-3.5 w-3.5" />}
              iconClass="text-orange bg-orange-soft"
            />
            <StatCard
              label="Total spent"
              value={formatCurrency(stats.totalSpent)}
              icon={<Wallet className="h-3.5 w-3.5" />}
              iconClass="text-muted-foreground bg-muted"
            />
            {stats.overCount > 0 ? (
              <StatCard
                label="Over budget"
                value={String(stats.overCount)}
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
                iconClass="text-rose-500 bg-rose-500/10"
                valueClass="text-rose-500"
              />
            ) : (
              <StatCard
                label="On track"
                value={String(stats.onTrackCount)}
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                iconClass="text-emerald-500 bg-emerald-500/10"
                valueClass="text-emerald-500"
              />
            )}
          </div>
        )}

        {/* Filter pills */}
        {initialBudgets.length > 0 && (
          <div className="flex justify-start sm:justify-end">
            <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card/60 p-1 backdrop-blur-xl">
              {FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all sm:px-4 sm:text-[13px] ${
                      active
                        ? "bg-purple text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Budget grid or empty state */}
        {initialBudgets.length === 0 ? (
          <EmptyState onNew={handleNew} />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No {filter} budgets to show.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {filtered.map((b) => (
              <BudgetCard key={b.id} budget={b} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>

      <BudgetFormModal
        open={modalOpen}
        onClose={handleClose}
        mode={editing ? "edit" : "create"}
        budgetId={editing?.id}
        initialValues={editInitial}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl border px-4 py-2.5 text-[13px] font-semibold shadow-lg backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-rose-500/40 bg-rose-500/10 text-rose-500"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconClass,
  valueClass,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="card-glow rounded-2xl border border-border bg-card px-4 py-5 sm:px-5 sm:py-6">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </span>
      </div>
      <p
        className={`mt-3 text-2xl font-semibold tracking-tight sm:text-[26px] ${
          valueClass ?? "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="card-glow rounded-3xl border border-dashed border-border bg-card/40 px-6 py-14 text-center sm:px-10 sm:py-16">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-soft">
        <Wallet className="h-6 w-6 text-purple" strokeWidth={2} />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-foreground sm:text-xl">
        No budgets yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Set spending limits per category or for the whole period. Stay on track,
        see what&apos;s left, and review your history later.
      </p>
      <button
        type="button"
        onClick={onNew}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-150 hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--purple) 80%, black) 0%, var(--purple) 100%)",
        }}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Create your first budget
      </button>
    </div>
  );
}
