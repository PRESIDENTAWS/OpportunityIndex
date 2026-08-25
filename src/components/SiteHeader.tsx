"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdSlot } from "./AdSlot";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { PRIMARY_NAV } from "@/lib/nav";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  function closeMenus() {
    setMenuOpen(false);
    setOpenDropdown(null);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
    >
      {/* Announcement bar */}
      <div style={{ backgroundColor: "#0d1117", color: "#f5f7fa" }}>
        <div className="container-oi flex items-center justify-center gap-2 py-2 text-center text-xs sm:text-sm">
          <Icon name="rocket" size={15} className="hidden shrink-0 sm:block" />
          <span>New: 2026 Small Business Trend Report is live.</span>
          <Link
            href="/research/2026-small-business-trend-report"
            className="inline-flex shrink-0 items-center gap-1 font-semibold underline underline-offset-4"
          >
            View Report
            <Icon name="arrowRight" size={13} />
          </Link>
        </div>
      </div>

      {/* Masthead: logo · ad slot · utilities */}
      <div className="container-oi flex items-center justify-between gap-6 py-3 lg:py-4">
        <Logo variant="tagline" size={36} idPrefix="header" />

        <AdSlot format="leaderboard" className="hidden max-w-[730px] flex-1 xl:flex" />

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="hidden sm:flex" />
          <Link
            href="/newsletter"
            className="hidden items-center gap-2 rounded-[var(--radius-brand)] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 sm:inline-flex"
            style={{ backgroundColor: "var(--bg-inverse)", color: "var(--fg-inverse)" }}
          >
            <Icon name="mail" size={16} />
            Newsletter
          </Link>
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={searchOpen}
            className="rounded-[var(--radius-brand)] p-2 lg:hidden"
            style={{ color: "var(--fg-muted)" }}
          >
            <Icon name="search" size={20} />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="rounded-[var(--radius-brand)] p-2 lg:hidden"
            style={{ color: "var(--fg)" }}
          >
            <Icon name={menuOpen ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>

      {/* Primary navigation — desktop */}
      <nav
        aria-label="Primary"
        className="hidden border-t lg:block"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="container-oi flex items-center justify-between">
          <ul className="flex items-center">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.children ? item.label : null)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 border-b-2 px-4 py-3.5 text-[0.78rem] font-medium tracking-eyebrow uppercase transition-colors"
                    style={{
                      borderColor: active ? "var(--fg)" : "transparent",
                      color: active ? "var(--fg)" : "var(--fg-muted)",
                    }}
                  >
                    {item.label}
                    {item.children && <Icon name="chevronDown" size={13} />}
                  </Link>

                  {item.children && openDropdown === item.label && (
                    <div
                      className="absolute top-full left-0 z-50 w-72 rounded-b-[var(--radius-brand)] border border-t-0 py-2 shadow-card"
                      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={closeMenus}
                          className="block px-4 py-2.5 transition-colors hover:bg-[var(--bg-subtle)]"
                        >
                          <span className="block text-sm font-medium">{child.label}</span>
                          {child.description && (
                            <span className="mt-0.5 block text-xs" style={{ color: "var(--fg-faint)" }}>
                              {child.description}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search opportunities"
            aria-expanded={searchOpen}
            className="p-2"
            style={{ color: "var(--fg-muted)" }}
          >
            <Icon name="search" size={19} />
          </button>
        </div>
      </nav>

      {/* Search drawer */}
      {searchOpen && (
        <div className="border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
          <form action="/hustles" className="container-oi flex gap-2 py-3">
            <input
              name="q"
              type="search"
              autoFocus
              placeholder="Search 20,000+ opportunities…"
              className="min-w-0 flex-1 rounded-[var(--radius-brand)] border px-4 py-2.5 text-sm outline-none"
              style={{ backgroundColor: "var(--bg)", borderColor: "var(--border-strong)" }}
            />
            <button
              type="submit"
              className="rounded-[var(--radius-brand)] px-5 py-2.5 text-sm font-semibold"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)" }}
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu sheet */}
      {menuOpen && (
        <div
          className="fixed inset-x-0 top-[var(--header-offset,0)] bottom-0 z-40 overflow-y-auto border-t lg:hidden"
          style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
        >
          <nav aria-label="Mobile" className="container-oi py-4">
            <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
              {PRIMARY_NAV.map((item) => (
                <li key={item.label} className="py-1">
                  <Link
                    href={item.href}
                    onClick={closeMenus}
                    className="flex items-center justify-between py-3 text-sm font-medium tracking-eyebrow uppercase"
                    style={{ color: isActive(pathname, item.href) ? "var(--accent)" : "var(--fg)" }}
                  >
                    {item.label}
                    <Icon name="chevronRight" size={16} />
                  </Link>
                  {item.children && (
                    <ul className="pb-2 pl-3">
                      {item.children.slice(1).map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={closeMenus}
                            className="block py-2 text-sm"
                            style={{ color: "var(--fg-muted)" }}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <ThemeToggle />
              <Link
                href="/newsletter"
                onClick={closeMenus}
                className="inline-flex items-center gap-2 rounded-[var(--radius-brand)] px-4 py-2.5 text-sm font-semibold"
                style={{ backgroundColor: "var(--bg-inverse)", color: "var(--fg-inverse)" }}
              >
                <Icon name="mail" size={16} />
                Newsletter
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
