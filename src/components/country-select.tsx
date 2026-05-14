"use client";

// react-world-flags ships no TS types
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Flag = require("react-world-flags").default as React.ComponentType<{
  code: string;
  className?: string;
  fallback?: React.ReactNode;
}>;

import * as React from "react";
import { createPortal } from "react-dom";
import { countries } from "countries-list";
import { ChevronDown, Search, X } from "lucide-react";

type Entry = { code: string; name: string };

const COUNTRY_LIST: Entry[] = Object.entries(countries)
  .map(([code, data]) => ({ code, name: data.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

type Props = {
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
  id?: string;
};

export function CountrySelect({ value, onChange, disabled, id }: Props) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = React.useState(false);

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => setMounted(true), []);

  const selected = COUNTRY_LIST.find(
    (c) => c.name.toLowerCase() === value.toLowerCase(),
  ) ?? null;

  const filtered = search.trim()
    ? COUNTRY_LIST.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      )
    : COUNTRY_LIST;

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

  function select(entry: Entry) {
    onChange(entry.name);
    closeDropdown();
  }

  function clearValue(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
  }

  // ESC to close
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

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  // Scroll selected item into view when dropdown opens
  React.useEffect(() => {
    if (!open || !selected) return;
    const t = setTimeout(() => {
      listRef.current
        ?.querySelector("[data-selected=true]")
        ?.scrollIntoView({ block: "nearest" });
    }, 50);
    return () => clearTimeout(t);
  }, [open, selected]);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger */}
      <div
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={open ? closeDropdown : openDropdown}
        className={`input-glow flex w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors select-none ${
          disabled ? "pointer-events-none opacity-60" : ""
        } ${open ? "ring-2 ring-ring" : ""}`}
      >
        {selected ? (
          <>
            <Flag
              code={selected.code}
              className="h-[14px] w-[20px] shrink-0 rounded-[2px] object-cover"
              fallback={<span className="h-[14px] w-[20px] shrink-0" />}
            />
            <span className="flex-1 truncate text-foreground">{selected.name}</span>
            {!disabled && (
              <button
                type="button"
                onMouseDown={clearValue}
                aria-label="Clear country"
                tabIndex={-1}
                className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <>
            <span className="flex-1 truncate text-muted-foreground">Select country</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </>
        )}
      </div>

      {mounted &&
        createPortal(
          <>
            {/* Click-away overlay — closes dropdown when clicking outside */}
            {open && (
              <div
                className="fixed inset-0 z-[9998]"
                onClick={closeDropdown}
                aria-hidden
              />
            )}

            {/* Dropdown panel */}
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
                {/* Search */}
                <div className="border-b border-border p-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search countries…"
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

                {/* List */}
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
                    filtered.map((entry) => {
                      const isSelected = entry.name === value;
                      return (
                        <li
                          key={entry.code}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <button
                            type="button"
                            data-selected={isSelected}
                            onClick={() => select(entry)}
                            className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-sm transition-colors focus:outline-none ${
                              isSelected
                                ? "bg-purple/10 text-foreground"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            }`}
                          >
                            <Flag
                              code={entry.code}
                              className="h-[14px] w-[20px] shrink-0 rounded-[2px] object-cover"
                              fallback={
                                <span className="h-[14px] w-[20px] shrink-0" />
                              }
                            />
                            <span className="truncate">{entry.name}</span>
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
