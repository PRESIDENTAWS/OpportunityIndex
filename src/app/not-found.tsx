import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Mark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="container-oi flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <Mark size={44} idPrefix="notfound" />
      <p
        className="mt-8 text-[0.65rem] font-semibold tracking-eyebrow uppercase"
        style={{ color: "var(--fg-faint)" }}
      >
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">This page is not in the index.</h1>
      <p className="mt-3 max-w-md" style={{ color: "var(--fg-muted)" }}>
        The link may be out of date, or the opportunity may have been renamed in a
        quarterly revision.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/hustles"
          className="inline-flex items-center gap-2 rounded-[var(--radius-brand)] px-5 py-3 text-sm font-semibold"
          style={{ backgroundColor: "var(--bg-inverse)", color: "var(--fg-inverse)" }}
        >
          Browse the index
          <Icon name="arrowRight" size={15} />
        </Link>
        <Link
          href="/"
          className="rounded-[var(--radius-brand)] border px-5 py-3 text-sm font-semibold"
          style={{ borderColor: "var(--border-strong)" }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
