"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import {
  saveNotificationsAction,
  type NotificationPrefs,
} from "@/app/actions/notifications-actions";

export type { NotificationPrefs };

export type NotificationsPanelProps = NotificationPrefs;

// ── Toggle switch ─────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed ${
        checked ? "bg-purple" : "bg-muted"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm`}
        style={{ x: checked ? 16 : 0 }}
      />
    </button>
  );
}

// ── Row ───────────────────────────────────────────────────────────────

function NotifRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ── Frequency pill selector ───────────────────────────────────────────

type Frequency = NotificationPrefs["frequency"];
const FREQUENCY_OPTIONS: { id: Frequency; label: string }[] = [
  { id: "realtime", label: "Real-time" },
  { id: "daily", label: "Daily digest" },
  { id: "weekly", label: "Weekly digest" },
];

function FrequencyPicker({
  value,
  onChange,
}: {
  value: Frequency;
  onChange: (v: Frequency) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {FREQUENCY_OPTIONS.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive
                ? "text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
            style={
              isActive
                ? { background: "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)" }
                : undefined
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 mt-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground first:mt-0">
      {children}
    </p>
  );
}

// ── Main panel ────────────────────────────────────────────────────────

export function NotificationsPanel(initial: NotificationsPanelProps) {
  const [prefs, setPrefs] = React.useState<NotificationPrefs>(initial);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState("");

  function set<K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const res = await saveNotificationsAction(prefs);
    setSaving(false);
    if (res.error) {
      setError(res.error);
    } else {
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-border px-6 py-5 text-center">
        <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Choose what you hear about and how often.
        </p>
      </div>

      <div className="p-6">
        {/* Budget & Spending */}
        <SectionLabel>Budget &amp; Spending</SectionLabel>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border px-4">
          <NotifRow
            label="Budget threshold alerts"
            description="Get notified when you reach 80% of a budget."
            checked={prefs.budgetAlerts}
            onChange={(v) => set("budgetAlerts", v)}
          />
          <NotifRow
            label="Large transaction alerts"
            description="Alert when a single expense exceeds your set limit."
            checked={prefs.largeTransactions}
            onChange={(v) => set("largeTransactions", v)}
          />
        </div>

        {/* Reports */}
        <SectionLabel>Reports &amp; Summaries</SectionLabel>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border px-4">
          <NotifRow
            label="Weekly spending summary"
            description="A snapshot of your week's expenses every Monday."
            checked={prefs.weeklySummary}
            onChange={(v) => set("weeklySummary", v)}
          />
          <NotifRow
            label="Monthly financial report"
            description="Full month breakdown delivered on the 1st."
            checked={prefs.monthlyReport}
            onChange={(v) => set("monthlyReport", v)}
          />
        </div>

        {/* Account */}
        <SectionLabel>Account &amp; Security</SectionLabel>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border px-4">
          <NotifRow
            label="New login activity"
            description="Email when your account is signed in from a new device."
            checked={prefs.loginActivity}
            onChange={(v) => set("loginActivity", v)}
          />
          <NotifRow
            label="Profile changes"
            description="Confirm when your name, avatar, or password is updated."
            checked={prefs.profileChanges}
            onChange={(v) => set("profileChanges", v)}
          />
        </div>

        {/* Frequency */}
        <SectionLabel>Delivery frequency</SectionLabel>
        <div className="rounded-xl border border-border bg-card/50 px-4 py-3">
          <p className="mb-2.5 text-[11px] text-muted-foreground">
            How often should non-urgent notifications be batched?
          </p>
          <FrequencyPicker
            value={prefs.frequency}
            onChange={(v) => set("frequency", v)}
          />
        </div>

        {/* Footer */}
        {error && (
          <p className="mt-4 text-xs text-red-500">{error}</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs text-green-500"
            >
              <Check className="h-3.5 w-3.5" />
              Saved
            </motion.span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold text-white transition-opacity disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ background: "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)" }}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
