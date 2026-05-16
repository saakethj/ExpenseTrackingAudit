"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Pencil, Calendar, AlertCircle } from "lucide-react";
import type { SubscriptionWithDerived } from "@/app/actions/subscriptions-actions";

type Props = {
  subscription: SubscriptionWithDerived;
  onEdit: (subscription: SubscriptionWithDerived) => void;
};

const CYCLE_LABEL: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

function formatAmount(n: number): string {
  return `₹${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: n < 100 ? 2 : 0,
  }).format(n)}`;
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renewalChip(days: number, status: string): {
  label: string;
  tone: "good" | "warn" | "over" | "muted";
} {
  if (status !== "active") {
    return { label: status === "paused" ? "Paused" : "Cancelled", tone: "muted" };
  }
  if (days < 0) return { label: `Overdue by ${Math.abs(days)}d`, tone: "over" };
  if (days === 0) return { label: "Due today", tone: "over" };
  if (days <= 7) return { label: `in ${days} day${days === 1 ? "" : "s"}`, tone: "warn" };
  return { label: `in ${days} days`, tone: "good" };
}

const TONE_CLASSES: Record<
  "good" | "warn" | "over" | "muted",
  string
> = {
  good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
  warn: "border-orange/40 bg-orange/10 text-orange",
  over: "border-rose-500/40 bg-rose-500/10 text-rose-500 dark:text-rose-400",
  muted: "border-border bg-muted/40 text-muted-foreground",
};

const STATUS_CLASSES: Record<string, string> = {
  active: "border-purple/40 bg-purple-soft text-purple",
  paused: "border-border bg-muted/40 text-muted-foreground",
  cancelled: "border-border bg-muted/40 text-muted-foreground line-through",
};

export function SubscriptionCard({ subscription, onEdit }: Props) {
  const chip = renewalChip(
    subscription.days_until_renewal,
    subscription.status
  );
  const initial = (subscription.name?.[0] ?? "?").toUpperCase();
  const cycleLabel = CYCLE_LABEL[subscription.billing_cycle] ?? subscription.billing_cycle;
  const isCancelled = subscription.status === "cancelled";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="card-glow group relative flex h-full flex-col gap-4 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl"
    >
      <button
        type="button"
        onClick={() => onEdit(subscription)}
        aria-label={`Edit ${subscription.name}`}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card/80 text-muted-foreground opacity-0 transition-all duration-150 hover:border-purple/40 hover:bg-purple-soft hover:text-purple focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>

      {/* header: avatar + name + cycle */}
      <div className="flex items-start gap-3 pr-10">
        <div
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-soft text-base font-bold text-purple"
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={`truncate text-base font-semibold leading-tight tracking-tight text-foreground ${
              isCancelled ? "line-through opacity-70" : ""
            }`}
          >
            {subscription.name}
          </h3>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {cycleLabel}
            {subscription.category ? ` · ${subscription.category}` : ""}
          </p>
        </div>
      </div>

      {/* amount + monthly equivalent */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {formatAmount(subscription.amount)}
        </span>
        {subscription.billing_cycle !== "monthly" && (
          <span className="text-[11px] text-muted-foreground">
            ≈ {formatAmount(subscription.monthly_cost)}/mo
          </span>
        )}
      </div>

      {/* renewal */}
      <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <div className="flex min-w-0 items-center gap-2 text-[12px] text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{formatDate(subscription.next_billing_date)}</span>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TONE_CLASSES[chip.tone]}`}
        >
          {chip.tone === "over" && <AlertCircle className="h-3 w-3" aria-hidden />}
          {chip.label}
        </span>
      </div>

      {/* status pill */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            STATUS_CLASSES[subscription.status] ?? STATUS_CLASSES.active
          }`}
        >
          {subscription.status}
        </span>
        <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
          {subscription.payment_mode}
        </span>
      </div>
    </motion.div>
  );
}
