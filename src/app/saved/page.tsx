import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Saved",
  description: "Your shortlist of opportunities, listings, and franchises.",
};

export default function SavedPage() {
  return (
    <>
      <PageHeader eyebrow="Your shortlist" title="Saved" />

      <div className="container-oi py-8">
        <div
          className="rounded-[var(--radius-brand)] border border-dashed px-6 py-16 text-center"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <Icon name="bookmark" size={30} className="mx-auto" style={{ color: "var(--fg-faint)" }} />
          <p className="mt-4 font-medium">Nothing saved yet.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm" style={{ color: "var(--fg-muted)" }}>
            Saving requires an account, which is not built yet. In the meantime, the
            compare tool holds two opportunities side by side.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/hustles"
              className="rounded-[var(--radius-brand)] px-5 py-2.5 text-sm font-semibold"
              style={{ backgroundColor: "var(--bg-inverse)", color: "var(--fg-inverse)" }}
            >
              Browse the index
            </Link>
            <Link
              href="/tools/compare"
              className="rounded-[var(--radius-brand)] border px-5 py-2.5 text-sm font-semibold"
              style={{ borderColor: "var(--border-strong)" }}
            >
              Compare two
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
