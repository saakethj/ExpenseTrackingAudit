"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  type Category,
} from "@/app/actions/categories-actions";

export type { Category };

export type CategoriesPanelProps = {
  initialCategories: Category[];
};

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
  "#8b5cf6", "#ec4899", "#f43f5e", "#64748b",
];

const ICONS = [
  "🍔", "🍕", "☕", "🛒", "🚗", "🚌", "✈️", "🏠",
  "💡", "💊", "📚", "🎬", "🎮", "🏋️", "💰", "💳",
  "🎁", "🐾", "👔", "🌐", "🔧", "📱", "🎵", "🌱",
  "🏖️", "🍷", "🎓", "🏥", "⚽", "🛠️",
];

// ── Edit / Create modal ───────────────────────────────────────────────

type ModalMode = { type: "create" } | { type: "edit"; category: Category };

function CategoryModal({
  mode,
  onClose,
  onDone,
  nextSortOrder,
}: {
  mode: ModalMode;
  onClose: () => void;
  onDone: (cat: Category) => void;
  nextSortOrder?: number;
}) {
  const isEdit = mode.type === "edit";
  const [name, setName] = React.useState(isEdit ? mode.category.name : "");
  const [color, setColor] = React.useState(isEdit ? mode.category.color : COLORS[7]);
  const [icon, setIcon] = React.useState(isEdit ? mode.category.icon : ICONS[0]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  async function handleSave() {
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");

    if (isEdit) {
      const res = await updateCategoryAction(mode.category.id, { name: name.trim(), color, icon });
      if (res.error) { setError(res.error); setSaving(false); return; }
      onDone({ ...mode.category, name: name.trim(), color, icon });
    } else {
      const sortOrder = nextSortOrder ?? 0;
      const res = await createCategoryAction({ name: name.trim(), color, icon, sort_order: sortOrder });
      if (res.error || !res.id) { setError(res.error ?? "Failed to create."); setSaving(false); return; }
      onDone({ id: res.id, name: name.trim(), color, icon, sort_order: sortOrder });
    }
    router.refresh();
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-end justify-center sm:items-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        {/* Colored stripe */}
        <div
          className="h-1.5 w-full transition-colors duration-200"
          style={{ background: color }}
        />

        <div className="p-5">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {isEdit ? "Edit category" : "New category"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Preview + name input */}
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl transition-colors duration-200"
              style={{ background: `${color}22` }}
            >
              {icon}
            </div>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") onClose();
              }}
              placeholder="Category name"
              maxLength={40}
              className="h-9 flex-1 rounded-lg border border-border bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Color picker */}
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Color
          </p>
          <div className="mb-5 flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full transition-transform ${
                  c === color
                    ? "scale-110 ring-2 ring-ring ring-offset-2 ring-offset-card"
                    : "hover:scale-110"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>

          {/* Icon picker */}
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Icon
          </p>
          <div className="mb-5 grid grid-cols-6 gap-1">
            {ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`flex items-center justify-center rounded-lg p-1.5 text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  ic === icon ? "bg-muted ring-2 ring-ring" : "hover:bg-muted/60"
                }`}
              >
                {ic}
              </button>
            ))}
          </div>

          {error && (
            <p className="mb-3 text-xs text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-opacity disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ background: "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)" }}
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ── Main panel ────────────────────────────────────────────────────────

export function CategoriesPanel({ initialCategories }: CategoriesPanelProps) {
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [modalMode, setModalMode] = React.useState<ModalMode | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const router = useRouter();

  function handleModalDone(updated: Category) {
    setCategories((prev) => {
      const exists = prev.find((c) => c.id === updated.id);
      if (exists) return prev.map((c) => (c.id === updated.id ? updated : c));
      return [...prev, updated];
    });
    setModalMode(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await deleteCategoryAction(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (!res.error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-border px-6 py-5 text-center">
        <h2 className="text-sm font-semibold text-foreground">Categories</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Organise your expenses and income into custom categories.
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="group relative overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
              >
                {/* Color stripe */}
                <div className="h-1.5 w-full" style={{ background: cat.color }} />

                {/* Content */}
                <div className="flex flex-col items-center gap-1.5 px-3 pb-4 pt-3">
                  <span className="text-2xl leading-none">{cat.icon}</span>
                  <span className="w-full truncate text-center text-[12px] font-medium leading-tight text-foreground">
                    {cat.name}
                  </span>
                </div>

                {/* Confirm delete overlay */}
                {confirmDeleteId === cat.id ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-card/95 backdrop-blur-sm p-3">
                    <p className="text-[11px] font-semibold text-foreground">Delete?</p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        className="flex items-center gap-1 rounded-md bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {deletingId === cat.id && (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Hover action buttons */
                  <div className="absolute right-1.5 top-2.5 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setModalMode({ type: "edit", category: cat })}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(cat.id)}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add card */}
          <button
            type="button"
            onClick={() => setModalMode({ type: "create" })}
            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-6 transition-all hover:border-purple hover:bg-purple/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-purple/10 group-hover:text-purple">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-purple">
              Add category
            </span>
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalMode && (
          <CategoryModal
            mode={modalMode}
            onClose={() => setModalMode(null)}
            onDone={handleModalDone}
            nextSortOrder={categories.length}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
