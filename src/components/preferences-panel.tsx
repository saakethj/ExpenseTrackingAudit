"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings2,
  Calendar,
  Check,
  CheckCircle2,
  Loader2,
  Search,
  X,
  Globe,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import cc from "currency-codes";
import { useRouter } from "next/navigation";
import { savePreferencesAction } from "@/app/actions/preferences-actions";

// ── Static data ──────────────────────────────────────────────────────

const CURRENCIES = cc.data
  .filter((c) => /^[A-Z]{3}$/.test(c.code))
  .map((c) => ({ code: c.code, label: `${c.currency} (${c.code})` }))
  .filter((c, i, arr) => arr.findIndex((x) => x.code === c.code) === i)
  .sort((a, b) => a.label.localeCompare(b.label));

const ALL_TIMEZONES: string[] =
  typeof Intl !== "undefined" && "supportedValuesOf" in Intl
    ? (
        Intl as unknown as { supportedValuesOf: (k: string) => string[] }
      ).supportedValuesOf("timeZone")
    : [];

const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM / DD / YYYY" },
  { value: "DD/MM/YYYY", label: "DD / MM / YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY - MM - DD" },
];

const NUMBER_FORMATS = [
  { value: "1,000.00", label: "1,000.00" },
  { value: "1.000,00", label: "1.000,00" },
  { value: "1,00,000.00", label: "1,00,000.00" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function tzOffset(tz: string): string {
  try {
    return (
      new Intl.DateTimeFormat("en", {
        timeZone: tz,
        timeZoneName: "shortOffset",
      })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value ?? ""
    );
  } catch {
    return "";
  }
}

// ── Types ────────────────────────────────────────────────────────────

export type PreferencesPanelProps = {
  currency: string;
  numberFormat: string;
  dateFormat: string;
  timezone: string;
  weekStart: string;
  fiscalYearStart: string;
};

// ── TimezoneSelect ───────────────────────────────────────────────────

type TZSelectProps = {
  value: string;
  onChange: (tz: string) => void;
  disabled?: boolean;
};

function TimezoneSelect({ value, onChange, disabled }: TZSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [pos, setPos] = React.useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [mounted, setMounted] = React.useState(false);

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => setMounted(true), []);

  const filtered = search.trim()
    ? ALL_TIMEZONES.filter((tz) =>
        tz.toLowerCase().includes(search.toLowerCase()),
      )
    : ALL_TIMEZONES;

  function openDropdown() {
    if (disabled || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
    setOpen(true);
    setSearch("");
  }

  function closeDropdown() {
    setOpen(false);
    setSearch("");
  }

  React.useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDropdown();
        wrapperRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  React.useEffect(() => {
    if (!open || !value) return;
    const t = setTimeout(() => {
      listRef.current
        ?.querySelector("[data-selected=true]")
        ?.scrollIntoView({ block: "nearest" });
    }, 50);
    return () => clearTimeout(t);
  }, [open, value]);

  const offset = value ? tzOffset(value) : "";

  return (
    <div ref={wrapperRef} className="relative">
      <div
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={open ? closeDropdown : openDropdown}
        className={`input-glow flex w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors select-none ${
          disabled ? "pointer-events-none opacity-60" : ""
        } ${open ? "ring-2 ring-ring" : ""}`}
      >
        <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {value ? (
          <>
            <span className="flex-1 truncate text-foreground">{value}</span>
            {offset && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {offset}
              </span>
            )}
          </>
        ) : (
          <span className="flex-1 truncate text-muted-foreground">
            Select timezone
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>

      {mounted &&
        createPortal(
          <>
            {open && (
              <div
                className="fixed inset-0 z-[9998]"
                onClick={closeDropdown}
                aria-hidden
              />
            )}
            {open && pos && (
              <div
                style={{
                  position: "absolute",
                  top: pos.top,
                  left: pos.left,
                  width: pos.width,
                  zIndex: 9999,
                }}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
              >
                <div className="border-b border-border p-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search timezones…"
                      className="w-full rounded-lg bg-background/60 py-1.5 pl-8 pr-7 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        tabIndex={-1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <ul
                  ref={listRef}
                  role="listbox"
                  className="max-h-52 overflow-y-auto py-1"
                >
                  {filtered.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-muted-foreground">
                      No results
                    </li>
                  ) : (
                    filtered.map((tz) => {
                      const isSelected = tz === value;
                      return (
                        <li key={tz} role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            data-selected={isSelected}
                            onClick={() => {
                              onChange(tz);
                              closeDropdown();
                            }}
                            className={`flex w-full items-center px-3 py-1.5 text-sm transition-colors focus:outline-none ${
                              isSelected
                                ? "bg-purple/10 text-foreground"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            }`}
                          >
                            <span className="truncate">{tz}</span>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            )}
          </>,
          document.body,
        )}
    </div>
  );
}

// ── Shared field wrapper ─────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const CHEVRON = (
  <svg
    aria-hidden
    className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

// ── Main panel ───────────────────────────────────────────────────────

export function PreferencesPanel({
  currency: initCurrency,
  numberFormat: initNumberFormat,
  dateFormat: initDateFormat,
  timezone: initTimezone,
  weekStart: initWeekStart,
  fiscalYearStart: initFiscalYearStart,
}: PreferencesPanelProps) {
  const router = useRouter();

  const [currency, setCurrency] = React.useState(initCurrency);
  const [numberFormat, setNumberFormat] = React.useState(initNumberFormat);
  const [dateFormat, setDateFormat] = React.useState(initDateFormat);
  const [timezone, setTimezone] = React.useState(initTimezone);
  const [weekStart, setWeekStart] = React.useState(initWeekStart);
  const [fiscalYearStart, setFiscalYearStart] = React.useState(initFiscalYearStart);

  const [saving, setSaving] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const dirty =
    currency !== initCurrency ||
    numberFormat !== initNumberFormat ||
    dateFormat !== initDateFormat ||
    timezone !== initTimezone ||
    weekStart !== initWeekStart ||
    fiscalYearStart !== initFiscalYearStart;

  async function handleSave() {
    setSaveError(null);
    setSaving(true);
    try {
      const result = await savePreferencesAction({
        currency,
        numberFormat,
        dateFormat,
        timezone,
        weekStart,
        fiscalYearStart,
      });
      if (result.error) throw new Error(result.error);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
      router.refresh();
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : "Could not save preferences.",
      );
    } finally {
      setSaving(false);
    }
  }

  const selectClass =
    "w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground transition-colors hover:border-orange/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize how numbers, dates, and time are displayed across the app.
        </p>
      </div>

      {/* Localization & Formatting */}
      <section className="card-glow rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 border-b border-border pb-4 text-sm font-semibold text-foreground">
          <Settings2 className="h-4 w-4 text-orange" />
          Localization & Formatting
        </h2>

        <div className="mt-5 flex flex-col gap-5">
          {/* Base currency */}
          <Field label="Base currency" htmlFor="pref-currency">
            <div className="relative">
              <select
                id="pref-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={saving}
                className={selectClass}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              {CHEVRON}
            </div>
          </Field>

          {/* Number format */}
          <Field label="Number format">
            <div
              role="radiogroup"
              aria-label="Number format"
              className="inline-flex w-fit rounded-lg border border-border bg-background p-0.5"
            >
              {NUMBER_FORMATS.map(({ value, label }) => {
                const active = numberFormat === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setNumberFormat(value)}
                    disabled={saving}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 ${
                      active
                        ? "bg-muted text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Date format */}
          <Field label="Date format" htmlFor="pref-date-format">
            <div className="relative">
              <select
                id="pref-date-format"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                disabled={saving}
                className={selectClass}
              >
                {DATE_FORMATS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              {CHEVRON}
            </div>
          </Field>

          {/* Timezone */}
          <Field label="Timezone">
            <TimezoneSelect
              value={timezone}
              onChange={setTimezone}
              disabled={saving}
            />
          </Field>
        </div>
      </section>

      {/* Time & Navigation */}
      <section className="card-glow rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 border-b border-border pb-4 text-sm font-semibold text-foreground">
          <Calendar className="h-4 w-4 text-orange" />
          Time & Navigation
        </h2>

        <div className="mt-5 flex flex-col gap-5">
          {/* First day of week */}
          <Field label="First day of the week">
            <div
              role="radiogroup"
              aria-label="First day of the week"
              className="inline-flex w-fit rounded-lg border border-border bg-background p-0.5"
            >
              {(["sunday", "monday"] as const).map((day) => {
                const active = weekStart === day;
                return (
                  <button
                    key={day}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setWeekStart(day)}
                    disabled={saving}
                    className={`rounded-md px-4 py-1.5 text-xs font-medium capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 ${
                      active
                        ? "bg-muted text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Financial year start */}
          <Field label="Financial year start" htmlFor="pref-fiscal-start">
            <div className="relative">
              <select
                id="pref-fiscal-start"
                value={fiscalYearStart}
                onChange={(e) => setFiscalYearStart(e.target.value)}
                disabled={saving}
                className={selectClass}
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {CHEVRON}
            </div>
          </Field>
        </div>
      </section>

      {/* Error */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{saveError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        <AnimatePresence>
          {justSaved && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 text-xs text-green-500"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved
            </motion.span>
          )}
        </AnimatePresence>
        <motion.button
          type="button"
          onClick={() => void handleSave()}
          disabled={!dirty || saving}
          whileHover={dirty && !saving ? { y: -1 } : undefined}
          whileTap={dirty && !saving ? { scale: 0.97 } : undefined}
          transition={{ duration: 0.15 }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          <span>{saving ? "Saving…" : "Save changes"}</span>
        </motion.button>
      </div>
    </div>
  );
}
