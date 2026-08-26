import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { Icon } from "@/components/Icon";
import { NewsletterCard } from "@/components/NewsletterCard";
import { Card, PageHeader } from "@/components/PageShell";
import { SponsorCard, SPONSORS } from "@/components/SponsorCard";
import { listResearchPieces, researchKindLabel, RESEARCH_KINDS } from "@/lib/repository";
import type { ResearchKind } from "@/lib/contract";
import { formatDate, plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Reports, guides, and data studies drawn from the index — what actually predicts survival, what things cost, and how long they take.",
};

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requested = typeof params.kind === "string" ? params.kind : undefined;
  // Only the contract's enum labels are accepted; anything else shows everything.
  const kind = RESEARCH_KINDS.find((k) => k === requested) as ResearchKind | undefined;
  const pieces = await listResearchPieces(kind);

  return (
    <>
      <PageHeader
        eyebrow="Research"
        title={kind ? `${researchKindLabel(kind)}s` : "Research"}
        description="What the index shows once you stop looking at individual opportunities and start looking at the pattern across all of them."
      >
        <nav aria-label="Filter research" className="mt-5 flex flex-wrap gap-2">
          {[{ label: "All", href: "/research", value: undefined as ResearchKind | undefined },
            ...RESEARCH_KINDS.map((k) => ({
              label: `${researchKindLabel(k)}s`,
              href: `/research?kind=${encodeURIComponent(k)}`,
              value: k as ResearchKind | undefined,
            }))].map((tab) => {
            const active = tab.value === kind;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: active ? "transparent" : "var(--border-strong)",
                  backgroundColor: active ? "var(--bg-inverse)" : "transparent",
                  color: active ? "var(--fg-inverse)" : "var(--fg-muted)",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </PageHeader>

      <div className="container-oi grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <p className="mb-4 text-sm" style={{ color: "var(--fg-faint)" }}>
            {plural(pieces.length, "piece")}
          </p>

          <ul className="space-y-3">
            {pieces.map((piece, index) => (
              <li key={piece.slug}>
                <Card as="article" className="p-5">
                  <Link href={`/research/${piece.slug}`} className="block">
                    <p
                      className="text-[0.6rem] font-semibold tracking-eyebrow uppercase"
                      style={{ color: "var(--accent)" }}
                    >
                      {piece.kindLabel} · {piece.readingTimeMinutes} min read · {formatDate(piece.publishedAt)}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold">{piece.title}</h2>
                    <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
                      {piece.excerpt}
                    </p>
                    <p className="mt-3 flex items-center gap-1.5 text-sm" style={{ color: "var(--accent)" }}>
                      Read
                      <Icon name="arrowRight" size={14} />
                    </p>
                  </Link>
                </Card>
                {(index + 1) % 3 === 0 && index + 1 < pieces.length && (
                  <div className="pt-3">
                    <AdSlot format="in-content" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-4">
          <SponsorCard sponsor={SPONSORS.dealflow} />
          <AdSlot format="half-page" className="hidden lg:flex" />
          <NewsletterCard />
        </aside>
      </div>
    </>
  );
}
