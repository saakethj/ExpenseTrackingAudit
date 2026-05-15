"use client";

import * as React from "react";
import { Expand, Shrink, Type, ALargeSmall } from "lucide-react";
import { motion } from "framer-motion";
import { useDensity, type Density, type FontScale, type Accent } from "@/components/density-provider";

// ── Accent presets ────────────────────────────────────────────────────

type AccentOption = {
  id: Accent;
  label: string;
  from: string;
  to: string;
};

const ACCENT_OPTIONS: AccentOption[] = [
  { id: "default", label: "Aurora",  from: "#8b5cf6", to: "#f97316" },
  { id: "ocean",   label: "Ocean",   from: "#3b82f6", to: "#06b6d4" },
  { id: "forest",  label: "Forest",  from: "#059669", to: "#d97706" },
  { id: "sunset",  label: "Sunset",  from: "#e11d48", to: "#ea580c" },
  { id: "mono",    label: "Mono",    from: "#475569", to: "#94a3b8" },
];

// ── Density options ───────────────────────────────────────────────────

type DensityOption = { id: Density; label: string; icon: React.ElementType; description: string };

const DENSITY_OPTIONS: DensityOption[] = [
  { id: "comfortable", label: "Comfortable", icon: Expand,  description: "More breathing room" },
  { id: "compact",     label: "Compact",     icon: Shrink,  description: "Tighter, more on screen" },
];

// ── Font scale options ────────────────────────────────────────────────

type FontOption = { id: FontScale; label: string; icon: React.ElementType; description: string; sample: string };

const FONT_OPTIONS: FontOption[] = [
  { id: "normal", label: "Normal", icon: Type,        description: "Default reading size", sample: "Aa" },
  { id: "large",  label: "Large",  icon: ALargeSmall, description: "Easier on the eyes",  sample: "Aa" },
];

// ── Toggle (motion) ───────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        checked ? "bg-purple" : "bg-muted"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm"
        style={{ x: checked ? 16 : 0 }}
      />
    </button>
  );
}

// ── Section label ─────────────────────────────────────────────────────

function SectionLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={`text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ${className ?? ""}`}>
      {children}
    </p>
  );
}

// ── Gradient checkmark badge ──────────────────────────────────────────

function CheckBadge({ small }: { small?: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`flex shrink-0 items-center justify-center rounded-full ${
        small ? "h-4 w-4" : "h-5 w-5"
      }`}
      style={{ background: "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)" }}
    >
      <svg viewBox="0 0 10 8" fill="none" className={small ? "h-2 w-2" : "h-2.5 w-2.5"}>
        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────

export function AppearancePanel() {
  const { density, setDensity, reducedMotion, setReducedMotion, fontScale, setFontScale, accent, setAccent } = useDensity();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-border px-6 py-5 text-center">
        <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Personalise how the app looks and feels on your device.
        </p>
      </div>

      <div className="p-6 space-y-8">

        {/* ── Accent color ── */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <SectionLabel>Accent Color</SectionLabel>
            {mounted && (
              <div
                className="h-3.5 w-14 rounded-full"
                style={{ background: "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)" }}
              />
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            {ACCENT_OPTIONS.map((opt) => {
              const isActive = mounted && accent === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAccent(opt.id)}
                  className="group flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl p-1"
                >
                  {/* Gradient swatch circle */}
                  <div className="relative">
                    <div
                      className={`h-11 w-11 rounded-full transition-all duration-200 ${
                        isActive
                          ? "ring-2 ring-offset-2 ring-offset-card scale-110"
                          : "group-hover:scale-105"
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${opt.from} 0%, ${opt.to} 100%)`,
                        ...(isActive ? { boxShadow: `0 0 0 2px var(--card), 0 0 0 4px ${opt.from}` } : {}),
                      }}
                    />
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-card"
                      >
                        <div
                          className="flex h-3.5 w-3.5 items-center justify-center rounded-full"
                          style={{ background: `linear-gradient(135deg, ${opt.from} 0%, ${opt.to} 100%)` }}
                        >
                          <svg viewBox="0 0 10 8" fill="none" className="h-2 w-2">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-medium transition-colors ${
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Display density ── */}
        <div>
          <SectionLabel className="mb-4">Display Density</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {DENSITY_OPTIONS.map((opt) => {
              const isActive = mounted && density === opt.id;
              const Icon = opt.icon;
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDensity(opt.id)}
                  className={`relative flex items-center gap-3 overflow-hidden rounded-xl border p-4 text-left transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? "border-purple shadow-[0_0_0_1px_var(--purple)]"
                      : "border-border hover:border-muted-foreground/40 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive ? "bg-purple/10" : "bg-muted"
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-purple" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[12px] font-semibold transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {opt.label}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{opt.description}</p>
                  </div>
                  {isActive && <CheckBadge small />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Text size ── */}
        <div>
          <SectionLabel className="mb-4">Text Size</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {FONT_OPTIONS.map((opt) => {
              const isActive = mounted && fontScale === opt.id;
              const Icon = opt.icon;
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFontScale(opt.id)}
                  className={`relative flex items-center gap-3 overflow-hidden rounded-xl border p-4 text-left transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? "border-purple shadow-[0_0_0_1px_var(--purple)]"
                      : "border-border hover:border-muted-foreground/40 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive ? "bg-purple/10" : "bg-muted"
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-purple" : "text-muted-foreground"}`} />
                    {/* Sample text badge */}
                    <span
                      className={`absolute -bottom-1 -right-1 rounded px-[3px] text-[8px] font-bold leading-tight text-white`}
                      style={{ background: "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)" }}
                    >
                      {opt.id === "large" ? "18" : "16"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[12px] font-semibold transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {opt.label}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{opt.description}</p>
                  </div>
                  {isActive && <CheckBadge small />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Motion ── */}
        <div>
          <SectionLabel className="mb-4">Motion</SectionLabel>
          <div className="rounded-xl border border-border bg-card/50 px-4">
            <div className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground">Reduce motion</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Minimise animations for a calmer, more focused experience.
                </p>
              </div>
              {mounted && <Toggle checked={reducedMotion} onChange={setReducedMotion} />}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
