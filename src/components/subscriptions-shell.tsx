"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Repeat, Sparkles, Search, X, ArrowUpDown } from "lucide-react";
import type { SubscriptionWithDerived } from "@/app/actions/subscriptions-actions";
import { SubscriptionCard } from "./subscription-card";
import {
  SubscriptionFormModal,
  type SubscriptionInitialValues,
} from "./subscription-form-modal";

type Filter = "active" | "all" | "paused" | "cancelled";
type SortKey =
  | "renewal_asc"
  | "amount_desc"
  | "amount_asc"
  | "monthly_desc"
  | "name_asc";

type ToastInfo =
  | { kind: "saved"; name: string; mode: "create" | "edit" }
  | { kind: "deleted"; name: string };

type Props = {
  subscriptions: SubscriptionWithDerived[];
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "all", label: "All" },
  { id: "paused", label: "Paused" },
  { id: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "renewal_asc", label: "Next renewal" },
  { id: "amount_desc", label: "Amount: high → low" },
  { id: "amount_asc", label: "Amount: low → high" },
  { id: "monthly_desc", label: "Monthly cost" },
  { id: "name_asc", label: "Name (A → Z)" },
];

function formatAmount(n: number): string {
  return `₹${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: n < 100 ? 2 : 0,
  }).format(n)}`;
}

export function SubscriptionsShell({ subscriptions }: Props) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<Filter>("active");
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("renewal_asc");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [editingId, setEditingId] = React.useState<string | undefined>();
  const [initialValues, setInitialValues] = React.useState<
    SubscriptionInitialValues | undefined
  >();
  const [toast, setToast] = React.useState<ToastInfo | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = React.useMemo(() => {
    let list =
      filter === "all"
        ? subscriptions
        : subscriptions.filter((s) => s.status === filter);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((s) => {
        const name = s.name.toLowerCase();
        const cat = (s.category ?? "").toLowerCase();
        return name.includes(q) || cat.includes(q);
      });
    }

    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "amount_desc":
          return b.amount - a.amount;
        case "amount_asc":
          return a.amount - b.amount;
        case "monthly_desc":
          return b.monthly_cost - a.monthly_cost;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "renewal_asc":
        default:
          return a.next_billing_date.localeCompare(b.next_billing_date);
      }
    });
    return sorted;
  }, [subscriptions, filter, search, sort]);

  const stats = React.useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active");
    const monthlyTotal = active.reduce((sum, s) => sum + s.monthly_cost, 0);
    const annualTotal = active.reduce((sum, s) => sum + s.annual_cost, 0);
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const renewalsThisMonth = active.filter((s) => {
      const next = new Date(s.next_billing_date + "T00:00:00");
      return next >= now && next <= endOfMonth;
    }).length;
    return {
      activeCount: active.length,
      monthlyTotal,
      annualTotal,
      renewalsThisMonth,
    };
  }, [subscriptions]);

  function openCreate() {
    setMode("create");
    setEditingId(undefined);
    setInitialValues(undefined);
    setModalOpen(true);
  }

  function openEdit(sub: SubscriptionWithDerived) {
    setMode("edit");
    setEditingId(sub.id);
    setInitialValues({
      name: sub.name,
      amount: sub.amount,
      billing_cycle: sub.billing_cycle,
      next_billing_date: sub.next_billing_date,
      category: sub.category,
      payment_mode: sub.payment_mode,
      status: sub.status,
      notes: sub.notes,
    });
    setModalOpen(true);
  }

  const hasAnySubs = subscriptions.length > 0;

  return (
    <div className="w-full px-3 sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-1 py-10 sm:space-y-12 sm:px-2 sm:py-14 lg:py-16">
        {/* header */}
        <header className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:text-left">
          <div className="min-w-0 space-y-3">
            <span className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl">
              Subscriptions
            </span>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              Your{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
                }}
              >
                recurring
              </span>{" "}
              expenses
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Track services that bill you on a regular cycle — see what
              renews when, and how it all adds up.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-purple px-4 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-purple/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-5 sm:py-2.5 sm:text-[14px]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span>New Subscription</span>
          </button>
        </header>

        {/* stats strip */}
        {stats.activeCount > 0 && (
          <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              label="Active"
              value={String(stats.activeCount)}
              hint={
                stats.activeCount === 1 ? "subscription" : "subscriptions"
              }
            />
            <StatCard
              label="Monthly"
              value={formatAmount(stats.monthlyTotal)}
              hint="equivalent / mo"
            />
            <StatCard
              label="Annual"
              value={formatAmount(stats.annualTotal)}
              hint="projected / yr"
            />
            <StatCard
              label="This Month"
              value={String(stats.renewalsThisMonth)}
              hint={
                stats.renewalsThisMonth === 1 ? "renewal" : "renewals"
              }
            />
          </section>
        )}

        {/* search + sort */}
        {hasAnySubs && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or category"
                aria-label="Search subscriptions"
                className="input-glow w-full rounded-full border border-border bg-card/60 py-2 pl-9 pr-9 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.25} />
                </button>
              )}
            </div>

            <div className="relative flex items-center gap-2">
              <ArrowUpDown
                aria-hidden
                className="h-3.5 w-3.5 text-muted-foreground"
              />
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Sort
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort subscriptions"
                className="input-glow rounded-full border border-border bg-card/60 py-1.5 pl-3 pr-8 text-[12px] font-semibold text-foreground focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* filters */}
        {hasAnySubs && (
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map(({ id, label }) => {
              const count =
                id === "all"
                  ? subscriptions.length
                  : subscriptions.filter((s) => s.status === id).length;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    filter === id
                      ? "border-purple/60 bg-purple text-white"
                      : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                  <span
                    className={`rounded-full px-1.5 text-[10px] font-semibold ${
                      filter === id
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* grid / empty */}
        {hasAnySubs ? (
          filtered.length > 0 ? (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {filtered.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onEdit={openEdit}
                />
              ))}
            </section>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {search.trim()
                  ? `No subscriptions match "${search.trim()}".`
                  : "No subscriptions in this filter."}
              </p>
            </div>
          )
        ) : (
          <EmptyState onAdd={openCreate} />
        )}
      </div>

      <SubscriptionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        subscriptionId={editingId}
        initialValues={initialValues}
        onSaved={(info) => {
          setToast({ kind: "saved", name: info.name, mode: info.mode });
          router.refresh();
        }}
        onDeleted={(info) => {
          setToast({ kind: "deleted", name: info.name });
          router.refresh();
        }}
      />

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {toast && (
              <motion.div
                key="sub-toast"
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
                    {toast.kind === "deleted"
                      ? `${toast.name} removed`
                      : toast.mode === "edit"
                        ? `${toast.name} updated`
                        : `${toast.name} added`}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {toast.kind === "deleted"
                      ? "Subscription removed from your list"
                      : "Your subscriptions are up to date"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="card-glow rounded-2xl border border-border bg-card/60 px-4 py-4 backdrop-blur-xl sm:px-5 sm:py-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-soft text-purple">
        <Repeat className="h-6 w-6" strokeWidth={2} aria-hidden />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-foreground">
        No subscriptions yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Add Netflix, Spotify, your gym membership — anything that bills you
        on a recurring cycle. We&apos;ll keep tabs on the totals.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple px-4 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-purple/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Sparkles className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        <span>Add your first subscription</span>
      </button>
    </div>
  );
}
