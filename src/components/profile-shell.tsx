"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";
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
} from "lucide-react";
import { ProfileNav, type ProfileNavKey } from "@/components/profile-nav";
import { GeneralPanel, type GeneralPanelProps } from "@/components/general-panel";

type NavItem = { key: ProfileNavKey; label: string; icon: LucideIcon };
type Section = { title: string; items: NavItem[] };

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

function sectionIndexForKey(key: ProfileNavKey): number {
  return SECTIONS.findIndex((s) => s.items.some((i) => i.key === key));
}

type Props = GeneralPanelProps;

export function ProfileShell(props: Props) {
  const [active, setActive] = React.useState<ProfileNavKey>("general");
  const [openSection, setOpenSection] = React.useState<number>(-1);

  function handleSelect(key: ProfileNavKey) {
    setActive(key);
    setOpenSection(sectionIndexForKey(key));
  }

  function toggleSection(idx: number) {
    setOpenSection((prev) => (prev === idx ? -1 : idx));
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full lg:block">
        <ProfileNav active={active} onSelect={handleSelect} />
      </aside>

      {/* Mobile / tablet accordion nav */}
      <div className="lg:hidden col-span-full rounded-2xl border border-border bg-card/60 backdrop-blur-xl overflow-hidden">
        {SECTIONS.map((section, idx) => {
          const isOpen = openSection === idx;
          const hasActive = section.items.some((i) => i.key === active);

          return (
            <div key={section.title} className={idx > 0 ? "border-t border-border" : ""}>
              <button
                type="button"
                onClick={() => toggleSection(idx)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="h-3 w-[3px] rounded-full shrink-0"
                    style={{
                      background: hasActive
                        ? "linear-gradient(180deg, var(--purple) 0%, var(--orange) 100%)"
                        : "var(--border)",
                    }}
                  />
                  <span
                    className={`text-[13px] font-semibold tracking-tight ${
                      hasActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {section.title}
                  </span>
                  {hasActive && (
                    <span className="rounded-md bg-purple/10 px-1.5 py-0.5 text-[10px] font-medium text-purple">
                      {section.items.find((i) => i.key === active)?.label}
                    </span>
                  )}
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul
                    key="items"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-1 px-3 pb-3">
                      {section.items.map((item) => {
                        const isActiveItem = item.key === active;
                        const Icon = item.icon;
                        return (
                          <li key={item.key}>
                            <button
                              type="button"
                              onClick={() => handleSelect(item.key)}
                              aria-current={isActiveItem ? "page" : undefined}
                              className={`group/item relative flex w-full items-center gap-2.5 overflow-hidden rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                isActiveItem
                                  ? "bg-muted text-foreground"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:pl-3"
                              }`}
                            >
                              {!isActiveItem && (
                                <span
                                  aria-hidden
                                  className="pointer-events-none absolute inset-y-1 left-0 w-[2px] origin-top scale-y-0 rounded-full bg-purple transition-transform duration-200 ease-out group-hover/item:scale-y-100"
                                />
                              )}
                              <Icon
                                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                                  isActiveItem
                                    ? "text-purple"
                                    : "text-muted-foreground group-hover/item:scale-110 group-hover/item:text-purple"
                                }`}
                              />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </div>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Middle: content panel */}
      <div className="col-span-full min-w-0 lg:col-auto">
        <AnimatePresence mode="wait">
          {active === "general" && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <GeneralPanel {...props} />
            </motion.div>
          )}
          {active !== "general" && (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground"
            >
              {SECTIONS.flatMap((s) => s.items).find((i) => i.key === active)?.label} — coming soon
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
