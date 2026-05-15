"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Banknote, CreditCard, Smartphone, Building2, MoreHorizontal, ChevronDown, Check, Loader2 } from "lucide-react";
import { addTransaction } from "@/app/actions/transactions-actions";

type TxType = "expense" | "income";
type PaymentMode = "cash" | "card" | "upi" | "bank" | "other";

const EXPENSE_CATEGORIES = ["Food", "Transport", "Utilities", "Shopping", "Entertainment", "Health", "Other"];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Gift", "Other"];

const PAYMENT_MODES: { id: PaymentMode; label: string; icon: React.ElementType }[] = [
  { id: "cash",  label: "Cash",  icon: Banknote },
  { id: "card",  label: "Card",  icon: CreditCard },
  { id: "upi",   label: "UPI",   icon: Smartphone },
  { id: "bank",  label: "Bank",  icon: Building2 },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

function todayISO(): string {
  return new Date().toISOString().split("T")[0]!;
}

type DropdownPos = { top: number; left: number; width: number };

type Props = { open: boolean; onClose: () => void; onSaved?: (info: { type: TxType; amount: number }) => void };

export function AddTransactionModal({ open, onClose, onSaved }: Props) {
  const [type, setType]               = React.useState<TxType>("expense");
  const [amount, setAmount]           = React.useState("");
  const [category, setCategory]       = React.useState("");
  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const [dropdownPos, setDropdownPos] = React.useState<DropdownPos>({ top: 0, left: 0, width: 0 });
  const [paymentMode, setPaymentMode] = React.useState<PaymentMode>("card");
  const [date, setDate]               = React.useState(todayISO());
  const [note, setNote]               = React.useState("");
  const [submitting, setSubmitting]   = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [categoryError, setCategoryError] = React.useState(false);

  const categoryBtnRef = React.useRef<HTMLButtonElement>(null);
  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  React.useEffect(() => { setCategory(""); setCategoryOpen(false); }, [type]);

  // close dropdown on outside click
  React.useEffect(() => {
    if (!categoryOpen) return;
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger = categoryBtnRef.current?.closest("[data-category-root]")?.contains(target);
      const insideDropdown = (target as Element)?.closest?.("[data-category-dropdown]");
      if (!insideTrigger && !insideDropdown) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [categoryOpen]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (categoryOpen) setCategoryOpen(false); else onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, categoryOpen]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function openCategoryDropdown() {
    if (categoryBtnRef.current) {
      const rect = categoryBtnRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
    setCategoryOpen((v) => !v);
  }

  function selectCategory(c: string) {
    setCategory(c);
    setCategoryOpen(false);
    setCategoryError(false);
  }

  function reset() {
    setType("expense");
    setAmount("");
    setCategory("");
    setCategoryOpen(false);
    setPaymentMode("card");
    setDate(todayISO());
    setNote("");
    setSubmitError(null);
    setCategoryError(false);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) { setCategoryError(true); return; }
    if (!amount) return;
    setCategoryError(false);
    setSubmitting(true);
    setSubmitError(null);
    const result = await addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      payment_mode: paymentMode,
      date,
      note: note || undefined,
    });
    setSubmitting(false);
    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }
    const savedInfo = { type, amount: parseFloat(amount) };
    reset();
    onClose();
    onSaved?.(savedInfo);
  }

  return (
    <>
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
              className="fixed inset-x-0 bottom-0 top-20 z-50 flex items-center justify-center p-4 sm:p-6"
              role="dialog"
              aria-modal
              aria-label="Add transaction"
            >
              <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl">
                <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
                  {/* header */}
                  <div className="relative flex shrink-0 items-center justify-center border-b border-border px-6 py-4">
                    <h2 className="text-base font-semibold text-foreground/80">
                      New Transaction
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
                    {/* type toggle */}
                    <div className="flex rounded-xl border border-border bg-muted/50 p-1">
                      {(["expense", "income"] as TxType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className="relative flex-1 rounded-lg py-2 text-[13px] font-semibold capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {type === t && (
                            <motion.span
                              layoutId="toggle-pill"
                              className={`absolute inset-0 rounded-lg ${t === "expense" ? "bg-rose-500/10" : "bg-emerald-500/10"}`}
                              transition={{ type: "spring", stiffness: 500, damping: 38 }}
                            />
                          )}
                          <span className={`relative z-10 transition-colors duration-200 ${
                            type === t
                              ? t === "expense" ? "text-rose-500 dark:text-rose-400" : "text-emerald-500 dark:text-emerald-400"
                              : "text-muted-foreground hover:text-foreground"
                          }`}>
                            {t}
                          </span>
                        </button>
                      ))}
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

                    {/* category — custom dropdown, portal-rendered */}
                    <div data-category-root>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Category
                      </label>
                      <button
                        ref={categoryBtnRef}
                        type="button"
                        onClick={openCategoryDropdown}
                        className={`input-glow flex w-full items-center justify-between rounded-xl border bg-muted/40 px-4 py-3 text-[13px] font-medium focus:outline-none ${categoryError ? "border-rose-500" : "border-border"}`}
                      >
                        <span className={category ? "text-foreground" : "text-muted-foreground/60"}>
                          {category || "Select a category"}
                        </span>
                        <motion.span animate={{ rotate: categoryOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
                        </motion.span>
                      </button>
                      {categoryError && (
                        <p className="mt-1.5 text-[11px] font-medium text-rose-500">Please select a category.</p>
                      )}
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

                    {/* date */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        style={{ colorScheme: "dark" }}
                        className="input-glow w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] font-medium text-foreground focus:outline-none"
                      />
                    </div>

                    {/* note */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Note{" "}
                        <span className="font-normal normal-case tracking-normal text-muted-foreground/70">(optional)</span>
                      </label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What was this for?"
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
                    <div className="flex gap-3">
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
                        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--purple) 80%, black) 0%, var(--purple) 100%)" }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            Saving…
                          </>
                        ) : (
                          "Add Transaction →"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* category dropdown — portal so overflow:hidden on modal doesn't clip it */}
      {categoryOpen && typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          <motion.ul
            data-category-dropdown
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 200 }}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl backdrop-blur-xl"
          >
            {categories.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => selectCategory(c)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-[13px] transition-colors hover:bg-muted/60 ${
                    category === c ? "font-semibold text-purple" : "font-medium text-foreground"
                  }`}
                >
                  {c}
                  {category === c && <Check className="h-3.5 w-3.5" aria-hidden />}
                </button>
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
