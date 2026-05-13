"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transactions", href: "/dashboard/transactions" },
  { label: "Budgets", href: "/dashboard/budgets" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Subscriptions", href: "/dashboard/subscriptions" },
];

function isActiveHref(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

export function DashboardNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-3 z-20 px-3 sm:top-4 sm:px-6">
      <div className="glass-pill mx-auto max-w-7xl rounded-2xl">
        <div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-7 md:grid md:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 sm:gap-2.5"
            >
              <span
                className="inline-block h-6 w-6 rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-7 sm:w-7"
                style={{
                  background:
                    "linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%)",
                }}
              />
              <span className="text-base font-bold tracking-tight">ETM</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActiveHref(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative rounded-lg px-3 py-2 text-[14px] font-semibold tracking-tight transition-colors lg:px-4 lg:text-[15px] ${
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {!active && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-[2px] origin-left scale-x-0 rounded-full bg-purple transition-transform duration-300 ease-out group-hover:scale-x-100 lg:inset-x-4"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <UserMenu />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-border/40 px-3 py-2 md:hidden">
            <ul className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => {
                const active = isActiveHref(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center rounded-lg px-3 py-2.5 text-[15px] font-semibold tracking-tight transition-colors ${
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
