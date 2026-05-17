"use client";

import * as React from "react";
import { Download, FileSpreadsheet, Loader2, Repeat } from "lucide-react";
import {
  getAllTransactionsRaw,
  type RawTransaction,
} from "@/app/actions/transactions-actions";
import {
  getSubscriptions,
  type SubscriptionWithDerived,
} from "@/app/actions/subscriptions-actions";

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str = String(value);
  if (/^[=+\-@]/.test(str)) str = "'" + str;
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(headers: string[], rows: (string | number | null)[][]): string {
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsvCell).join(","));
  }
  return lines.join("\r\n");
}

function todayStamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function transactionsToCsv(rows: RawTransaction[]): string {
  return buildCsv(
    ["date", "type", "amount", "category", "payment_mode", "note"],
    rows.map((r) => [r.date, r.type, r.amount, r.category, r.payment_mode, r.note])
  );
}

function subscriptionsToCsv(rows: SubscriptionWithDerived[]): string {
  return buildCsv(
    [
      "name",
      "amount",
      "billing_cycle",
      "next_billing_date",
      "category",
      "payment_mode",
      "status",
      "notes",
    ],
    rows.map((r) => [
      r.name,
      r.amount,
      r.billing_cycle,
      r.next_billing_date,
      r.category,
      r.payment_mode,
      r.status,
      r.notes,
    ])
  );
}

type RowState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "error"; message: string };

type RowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  filenameHint: string;
  onDownload?: () => Promise<void> | void;
  state: RowState;
  disabled?: boolean;
};

function ExportRow({
  icon,
  title,
  description,
  filenameHint,
  onDownload,
  state,
  disabled = false,
}: RowProps) {
  const isLoading = state.kind === "loading";
  const isDisabled = disabled || isLoading || !onDownload;

  return (
    <div className="card-glow flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-soft text-purple"
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {description}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground/80">
            {filenameHint}
          </p>
          {state.kind === "error" && (
            <p className="mt-2 text-[12px] text-rose-500 dark:text-rose-400">
              {state.message}
            </p>
          )}
          {state.kind === "empty" && (
            <p className="mt-2 text-[12px] text-orange">
              Nothing to export yet — add some data first.
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onDownload}
        disabled={isDisabled}
        className="inline-flex shrink-0 items-center justify-center gap-2 self-stretch rounded-xl bg-purple px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-purple/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Preparing…
          </>
        ) : (
          <>
            <Download className="h-4 w-4" aria-hidden />
            Download CSV
          </>
        )}
      </button>
    </div>
  );
}

export function ExportPanel() {
  const [txState, setTxState] = React.useState<RowState>({ kind: "idle" });
  const [subState, setSubState] = React.useState<RowState>({ kind: "idle" });

  async function handleDownloadTransactions() {
    setTxState({ kind: "loading" });
    try {
      const rows = await getAllTransactionsRaw();
      if (rows.length === 0) {
        setTxState({ kind: "empty" });
        return;
      }
      const csv = transactionsToCsv(rows);
      downloadCsv(`transactions-${todayStamp()}.csv`, csv);
      setTxState({ kind: "idle" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to export transactions.";
      setTxState({ kind: "error", message });
    }
  }

  async function handleDownloadSubscriptions() {
    setSubState({ kind: "loading" });
    try {
      const result = await getSubscriptions();
      if ("error" in result) {
        setSubState({ kind: "error", message: result.error });
        return;
      }
      if (result.subscriptions.length === 0) {
        setSubState({ kind: "empty" });
        return;
      }
      const csv = subscriptionsToCsv(result.subscriptions);
      downloadCsv(`subscriptions-${todayStamp()}.csv`, csv);
      setSubState({ kind: "idle" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to export subscriptions.";
      setSubState({ kind: "error", message });
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Export your data
        </h2>
        <p className="text-[13px] text-muted-foreground">
          Download a CSV snapshot of your transactions or subscriptions.
          Spreadsheet-friendly — opens directly in Excel, Numbers, or Google Sheets.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <ExportRow
          icon={<FileSpreadsheet className="h-5 w-5" />}
          title="Transactions"
          description="All transactions — both manually added and imported — across every period."
          filenameHint="transactions-YYYY-MM-DD.csv"
          onDownload={handleDownloadTransactions}
          state={txState}
        />
        <ExportRow
          icon={<Repeat className="h-5 w-5" />}
          title="Subscriptions"
          description="All recurring subscriptions with billing cycle and next renewal date."
          filenameHint="subscriptions-YYYY-MM-DD.csv"
          onDownload={handleDownloadSubscriptions}
          state={subState}
        />
      </div>
    </section>
  );
}
