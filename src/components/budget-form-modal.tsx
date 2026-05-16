"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronDown,
  Check,
  Loader2,
  Trash2,
  Wallet,
  Tag,
} from "lucide-react";
import {
  addBudget,
  updateBudget,
  deleteBudget,
} from "@/app/actions/budgets-actions";
import { getCategoriesByType } from "@/app/actions/categories-actions";
import type { BudgetPeriodType } from "@/app/actions/budgets-actions";

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Utilities",
  "Shopping",
  "Entertainment",
  "Health",
  "Other",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type BudgetKind = "overall" | "category";

export type BudgetInitialValues = {
  category: string | null;
  limit_amount: number;
  period_type: BudgetPeriodType;
  period_start: string;
  period_end: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  budgetId?: string;
  initialValues?: BudgetInitialValues;
  onSaved?: (info: { mode: "create" | "edit" }) => void;
  onDeleted?: (info: { id: string }) => void;
};

type DropdownPos = { top: number; left: number; width: number };

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function lastDayOfMonth(year: number, monthIdx: number): number {
  return new Date(year, monthIdx + 1, 0).getDate();
}

function monthRange(year: number, monthIdx: number): {
  start: string;
  end: string;
} {
  return {
    start: `${year}-${pad2(monthIdx + 1)}-01`,
    end: `${year}-${pad2(monthIdx + 1)}-${pad2(lastDayOfMonth(year, monthIdx))}`,
  };
}

function quarterRange(year: number, quarter: number): {
  start: string;
  end: string;
} {
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;
  return {
    start: `${year}-${pad2(startMonth + 1)}-01`,
    end: `${year}-${pad2(endMonth + 1)}-${pad2(lastDayOfMonth(year, endMonth))}`,
  };
}

function yearRange(year: number): { start: string; end: string } {
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

function deriveFieldsFromDates(
  periodType: BudgetPeriodType,
  periodStart: string
): { year: number; month: number; quarter: number } {
  const [yyyy, mm] = periodStart.split("-").map(Number);
  return {
    year: yyyy ?? new Date().getFullYear(),
    month: (mm ?? 1) - 1,
    quarter: Math.floor(((mm ?? 1) - 1) / 3) + 1,
  };
}

export function BudgetFormModal({
  open,
  onClose,
  mode = "create",
  budgetId,
  initialValues,
  onSaved,
  onDeleted,
}: Props) {
  const isEdit = mode === "edit";
  const now = new Date();

  const [kind, setKind] = React.useState<BudgetKind>("overall");
  const [category, setCategory] = React.useState("");
  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const [dropdownPos, setDropdownPos] = React.useState<DropdownPos>({
    top: 0,
    left: 0,
    width: 0,
  });
  const [periodType, setPeriodType] = React.useState<BudgetPeriodType>("monthly");
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth());
  const [quarter, setQuarter] = React.useState(
    Math.floor(now.getMonth() / 3) + 1
  );
  const [limit, setLimit] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [categoryError, setCategoryError] = React.useState(false);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [customCategoryNames, setCustomCategoryNames] = React.useState<string[]>(
    []
  );
  React.useEffect(() => {
    if (!open) return;
    getCategoriesByType("expense").then((cats) => {
      setCustomCategoryNames(cats.map((c) => c.name));
    });
  }, [open]);

  // Hydrate from initialValues on open (edit mode)
  React.useEffect(() => {
    if (!open) return;
    if (isEdit && initialValues) {
      setKind(initialValues.category === null ? "overall" : "category");
      setCategory(initialValues.category ?? "");
      setPeriodType(initialValues.period_type);
      const derived = deriveFieldsFromDates(
        initialValues.period_type,
        initialValues.period_start
      );
      setYear(derived.year);
      setMonth(derived.month);
      setQuarter(derived.quarter);
      setLimit(String(initialValues.limit_amount));
      setSubmitError(null);
      setCategoryError(false);
      setConfirmDelete(false);
    }
  }, [open, isEdit, initialValues]);

  const categoryBtnRef = React.useRef<HTMLButtonElement>(null);
  const customSet = new Set(customCategoryNames.map((n) => n.toLowerCase()));
  const categories = [
    ...customCategoryNames,
    ...EXPENSE_CATEGORIES.filter((c) => !customSet.has(c.toLowerCase())),
  ];

  React.useEffect(() => {
    if (!categoryOpen) return;
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger = categoryBtnRef.current
        ?.closest("[data-category-root]")
        ?.contains(target);
      const insideDropdown = (target as Element)?.closest?.(
        "[data-category-dropdown]"
      );
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
      if (e.key === "Escape") {
        if (categoryOpen) setCategoryOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, categoryOpen]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function openCategoryDropdown() {
    if (categoryBtnRef.current) {
      const rect = categoryBtnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
    setCategoryOpen((v) => !v);
  }

  function selectCategory(c: string) {
    setCategory(c);
    setCategoryOpen(false);
    setCategoryError(false);
  }

  function reset() {
    setKind("overall");
    setCategory("");
    setCategoryOpen(false);
    setPeriodType("monthly");
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth());
    setQuarter(Math.floor(n.getMonth() / 3) + 1);
    setLimit("");
    setSubmitError(null);
    setCategoryError(false);
    setConfirmDelete(false);
  }

  function handleClose() {
    if (!isEdit) reset();
    onClose();
  }

  function computePeriod(): { start: string; end: string } {
    if (periodType === "yearly") return yearRange(year);
    if (periodType === "quarterly") return quarterRange(year, quarter);
    return monthRange(year, month);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (kind === "category" && !category) {
      setCategoryError(true);
      return;
    }
    if (!limit || parseFloat(limit) <= 0) return;

    setCategoryError(false);
    setSubmitting(true);
    setSubmitError(null);

    const period = computePeriod();
    const payload = {
      category: kind === "overall" ? null : category,
      limit_amount: parseFloat(limit),
      period_type: periodType,
      period_start: period.start,
      period_end: period.end,
    };

    const result =
      isEdit && budgetId
        ? await updateBudget(budgetId, payload)
        : await addBudget(payload);

    setSubmitting(false);
    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }
    const savedMode: "create" | "edit" = isEdit ? "edit" : "create";
    reset();
    onClose();
    onSaved?.({ mode: savedMode });
  }

  async function handleDelete() {
    if (!isEdit || !budgetId) return;
    setDeleting(true);
    setSubmitError(null);
    const result = await deleteBudget(budgetId);
    setDeleting(false);
    if ("error" in result) {
      setSubmitError(result.error);
      setConfirmDelete(false);
      return;
    }
    const id = budgetId;
    reset();
    onClose();
    onDeleted?.({ id });
  }

  const yearOptions = React.useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 1, current, current + 1, current + 2];
  }, []);

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
            aria-label={isEdit ? "Edit budget" : "Add budget"}
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
                    {isEdit ? "Edit Budget" : "New Budget"}
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
                  {/* kind toggle */}
                  <div className="flex rounded-xl border border-border bg-muted/50 p-1">
                    {(
                      [
                        { id: "overall", label: "Overall", icon: Wallet },
                        { id: "category", label: "Category", icon: Tag },
                      ] as { id: BudgetKind; label: string; icon: React.ElementType }[]
                    ).map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setKind(id)}
                        className="relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {kind === id && (
                          <motion.span
                            layoutId="budget-kind-pill"
                            className="absolute inset-0 rounded-lg bg-purple-soft"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 38,
                            }}
                          />
                        )}
                        <Icon
                          className={`relative z-10 h-3.5 w-3.5 transition-colors ${
                            kind === id
                              ? "text-purple"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`relative z-10 transition-colors ${
                            kind === id
                              ? "text-purple"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* category dropdown */}
                  {kind === "category" && (
                    <div data-category-root>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Category
                      </label>
                      <button
                        ref={categoryBtnRef}
                        type="button"
                        onClick={openCategoryDropdown}
                        className={`input-glow flex w-full items-center justify-between rounded-xl border bg-muted/40 px-4 py-3 text-[13px] font-medium focus:outline-none ${
                          categoryError ? "border-rose-500" : "border-border"
                        }`}
                      >
                        <span
                          className={
                            category
                              ? "text-foreground"
                              : "text-muted-foreground/60"
                          }
                        >
                          {category || "Select a category"}
                        </span>
                        <motion.span
                          animate={{ rotate: categoryOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden
                          />
                        </motion.span>
                      </button>
                      {categoryError && (
                        <p className="mt-1.5 text-[11px] font-medium text-rose-500">
                          Please select a category.
                        </p>
                      )}
                    </div>
                  )}

                  {/* limit */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Limit
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
                          value={limit}
                          onChange={(e) => setLimit(e.target.value)}
                          required
                          className="input-glow w-full rounded-xl border border-border bg-muted/40 py-3 pl-8 pr-4 text-right text-xl font-semibold tabular-nums text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                        />
                      </div>
                      <span className="shrink-0 rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] font-semibold text-muted-foreground">
                        INR
                      </span>
                    </div>
                  </div>

                  {/* period type */}
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Period Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(
                        ["monthly", "quarterly", "yearly"] as BudgetPeriodType[]
                      ).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setPeriodType(t)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium capitalize transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            periodType === t
                              ? "border-purple/60 bg-purple-soft text-purple"
                              : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* period picker */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Period
                    </label>
                    <div className="flex gap-2">
                      {periodType === "monthly" && (
                        <select
                          value={month}
                          onChange={(e) => setMonth(Number(e.target.value))}
                          className="input-glow flex-1 rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] font-medium text-foreground focus:outline-none"
                        >
                          {MONTH_NAMES.map((m, idx) => (
                            <option key={m} value={idx}>
                              {m}
                            </option>
                          ))}
                        </select>
                      )}
                      {periodType === "quarterly" && (
                        <select
                          value={quarter}
                          onChange={(e) => setQuarter(Number(e.target.value))}
                          className="input-glow flex-1 rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] font-medium text-foreground focus:outline-none"
                        >
                          {[1, 2, 3, 4].map((q) => (
                            <option key={q} value={q}>
                              Q{q}
                            </option>
                          ))}
                        </select>
                      )}
                      <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="input-glow flex-1 rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] font-medium text-foreground focus:outline-none"
                      >
                        {yearOptions.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
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
                        Delete this budget? This cannot be undone.
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
                          aria-label="Delete budget"
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
                          "Create Budget →"
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

  return (
    <>
      {mounted && createPortal(modalTree, document.body)}

      {categoryOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <motion.ul
              data-category-dropdown
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
                maxHeight: "300px",
                zIndex: 200,
              }}
              className="overflow-y-auto rounded-xl border border-border bg-card shadow-2xl backdrop-blur-xl [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40"
            >
              {categories.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => selectCategory(c)}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-[13px] transition-colors hover:bg-muted/60 ${
                      category === c
                        ? "font-semibold text-purple"
                        : "font-medium text-foreground"
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
