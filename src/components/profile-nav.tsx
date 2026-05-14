"use client";

import * as React from "react";
import {
  User,
  Sliders,
  Tags,
  Palette,
  Bell,
  ArrowDownUp,
  ShieldCheck,
  Link2,
  AlertTriangle,
  CreditCard,
  Wallet,
  Receipt,
  type LucideIcon,
} from "lucide-react";

export type ProfileNavKey =
  | "general"
  | "preferences"
  | "categories"
  | "appearance"
  | "notifications"
  | "import-export"
  | "privacy-security"
  | "integrations"
  | "danger-zone"
  | "plan"
  | "payment-methods"
  | "billing-history";

type Item = {
  key: ProfileNavKey;
  label: string;
  icon: LucideIcon;
};

type Section = {
  title: string;
  items: Item[];
};

const SECTIONS: Section[] = [
  {
    title: "Settings",
    items: [
      { key: "general", label: "General", icon: User },
      { key: "preferences", label: "Preferences", icon: Sliders },
      { key: "categories", label: "Categories", icon: Tags },
      { key: "appearance", label: "Appearance", icon: Palette },
      { key: "notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    title: "Data & Security",
    items: [
      { key: "import-export", label: "Import & Export", icon: ArrowDownUp },
      { key: "privacy-security", label: "Privacy & Security", icon: ShieldCheck },
      { key: "integrations", label: "Connected Integrations", icon: Link2 },
      { key: "danger-zone", label: "Danger Zone", icon: AlertTriangle },
    ],
  },
  {
    title: "Billing & Subscription",
    items: [
      { key: "plan", label: "Current Plan", icon: CreditCard },
      { key: "payment-methods", label: "Payment Methods", icon: Wallet },
      { key: "billing-history", label: "Billing History", icon: Receipt },
    ],
  },
];

type Props = {
  active: ProfileNavKey;
  onSelect: (key: ProfileNavKey) => void;
};

export function ProfileNav({ active, onSelect }: Props) {
  const wrapRef = React.useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMove}
      className="group/nav relative h-full overflow-hidden rounded-2xl border border-border bg-card/60 p-3 backdrop-blur-xl"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/nav:opacity-100"
        style={{
          padding: "1px",
          background:
            "radial-gradient(180px circle at var(--mx, 50%) var(--my, 50%), var(--purple), transparent 60%)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
        }}
      />
      <nav className="relative flex flex-col gap-7 py-2">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="mb-3 flex items-center gap-2 px-2">
              <span
                aria-hidden
                className="h-3 w-[3px] rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, var(--purple) 0%, var(--orange) 100%)",
                }}
              />
              <h4 className="text-[13px] font-semibold tracking-tight text-foreground">
                {section.title}
              </h4>
            </div>
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const isActive = item.key === active;
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onSelect(item.key)}
                      aria-current={isActive ? "page" : undefined}
                      className={`group/item relative flex w-full items-center gap-2.5 overflow-hidden rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:pl-3"
                      }`}
                    >
                      {!isActive && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-1 left-0 w-[2px] origin-top scale-y-0 rounded-full bg-purple transition-transform duration-200 ease-out group-hover/item:scale-y-100"
                        />
                      )}
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                          isActive
                            ? "text-purple"
                            : "text-muted-foreground group-hover/item:scale-110 group-hover/item:text-purple"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
