"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileSpreadsheet,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import {
  importTransactions,
  type AddTransactionInput,
} from "@/app/actions/transactions-actions";

type TxType = "expense" | "income";

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Utilities",
  "Shopping",
  "Entertainment",
  "Health",
  "Other",
];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Gift", "Other"];

const CATEGORY_KEYWORDS: { category: string; type: TxType; patterns: RegExp }[] = [
  { category: "Food", type: "expense", patterns: /zomato|swiggy|domino|mcdonald|kfc|pizza|starbucks|caf[eé]|restaurant|food|snack|blinkit|zepto|bigbasket|dunkin|hotel/i },
  { category: "Transport", type: "expense", patterns: /\bola\b|uber|rapido|metro|irctc|petrol|fuel|parking|toll|\bauto\b|\bcab\b|lyft|taxi|fastag|\bbus\b|train/i },
  { category: "Utilities", type: "expense", patterns: /electricity|bescom|tneb|mseb|broadband|\bjio\b|airtel|\bvi\b|vodafone|bsnl|\bgas\b|\blpg\b|water|\bbill\b|recharge/i },
  { category: "Shopping", type: "expense", patterns: /amazon|flipkart|myntra|meesho|mall|\bshop\b|store|retail|decathlon|ikea|nykaa|\btata\b/i },
  { category: "Entertainment", type: "expense", patterns: /netflix|prime|hotstar|spotify|youtube|\bpvr\b|inox|cinema|gaming|steam|apple music/i },
  { category: "Health", type: "expense", patterns: /pharmacy|medplus|apollo|hospital|clinic|doctor|\blab\b|medicine|medlife|1mg/i },
  { category: "Salary", type: "income", patterns: /salary|sal\s*credit|payroll|stipend/i },
  { category: "Freelance", type: "income", patterns: /freelance|consulting|invoice|client/i },
  { category: "Investment", type: "income", patterns: /mutual|\bfund\b|\bsip\b|zerodha|groww|stock|smallcase|\bcoin\b|dividend|interest/i },
];

type AmountMode = "split" | "single";

type ColumnMapping = {
  date: string;
  description: string;
  amountMode: AmountMode;
  debit: string;
  credit: string;
  amount: string;
};

type ParsedRow = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TxType;
  category: string;
  selected: boolean;
};

function findHeaderRow(rows: unknown[][]): number {
  const MAX_SCAN = Math.min(rows.length, 60);
  for (let i = 0; i < MAX_SCAN; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const cells = row.map((c) => String(c ?? "").toLowerCase().trim());
    const hasDate = cells.some((c) =>
      /^date$|^value\s*d(t|ate)$|trans.*date|posting.*date|txn.*date/i.test(c)
    );
    const hasDesc = cells.some((c) =>
      /narration|description|particular|details|remarks|^desc$/i.test(c)
    );
    const hasAmount = cells.some((c) =>
      /withdrawal|deposit|debit|credit|^amount$|^amt$/i.test(c)
    );
    if (hasDate && hasDesc && hasAmount) return i;
  }
  return -1;
}

function isLikelyDataRow(row: unknown[]): boolean {
  if (!row || row.length === 0) return false;
  const cells = row.map((c) => String(c ?? "").trim());
  const nonEmpty = cells.filter((c) => c.length > 0);
  if (nonEmpty.length === 0) return false;
  // skip asterisk separator rows ("****", "*********", etc.)
  if (nonEmpty.every((c) => /^\*+$/.test(c))) return false;
  // skip rows that are only dashes / equals (separator lines)
  if (nonEmpty.every((c) => /^[-=_]+$/.test(c))) return false;
  return true;
}

function autodetect(headers: string[]): Partial<ColumnMapping> {
  const m: Partial<ColumnMapping> = {};
  const find = (re: RegExp) => headers.find((h) => re.test(h));
  m.date =
    find(/^date$|trans.*date|value.*date|posting.*date|txn.*date|\bdt\b/i) ||
    find(/date/i) ||
    "";
  m.description =
    find(/description|narration|particular|remarks|details|^note$|^desc$|^ref$/i) ||
    "";
  const debit = find(/debit|^dr$|withdrawal|withdraw|debit.*amt/i);
  const credit = find(/credit|^cr$|deposit|credit.*amt/i);
  const single = find(/^amount$|net.*amount|tran.*amount|^amt$/i);
  if (debit && credit) {
    m.amountMode = "split";
    m.debit = debit;
    m.credit = credit;
    m.amount = "";
  } else if (single) {
    m.amountMode = "single";
    m.amount = single;
    m.debit = "";
    m.credit = "";
  } else if (debit || credit) {
    m.amountMode = "split";
    m.debit = debit ?? "";
    m.credit = credit ?? "";
    m.amount = "";
  } else {
    m.amountMode = "single";
    m.amount = "";
    m.debit = "";
    m.credit = "";
  }
  return m;
}

function parseAmount(raw: unknown): number {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === "number") return raw;
  const s = String(raw).trim();
  if (!s) return 0;
  // remove currency symbols, commas, spaces; keep digits, minus, decimal
  const cleaned = s.replace(/[^\d.\-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return 0;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseDateCell(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  // Excel date number → JS date
  if (typeof raw === "number" && raw > 0 && raw < 80000) {
    const ms = Math.round((raw - 25569) * 86400 * 1000);
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) return toIso(d);
  }
  const s = String(raw).trim();
  if (!s) return "";
  // already ISO?
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy
  const m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
  if (m) {
    let [, dd, mm, yy] = m;
    let year = parseInt(yy!, 10);
    if (year < 100) year += 2000;
    const d = new Date(year, parseInt(mm!, 10) - 1, parseInt(dd!, 10));
    if (!Number.isNaN(d.getTime())) return toIso(d);
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return toIso(d);
  return "";
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function suggestCategory(description: string, type: TxType): string {
  for (const k of CATEGORY_KEYWORDS) {
    if (k.type !== type) continue;
    if (k.patterns.test(description)) return k.category;
  }
  return "Other";
}

type Props = {
  open: boolean;
  onClose: () => void;
  onImported?: (count: number) => void;
};

export function ImportModal({ open, onClose, onImported }: Props) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [step, setStep] = React.useState<1 | 2>(1);
  const [fileName, setFileName] = React.useState("");
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [rawRows, setRawRows] = React.useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = React.useState<ColumnMapping>({
    date: "",
    description: "",
    amountMode: "single",
    debit: "",
    credit: "",
    amount: "",
  });
  const [parsedRows, setParsedRows] = React.useState<ParsedRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [parsing, setParsing] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [bulkCategory, setBulkCategory] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);

  function reset() {
    setStep(1);
    setFileName("");
    setHeaders([]);
    setRawRows([]);
    setMapping({
      date: "",
      description: "",
      amountMode: "single",
      debit: "",
      credit: "",
      amount: "",
    });
    setParsedRows([]);
    setError(null);
    setParsing(false);
    setSubmitting(false);
    setBulkCategory("");
    setDragOver(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleFile(file: File) {
    setError(null);
    setParsing(true);
    setFileName(file.name);
    try {
      const ext = file.name.toLowerCase().split(".").pop();
      let grid: unknown[][] = [];

      if (ext === "csv") {
        const text = await file.text();
        const Papa = (await import("papaparse")).default;
        const result = Papa.parse<unknown[]>(text, {
          header: false,
          skipEmptyLines: false,
          dynamicTyping: false,
        });
        grid = (result.data as unknown[][]) ?? [];
      } else if (ext === "xlsx" || ext === "xls") {
        const XLSX = await import("xlsx");
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array", cellDates: false });
        const sheetName = wb.SheetNames[0];
        if (!sheetName) throw new Error("Workbook has no sheets.");
        const sheet = wb.Sheets[sheetName];
        if (!sheet) throw new Error("Could not read sheet.");
        grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          defval: "",
          raw: true,
          blankrows: false,
        });
      } else {
        throw new Error("Unsupported file type. Use CSV or XLSX.");
      }

      if (grid.length === 0) throw new Error("File appears to be empty.");

      const headerIdx = findHeaderRow(grid);
      if (headerIdx === -1) {
        throw new Error(
          "Could not find a header row. Expected columns like 'Date' and 'Narration' or 'Description'."
        );
      }

      const headerRow = grid[headerIdx] ?? [];
      const parsedHeaders = headerRow
        .map((h) => String(h ?? "").trim())
        .map((h, i) => (h ? h : `Column ${i + 1}`));

      const dataGrid = grid.slice(headerIdx + 1).filter(isLikelyDataRow);
      const parsedData: Record<string, unknown>[] = dataGrid.map((row) => {
        const obj: Record<string, unknown> = {};
        for (let i = 0; i < parsedHeaders.length; i++) {
          obj[parsedHeaders[i]!] = row[i] ?? "";
        }
        return obj;
      });

      if (parsedData.length === 0)
        throw new Error("No data rows found below the header.");

      setHeaders(parsedHeaders);
      setRawRows(parsedData);
      const detected = autodetect(parsedHeaders);
      setMapping((m) => ({ ...m, ...detected }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse file.");
      setFileName("");
      setHeaders([]);
      setRawRows([]);
    } finally {
      setParsing(false);
    }
  }

  function continueToStep2() {
    setError(null);
    if (!mapping.date) {
      setError("Please map the Date column.");
      return;
    }
    if (!mapping.description) {
      setError("Please map the Description column.");
      return;
    }
    if (mapping.amountMode === "single" && !mapping.amount) {
      setError("Please map the Amount column.");
      return;
    }
    if (
      mapping.amountMode === "split" &&
      !mapping.debit &&
      !mapping.credit
    ) {
      setError("Please map at least one of Debit or Credit columns.");
      return;
    }

    const rows: ParsedRow[] = [];
    for (let i = 0; i < rawRows.length; i++) {
      const r = rawRows[i]!;
      const date = parseDateCell(r[mapping.date]);
      const description = String(r[mapping.description] ?? "").trim();
      let amount = 0;
      let type: TxType = "expense";

      if (mapping.amountMode === "split") {
        const dr = mapping.debit ? parseAmount(r[mapping.debit]) : 0;
        const cr = mapping.credit ? parseAmount(r[mapping.credit]) : 0;
        if (dr > 0) {
          amount = dr;
          type = "expense";
        } else if (cr > 0) {
          amount = cr;
          type = "income";
        } else {
          continue;
        }
      } else {
        const raw = parseAmount(r[mapping.amount]);
        if (raw === 0) continue;
        amount = Math.abs(raw);
        type = raw < 0 ? "expense" : "income";
      }

      if (!date || amount <= 0) continue;

      rows.push({
        id: `r-${i}`,
        date,
        description: description || "(no description)",
        amount,
        type,
        category: suggestCategory(description, type),
        selected: true,
      });
    }

    if (rows.length === 0) {
      setError(
        "No valid rows could be parsed. Check that the mapped columns contain dates and amounts."
      );
      return;
    }

    setParsedRows(rows);
    setStep(2);
  }

  function toggleRow(id: string) {
    setParsedRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  }

  function setRowCategory(id: string, category: string) {
    setParsedRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, category } : r))
    );
  }

  function setRowType(id: string, type: TxType) {
    setParsedRows((rows) =>
      rows.map((r) =>
        r.id === id
          ? {
              ...r,
              type,
              category: suggestCategory(r.description, type),
            }
          : r
      )
    );
  }

  function toggleAll() {
    const allSelected = parsedRows.every((r) => r.selected);
    setParsedRows((rows) => rows.map((r) => ({ ...r, selected: !allSelected })));
  }

  function applyBulkCategory() {
    if (!bulkCategory) return;
    setParsedRows((rows) =>
      rows.map((r) => (r.selected ? { ...r, category: bulkCategory } : r))
    );
    setBulkCategory("");
  }

  async function handleImport() {
    setError(null);
    const selected = parsedRows.filter((r) => r.selected);
    if (selected.length === 0) {
      setError("Select at least one row to import.");
      return;
    }
    const payload: AddTransactionInput[] = selected.map((r) => ({
      type: r.type,
      amount: r.amount,
      category: r.category,
      payment_mode: "bank",
      date: r.date,
      note: r.description.slice(0, 200) || undefined,
    }));
    setSubmitting(true);
    const result = await importTransactions(payload, fileName);
    setSubmitting(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    const count = result.count;
    reset();
    onClose();
    onImported?.(count);
  }

  const selectedCount = parsedRows.filter((r) => r.selected).length;
  const allSelected =
    parsedRows.length > 0 && parsedRows.every((r) => r.selected);

  const tree = (
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
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-16 sm:p-6 sm:pt-20"
            role="dialog"
            aria-modal
            aria-label="Import bank statement"
          >
            <div
              className={`flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl ${
                step === 1 ? "max-w-2xl" : "max-w-5xl"
              }`}
            >
              {/* gradient stripe */}
              <div
                aria-hidden
                className="h-0.5 w-full shrink-0"
                style={{
                  background:
                    "linear-gradient(90deg, var(--purple) 0%, var(--orange) 100%)",
                }}
              />

              {/* header */}
              <div className="relative flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Import Bank Statement
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Step {step} of 2 —{" "}
                    {step === 1
                      ? "Upload and map your columns"
                      : `Review & categorize (${parsedRows.length} rows)`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40">
                {step === 1 ? (
                  <Step1
                    fileName={fileName}
                    headers={headers}
                    rawRows={rawRows}
                    mapping={mapping}
                    setMapping={setMapping}
                    parsing={parsing}
                    dragOver={dragOver}
                    setDragOver={setDragOver}
                    onFile={handleFile}
                  />
                ) : (
                  <Step2
                    rows={parsedRows}
                    toggleRow={toggleRow}
                    setRowCategory={setRowCategory}
                    setRowType={setRowType}
                    toggleAll={toggleAll}
                    allSelected={allSelected}
                    bulkCategory={bulkCategory}
                    setBulkCategory={setBulkCategory}
                    applyBulkCategory={applyBulkCategory}
                    selectedCount={selectedCount}
                  />
                )}
              </div>

              {/* footer */}
              <div className="shrink-0 border-t border-border px-6 pb-4 pt-3">
                {error && (
                  <div className="mb-3 flex items-start gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-[12px] font-medium text-rose-500">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-px" aria-hidden />
                    <span>{error}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  {step === 2 ? (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 rounded-xl border border-border bg-muted/40 py-2.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Cancel
                    </button>
                  )}
                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={continueToStep2}
                      disabled={rawRows.length === 0 || parsing}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white transition-all duration-150 hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:hover:translate-y-0"
                      style={{
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, var(--purple) 80%, black) 0%, var(--purple) 100%)",
                      }}
                    >
                      {parsing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Parsing…
                        </>
                      ) : (
                        <>
                          Continue → {rawRows.length > 0 ? `${rawRows.length} rows` : ""}
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={submitting || selectedCount === 0}
                      className="ml-auto flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-150 hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 disabled:hover:translate-y-0"
                      style={{
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, var(--purple) 80%, black) 0%, var(--purple) 100%)",
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Importing…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                          Import {selectedCount} transaction
                          {selectedCount === 1 ? "" : "s"} →
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(tree, document.body);
}

function Step1({
  fileName,
  headers,
  rawRows,
  mapping,
  setMapping,
  parsing,
  dragOver,
  setDragOver,
  onFile,
}: {
  fileName: string;
  headers: string[];
  rawRows: Record<string, unknown>[];
  mapping: ColumnMapping;
  setMapping: React.Dispatch<React.SetStateAction<ColumnMapping>>;
  parsing: boolean;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onFile: (f: File) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const previewRows = rawRows.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          dragOver
            ? "border-purple bg-purple-soft/50"
            : "border-border bg-muted/30 hover:border-purple/50 hover:bg-muted/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
        {parsing ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-purple" />
            <p className="text-[13px] font-semibold text-foreground">Parsing file…</p>
          </>
        ) : fileName ? (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-soft text-purple">
              <FileSpreadsheet className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="text-[13px] font-semibold text-foreground">{fileName}</p>
            <p className="text-[11px] text-muted-foreground">
              {rawRows.length} row{rawRows.length === 1 ? "" : "s"} found · click to
              replace
            </p>
          </>
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-soft text-purple">
              <Upload className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="text-[13px] font-semibold text-foreground">
              Drop your file here, or click to browse
            </p>
            <p className="text-[11px] text-muted-foreground">
              CSV and XLSX supported
            </p>
          </>
        )}
      </div>

      {headers.length > 0 && previewRows.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Preview · first {previewRows.length} row
            {previewRows.length === 1 ? "" : "s"}
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-[12px]">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-3 py-2 text-left font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    {headers.map((h) => (
                      <td
                        key={h}
                        className="max-w-[200px] truncate whitespace-nowrap px-3 py-2 text-foreground"
                      >
                        {String(r[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {headers.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Column mapping
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Mapper
              label="Date column"
              value={mapping.date}
              onChange={(v) => setMapping((m) => ({ ...m, date: v }))}
              options={headers}
            />
            <Mapper
              label="Description column"
              value={mapping.description}
              onChange={(v) => setMapping((m) => ({ ...m, description: v }))}
              options={headers}
            />
          </div>

          <div className="space-y-2">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Amount format
            </span>
            <div className="flex flex-wrap gap-2">
              {(["split", "single"] as AmountMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setMapping((m) => ({ ...m, amountMode: mode }))}
                  className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    mapping.amountMode === mode
                      ? "border-purple/60 bg-purple-soft text-purple"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "split"
                    ? "Debit + Credit columns"
                    : "Single signed column"}
                </button>
              ))}
            </div>
          </div>

          {mapping.amountMode === "split" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Mapper
                label="Debit / Withdrawal column"
                value={mapping.debit}
                onChange={(v) => setMapping((m) => ({ ...m, debit: v }))}
                options={headers}
                allowEmpty
              />
              <Mapper
                label="Credit / Deposit column"
                value={mapping.credit}
                onChange={(v) => setMapping((m) => ({ ...m, credit: v }))}
                options={headers}
                allowEmpty
              />
            </div>
          ) : (
            <Mapper
              label="Amount column (negative = expense)"
              value={mapping.amount}
              onChange={(v) => setMapping((m) => ({ ...m, amount: v }))}
              options={headers}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Mapper({
  label,
  value,
  onChange,
  options,
  allowEmpty,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  allowEmpty?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
        {label}
      </label>
      <ThemedSelect
        value={value}
        onChange={onChange}
        placeholder={allowEmpty ? "— None —" : "— Select a column —"}
        options={options}
        size="md"
      />
    </div>
  );
}

function ThemedSelect({
  value,
  onChange,
  options,
  placeholder,
  size = "md",
  tone = "default",
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  size?: "sm" | "md";
  tone?: "default" | "accent";
}) {
  const sizing =
    size === "sm"
      ? "py-1 pl-2.5 pr-7 text-[12px]"
      : "py-2.5 pl-3 pr-8 text-[13px]";
  const surface =
    tone === "accent"
      ? "border-purple/30 bg-purple-soft/40 text-foreground hover:border-purple/50 focus-visible:border-purple"
      : "border-border bg-card/70 text-foreground hover:border-purple/40 focus-visible:border-purple/60";
  const chevronRight = size === "sm" ? "right-1.5" : "right-2.5";
  const chevronSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ colorScheme: "dark" }}
        className={`w-full cursor-pointer appearance-none rounded-lg border font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${sizing} ${surface}`}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground ${chevronRight} ${chevronSize}`}
        strokeWidth={2.25}
      />
    </div>
  );
}

function Step2({
  rows,
  toggleRow,
  setRowCategory,
  setRowType,
  toggleAll,
  allSelected,
  bulkCategory,
  setBulkCategory,
  applyBulkCategory,
  selectedCount,
}: {
  rows: ParsedRow[];
  toggleRow: (id: string) => void;
  setRowCategory: (id: string, c: string) => void;
  setRowType: (id: string, t: TxType) => void;
  toggleAll: () => void;
  allSelected: boolean;
  bulkCategory: string;
  setBulkCategory: (v: string) => void;
  applyBulkCategory: () => void;
  selectedCount: number;
}) {
  const allCats = Array.from(
    new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])
  );

  function fmt(n: number, type: TxType): string {
    const sign = type === "expense" ? "-" : "+";
    return `${sign}₹${new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(Math.round(n))}`;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-medium text-foreground">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="h-4 w-4 cursor-pointer accent-purple"
          />
          Select all
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[170px]">
            <ThemedSelect
              value={bulkCategory}
              onChange={setBulkCategory}
              options={allCats}
              placeholder="Bulk set category…"
              size="sm"
            />
          </div>
          <button
            type="button"
            onClick={applyBulkCategory}
            disabled={!bulkCategory || selectedCount === 0}
            className="rounded-lg border border-border bg-card/60 px-2.5 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Apply to {selectedCount}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="w-10 px-2 py-2"></th>
              <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                Date
              </th>
              <th className="px-3 py-2 text-left font-semibold">Description</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-semibold">
                Amount
              </th>
              <th className="px-3 py-2 text-left font-semibold">Type</th>
              <th className="px-3 py-2 text-left font-semibold">Category</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const cats =
                r.type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
              const catOpts = cats.includes(r.category)
                ? cats
                : [...cats, r.category];
              return (
                <tr
                  key={r.id}
                  className={`border-t border-border transition-colors ${
                    r.selected ? "" : "opacity-40"
                  }`}
                >
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={r.selected}
                      onChange={() => toggleRow(r.id)}
                      className="h-4 w-4 cursor-pointer accent-purple"
                      aria-label={`Include row from ${r.date}`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-1.5 tabular-nums text-foreground">
                    {r.date}
                  </td>
                  <td className="max-w-[260px] truncate px-3 py-1.5 text-foreground">
                    {r.description}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-1.5 text-right font-semibold tabular-nums ${
                      r.type === "expense"
                        ? "text-rose-500 dark:text-rose-400"
                        : "text-emerald-500 dark:text-emerald-400"
                    }`}
                  >
                    {fmt(r.amount, r.type)}
                  </td>
                  <td className="px-3 py-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setRowType(r.id, r.type === "expense" ? "income" : "expense")
                      }
                      title="Toggle expense / income"
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors ${
                        r.type === "expense"
                          ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 dark:text-rose-400"
                          : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 dark:text-emerald-400"
                      }`}
                    >
                      {r.type === "expense" ? "E" : "I"}
                    </button>
                  </td>
                  <td className="px-3 py-1.5">
                    <ThemedSelect
                      value={r.category}
                      onChange={(v) => setRowCategory(r.id, v)}
                      options={catOpts}
                      size="sm"
                      tone="accent"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Unchecked rows are skipped. Payment mode for all imported rows is set to{" "}
        <span className="font-semibold text-foreground">Bank</span>. Description
        is saved as the note.
      </p>
    </div>
  );
}
