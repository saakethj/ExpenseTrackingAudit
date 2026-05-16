"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Trash2,
  Banknote,
  CreditCard,
  Smartphone,
  Building2,
  MoreHorizontal,
} from "lucide-react";
import {
  addSubscription,
  updateSubscription,
  deleteSubscription,
  type SubscriptionBillingCycle,
  type SubscriptionStatus,
  type SubscriptionPaymentMode,
  type AddSubscriptionInput,
} from "@/app/actions/subscriptions-actions";

const BILLING_CYCLES: { id: SubscriptionBillingCycle; label: string }[] = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Yearly" },
];

const PAYMENT_MODES: {
  id: SubscriptionPaymentMode;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "bank", label: "Bank", icon: Building2 },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

const STATUSES: { id: SubscriptionStatus; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "cancelled", label: "Cancelled" },
];

function todayISO(): string {
  return new Date().toISOString().split("T")[0]!;
}

export type SubscriptionInitialValues = {
  name: string;
  amount: number;
  billing_cycle: SubscriptionBillingCycle;
  next_billing_date: string;
  category: string | null;
  payment_mode: SubscriptionPaymentMode;
  status: SubscriptionStatus;
  notes: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  subscriptionId?: string;
  initialValues?: SubscriptionInitialValues;
  onSaved?: (info: {
    name: string;
    mode: "create" | "edit";
  }) => void;
  onDeleted?: (info: { id: string; name: string }) => void;
};

export function SubscriptionFormModal({
  open,
  onClose,
  mode = "create",
  subscriptionId,
  initialValues,
  onSaved,
  onDeleted,
}: Props) {
  const isEdit = mode === "edit";

  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [billingCycle, setBillingCycle] =
    React.useState<SubscriptionBillingCycle>("monthly");
  const [nextBillingDate, setNextBillingDate] = React.useState(todayISO());
  const [category, setCategory] = React.useState("");
  const [paymentMode, setPaymentMode] =
    React.useState<SubscriptionPaymentMode>("card");
  const [status, setStatus] = React.useState<SubscriptionStatus>("active");
  const [notes, setNotes] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    if (isEdit && initialValues) {
      setName(initialValues.name);
      setAmount(String(initialValues.amount));
      setBillingCycle(initialValues.billing_cycle);
      setNextBillingDate(initialValues.next_billing_date);
      setCategory(initialValues.category ?? "");
      setPaymentMode(initialValues.payment_mode);
      setStatus(initialValues.status);
      setNotes(initialValues.notes ?? "");
      setSubmitError(null);
      setConfirmDelete(false);
    }
  }, [open, isEdit, initialValues]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function reset() {
    setName("");
    setAmount("");
    setBillingCycle("monthly");
    setNextBillingDate(todayISO());
    setCategory("");
    setPaymentMode("card");
    setStatus("active");
    setNotes("");
    setSubmitError(null);
    setConfirmDelete(false);
  }

  function handleClose() {
    if (!isEdit) reset();
    setConfirmDelete(false);
    setSubmitError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError("Please enter a name.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setSubmitError("Amount must be greater than zero.");
      return;
    }
    if (!nextBillingDate) {
      setSubmitError("Next billing date is required.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload: AddSubscriptionInput = {
      name: name.trim(),
      amount: parsedAmount,
      billing_cycle: billingCycle,
      next_billing_date: nextBillingDate,
      category: category.trim() || null,
      payment_mode: paymentMode,
      status,
      notes: notes.trim() || null,
    };

    const result =
      isEdit && subscriptionId
        ? await updateSubscription(subscriptionId, payload)
        : await addSubscription(payload);

    setSubmitting(false);

    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }

    const savedName = name.trim();
    if (!isEdit) reset();
    onClose();
    onSaved?.({ name: savedName, mode: isEdit ? "edit" : "create" });
  }

  async function handleDelete() {
    if (!isEdit || !subscriptionId) return;
    setDeleting(true);
    setSubmitError(null);
    const result = await deleteSubscription(subscriptionId);
    setDeleting(false);
    if ("error" in result) {
      setSubmitError(result.error);
      setConfirmDelete(false);
      return;
    }
    const id = subscriptionId;
    const deletedName = name;
    onClose();
    onDeleted?.({ id, name: deletedName });
  }

  const modalTree = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/75"
            onClick={handleClose}
            aria-hidden
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-20 sm:p-6 sm:pt-24"
            role="dialog"
            aria-modal
            aria-label={isEdit ? "Edit subscription" : "New subscription"}
          >
            <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl">
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex min-h-0 flex-1 flex-col"
              >
                {/* header */}
                <div className="relative flex shrink-0 items-center justify-center border-b border-border px-6 py-4">
                  <h2 className="text-base font-semibold text-foreground/80">
                    {isEdit ? "Edit Subscription" : "New Subscription"}
                  </h2>
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close"
                    className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40">
                  {/* name */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Netflix, Spotify"
                      required
                      className="input-glow w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    />
                  </div>

                  {/* amount */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Amount
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-medium text-muted-foreground">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                          className="input-glow w-full rounded-xl border border-border bg-muted/40 py-3 pl-8 pr-4 text-right text-xl font-semibold tabular-nums text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                        />
                      </div>
                      <span className="shrink-0 rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] font-semibold text-muted-foreground">
                        INR
                      </span>
                    </div>
                  </div>

                  {/* billing cycle */}
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Billing Cycle
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BILLING_CYCLES.map(({ id, label }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setBillingCycle(id)}
                          className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            billingCycle === id
                              ? "border-purple/60 bg-purple-soft text-purple"
                              : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* next billing date */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Next Billing Date
                    </label>
                    <input
                      type="date"
                      value={nextBillingDate}
                      onChange={(e) => setNextBillingDate(e.target.value)}
                      required
                      style={{ colorScheme: "dark" }}
                      className="input-glow w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] font-medium text-foreground focus:outline-none"
                    />
                  </div>

                  {/* category */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Category{" "}
                      <span className="font-normal normal-case tracking-normal text-muted-foreground/70">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Entertainment, Utilities"
                      className="input-glow w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    />
                  </div>

                  {/* payment mode */}
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Payment Mode
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PAYMENT_MODES.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPaymentMode(id)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            paymentMode === id
                              ? "border-purple/60 bg-purple-soft text-purple"
                              : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* status — edit mode only */}
                  {isEdit && (
                    <div>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Status
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {STATUSES.map(({ id, label }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setStatus(id)}
                            className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              status === id
                                ? "border-purple/60 bg-purple-soft text-purple"
                                : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* notes */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Notes{" "}
                      <span className="font-normal normal-case tracking-normal text-muted-foreground/70">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Plan tier, shared with, reminder…"
                      rows={2}
                      className="input-glow w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* footer */}
                <div className="shrink-0 border-t border-border px-6 pb-4 pt-3">
                  {submitError && (
                    <p className="mb-3 rounded-lg bg-rose-500/10 px-3 py-2 text-[12px] font-medium text-rose-500">
                      {submitError}
                    </p>
                  )}
                  {isEdit && confirmDelete ? (
                    <div className="flex flex-col gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3">
                      <p className="text-[12px] font-medium text-rose-500 dark:text-rose-400">
                        Delete this subscription? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          disabled={deleting}
                          className="flex-1 rounded-lg border border-border bg-card/60 py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                        >
                          Keep
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-500 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-60"
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                              Deleting…
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {isEdit && (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(true)}
                          disabled={submitting || deleting}
                          aria-label="Delete subscription"
                          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="flex-1 rounded-xl border border-border bg-muted/40 py-2.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white transition-all duration-150 hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 disabled:hover:translate-y-0"
                        style={{
                          background:
                            "linear-gradient(135deg, color-mix(in srgb, var(--purple) 80%, black) 0%, var(--purple) 100%)",
                        }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            Saving…
                          </>
                        ) : isEdit ? (
                          "Save Changes →"
                        ) : (
                          "Add Subscription →"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return <>{mounted && createPortal(modalTree, document.body)}</>;
}
