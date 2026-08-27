import Link from "next/link";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { FOOTER_NAV } from "@/lib/nav";

const SOCIAL = [
  { label: "X", href: "https://x.com", glyph: "𝕏" },
  { label: "LinkedIn", href: "https://linkedin.com", glyph: "in" },
  { label: "YouTube", href: "https://youtube.com", glyph: "▶" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16" style={{ backgroundColor: "#0d1117", color: "#f5f7fa" }}>
      <div className="container-oi py-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Logo variant="tagline" size={34} idPrefix="footer" />
            <p className="mt-4 max-w-xs text-sm" style={{ color: "#9aa4b4" }}>
              The independent index of side hustles, businesses, franchises, and
              acquisition opportunities — scored on the same six factors.
            </p>
          </div>

          {FOOTER_NAV.map((group) => (
            <div key={group.heading}>
              <h2 className="text-[0.65rem] font-semibold tracking-eyebrow uppercase" style={{ color: "#6b7585" }}>
                {group.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "#c3cbd8" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div
          className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "#232b38", color: "#6b7585" }}
        >
          <p>© {new Date().getFullYear()} Opportunity Index. All rights reserved.</p>
          <p>
            Figures are researched estimates, not guarantees.{" "}
            <Link href="/methodology" className="underline underline-offset-4">
              How we score
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
