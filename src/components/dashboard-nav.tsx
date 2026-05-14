"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image"; // Add this import
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
          
          {/* UPDATED LOGO SECTION */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="group flex items-center transition-transform duration-300 hover:scale-105"
            >
              <Image
                src="/logo.png" // Make sure this matches your filename in the public folder
                alt="ETM Logo"
                width={240} 
                height={60}
                className="h-8 w-auto sm:h-10" // This ensures it scales proportionally and fits the nav height
                priority
              />
            </Link>
          </div>
          {/* END UPDATED LOGO SECTION */}

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