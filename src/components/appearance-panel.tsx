"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion } from "framer-motion";

type ThemeId = "light" | "dark" | "system";

type ThemeOption = {
  id: ThemeId;
  label: string;
  icon: React.ElementType;
  description: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  { id: "light", label: "Light", icon: Sun, description: "Clean white surface" },
  { id: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes" },
  { id: "system", label: "System", icon: Monitor, description: "Follows your OS" },
];

// ── Mini dashboard preview ────────────────────────────────────────────

const LIGHT = {
  bg: "#fafafa",
  card: "#ffffff",
  border: "rgba(10,10,10,0.08)",
  text: "#0a0a0a",
  muted: "#5b5b66",
  purple: "#8b5cf6",
  orange: "#f97316",
};

const DARK = {
  bg: "#07070a",
  card: "#0c0c11",
  border: "rgba(255,255,255,0.08)",
  text: "#f5f5f7",
  muted: "#9a9aa6",
  purple: "#a78bfa",
  orange: "#fb923c",
};

function MiniDashboard({ colors }: { colors: typeof LIGHT }) {
  const { bg, card, border, text, muted, purple, orange } = colors;

  return (
    <div className="h-full w-full p-[7px]" style={{ background: bg }}>
      {/* Navbar */}
      <div
        className="mb-[5px] flex h-[14px] items-center gap-[4px] rounded-[4px] px-[6px]"
        style={{ background: card, border: `1px solid ${border}` }}
      >
        <div
          className="h-[6px] w-[6px] rounded-full shrink-0"
          style={{ background: `linear-gradient(135deg, ${purple}, ${orange})` }}
        />
        <div className="h-[3px] w-[24px] rounded-full" style={{ background: muted, opacity: 0.5 }} />
        <div className="ml-auto h-[5px] w-[5px] rounded-full" style={{ background: muted, opacity: 0.4 }} />
      </div>

      {/* Stat cards row */}
      <div className="mb-[5px] grid grid-cols-3 gap-[4px]">
        {[purple, orange, "#22c55e"].map((color, i) => (
          <div
            key={i}
            className="rounded-[4px] p-[4px]"
            style={{ background: card, border: `1px solid ${border}` }}
          >
            <div className="mb-[2px] h-[2px] w-[10px] rounded-full" style={{ background: color }} />
            <div className="mb-[2px] h-[3px] rounded-full" style={{ background: muted, opacity: 0.3 }} />
            <div className="h-[4px] w-[65%] rounded-full" style={{ background: text, opacity: 0.55 }} />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        className="rounded-[4px] p-[5px]"
        style={{ background: card, border: `1px solid ${border}` }}
      >
        <div className="mb-[3px] h-[3px] w-[20px] rounded-full" style={{ background: muted, opacity: 0.4 }} />
        <div className="flex items-end gap-[2px]" style={{ height: 22 }}>
          {[38, 60, 44, 75, 52, 88, 65].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${h}%`,
                background:
                  i === 5
                    ? `linear-gradient(180deg, ${purple} 0%, ${orange} 100%)`
                    : `${purple}55`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemePreviewCard({ themeId }: { themeId: ThemeId }) {
  if (themeId === "system") {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0">
          <MiniDashboard colors={LIGHT} />
        </div>
        <div
          className="absolute inset-0"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
        >
          <MiniDashboard colors={DARK} />
        </div>
        {/* Diagonal divider line */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, transparent calc(50% - 0.5px), rgba(139,92,246,0.4) calc(50% - 0.5px), rgba(139,92,246,0.4) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
          }}
        />
      </div>
    );
  }

  return <MiniDashboard colors={themeId === "dark" ? DARK : LIGHT} />;
}

// ── Main panel ────────────────────────────────────────────────────────

export function AppearancePanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = (mounted ? theme : "dark") as ThemeId | undefined;

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-border px-6 py-5 text-center">
        <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Personalise how the app looks on your device.
        </p>
      </div>

      <div className="p-6">
        {/* Theme section */}
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Theme
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {THEME_OPTIONS.map((option) => {
            const isActive = activeTheme === option.id;
            const Icon = option.icon;

            return (
              <motion.button
                key={option.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setTheme(option.id)}
                className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "border-purple shadow-[0_0_0_1px_var(--purple)]"
                    : "border-border hover:border-muted-foreground/40 hover:shadow-sm"
                }`}
              >
                {/* Preview area */}
                <div className="relative h-[120px] w-full overflow-hidden">
                  <ThemePreviewCard themeId={option.id} />

                  {/* Selected checkmark */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
                      style={{
                        background: "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
                      }}
                    >
                      <svg
                        viewBox="0 0 10 8"
                        fill="none"
                        className="h-2.5 w-2.5"
                      >
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>

                {/* Label row */}
                <div
                  className={`flex items-center gap-2 border-t px-3 py-2.5 transition-colors ${
                    isActive
                      ? "border-purple/30 bg-purple/5"
                      : "border-border bg-card"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                      isActive ? "text-purple" : "text-muted-foreground"
                    }`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-[12px] font-semibold leading-none transition-colors ${
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Info note for system */}
        {mounted && activeTheme === "system" && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-[11px] text-muted-foreground"
          >
            Using your device&apos;s theme preference. Change it in your OS display settings.
          </motion.p>
        )}
      </div>
    </div>
  );
}
