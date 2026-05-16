"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Loader2, Trash2, FileText } from "lucide-react";
import {
  deleteTransactionsByFilter,
  type DeleteFilter,
  listImportBatches,
  deleteImportBatch,
  type ImportBatch,
} from "@/app/actions/transactions-actions";

type ConfirmState = DeleteFilter | null;

export function DangerZonePanel() {
  const [confirming, setConfirming] = useState<ConfirmState>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [batches, setBatches] = useState<ImportBatch[] | null>(null);
  const [batchConfirm, setBatchConfirm] = useState<ImportBatch | null>(null);
  const [deletingBatch, setDeletingBatch] = useState(false);
  const [batchMessage, setBatchMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    listImportBatches().then(setBatches);
  }, []);

  const options: { id: DeleteFilter; label: string; description: string }[] = [
    { id: "this_month", label: "This month", description: "Delete all transactions from the current month" },
    { id: "last_6_months", label: "Last 6 months", description: "Delete all transactions from the past 6 months" },
    { id: "all", label: "All transactions", description: "Permanently delete all your transactions (cannot be undone)" },
  ];

  const handleConfirm = async (filter: DeleteFilter) => {
    setDeleting(true);
    setMessage(null);
    const result = await deleteTransactionsByFilter(filter);
    setDeleting(false);

    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
      return;
    }

    setMessage({
      type: "success",
      text: `Deleted ${result.count} transaction${result.count !== 1 ? "s" : ""}`,
    });
    setTimeout(() => setConfirming(null), 2000);
  };

  const handleDeleteBatch = async (batch: ImportBatch) => {
    setDeletingBatch(true);
    setBatchMessage(null);
    const result = await deleteImportBatch(batch.id);
    setDeletingBatch(false);

    if ("error" in result) {
      setBatchMessage({ type: "error", text: result.error });
      return;
    }

    setBatchMessage({
      type: "success",
      text: `Deleted import "${batch.filename}"`,
    });
    setBatches((prev) => prev?.filter((b) => b.id !== batch.id) ?? []);
    setTimeout(() => setBatchConfirm(null), 2000);
  };

  const confirmingLabel = confirming ? options.find((o) => o.id === confirming)?.label : null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 md:p-6">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">Danger Zone</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              These actions are irreversible. Deleted transactions cannot be recovered.
            </p>
          </div>
        </div>
      </div>

      {/* Delete by import section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Delete by import</h4>
        {batches === null && (
          <p className="text-xs text-muted-foreground">Loading imports...</p>
        )}
        {batches?.length === 0 && (
          <p className="text-xs text-muted-foreground">No imports yet.</p>
        )}
        {batches && batches.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="rounded-lg border border-border bg-card/60 p-4 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex items-start gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{batch.filename}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {batch.transaction_count} transaction{batch.transaction_count !== 1 ? "s" : ""} ·{" "}
                        {new Date(batch.created_at).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBatchConfirm(batch)}
                    disabled={deletingBatch || batchConfirm !== null}
                    className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Time-based deletion section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Delete by date</h4>
        {options.map((option) => (
          <div
            key={option.id}
            className="rounded-lg border border-border bg-card/60 p-4 hover:bg-card/80 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h5 className="font-medium text-foreground">{option.label}</h5>
                <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
              </div>
              <button
                onClick={() => setConfirming(option.id)}
                disabled={deleting || confirming !== null}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Time-based deletion confirmation modal */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Confirm deletion</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Are you sure you want to delete {confirmingLabel}? This action cannot be undone.
                </p>
              </div>
            </div>

            {message && (
              <div
                className={`mb-4 rounded-lg px-3 py-2 text-xs font-medium ${
                  message.type === "error"
                    ? "bg-rose-500/10 text-rose-500"
                    : "bg-green-500/10 text-green-500"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(null)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirm(confirming)}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import batch deletion confirmation modal */}
      {batchConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Confirm deletion</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Are you sure you want to delete <span className="font-medium text-foreground">"{batchConfirm.filename}"</span>? This will permanently remove {batchConfirm.transaction_count} transaction{batchConfirm.transaction_count !== 1 ? "s" : ""}.
                </p>
              </div>
            </div>

            {batchMessage && (
              <div
                className={`mb-4 rounded-lg px-3 py-2 text-xs font-medium ${
                  batchMessage.type === "error"
                    ? "bg-rose-500/10 text-rose-500"
                    : "bg-green-500/10 text-green-500"
                }`}
              >
                {batchMessage.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setBatchConfirm(null)}
                disabled={deletingBatch}
                className="flex-1 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBatch(batchConfirm)}
                disabled={deletingBatch}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              >
                {deletingBatch && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
