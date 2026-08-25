"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { MOBILE_TABS } from "@/lib/nav";

/** The fixed bottom tab bar from the mobile mockups. Hidden from lg upward. */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
    >
      <ul className="grid grid-cols-4">
        {MOBILE_TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className="flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium"
                style={{ color: active ? "var(--accent)" : "var(--fg-faint)" }}
                aria-current={active ? "page" : undefined}
              >
                <Icon name={tab.icon} size={21} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
