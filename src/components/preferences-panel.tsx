"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Settings2, Check, Loader2 } from "lucide-react";
import cc from "currency-codes";

const CURRENCIES = cc.data
  .map((c) => ({
    code: c.code,
    label: `${c.currency} (${c.code})`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM / DD / YYYY" },
  { value: "DD/MM/YYYY", label: "DD / MM / YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY - MM - DD" },
];

type WeekStart = "sunday" | "monday";

export function PreferencesPanel() {
  const [currency, setCurrency] = React.useState("USD");
  const [dateFormat, setDateFormat] = React.useState("MM/DD/YYYY");
  const [weekStart, setWeekStart] = React.useState<WeekStart>("sunday");
  const [saved, setSaved] = React.useState({
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    weekStart: "sunday" as WeekStart,
  });
  const [saving, setSaving] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);

  const dirty =
    currency !== saved.currency ||
    dateFormat !== saved.dateFormat ||
    weekStart !== saved.weekStart;

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaved({ currency, dateFormat, weekStart });
    setSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1600);
  }

  return (
    <div className="card-glow rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 border-b border-border pb-4 text-base font-semibold text-foreground">
        <Settings2 className="h-4 w-4 text-orange" />
        Preferences
      </h2>

      <div className="mt-5 flex flex-col gap-5">
        {/* Currency */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="currency-select"
            className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            Default currency
          </label>
          <div className="relative">
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground transition-colors hover:border-orange/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
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
          </div>
        </div>

        {/* Date format */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="date-format-select"
            className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            Date format
          </label>
          <div className="relative">
            <select
              id="date-format-select"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground transition-colors hover:border-orange/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {DATE_FORMATS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
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
          </div>
        </div>

        {/* Week starts on (segmented) */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Week starts on
          </label>
          <div
            role="radiogroup"
            aria-label="Week starts on"
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
                  className={`rounded-md px-4 py-1.5 text-xs font-medium capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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
        </div>

        {/* Save */}
        <div className="mt-1 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span
            aria-live="polite"
            className={`text-xs transition-opacity ${
              justSaved ? "text-green-500 opacity-100" : "opacity-0"
            }`}
          >
            ✓ Saved
          </span>
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
    </div>
  );
}
