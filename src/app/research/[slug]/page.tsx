import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Icon } from "@/components/Icon";
import { NewsletterCard } from "@/components/NewsletterCard";
import { Breadcrumbs, Card } from "@/components/PageShell";
import { SponsorCard, SPONSORS } from "@/components/SponsorCard";
import { getResearchPiece, getResearchPieceSlugs, listResearchPieces } from "@/lib/repository";
import { formatDate } from "@/lib/format";

export async function generateStaticParams() {
  const slugs = await getResearchPieceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const piece = await getResearchPiece(slug);
  if (!piece) return { title: "Not found" };
  return { title: piece.title, description: piece.excerpt };
}

export default async function ResearchPiecePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const piece = await getResearchPiece(slug);
  if (!piece) notFound();

  const others = (await listResearchPieces())
    .filter((r) => r.slug !== slug)
    .slice(0, 3);

  return (
    <>
      <header className="border-b py-8" style={{ borderColor: "var(--border)" }}>
        <div className="container-oi max-w-3xl">
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: "Research", href: "/research" },
              { label: piece.title },
            ]}
          />
          <p
            className="mt-5 text-[0.6rem] font-semibold tracking-eyebrow uppercase"
            style={{ color: "var(--accent)" }}
          >
            {piece.kindLabel} · {piece.readingTimeMinutes} min read · {formatDate(piece.publishedAt)}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">{piece.title}</h1>
          <p className="mt-3 text-lg" style={{ color: "var(--fg-muted)" }}>
            {piece.excerpt}
          </p>
        </div>
      </header>

      <div className="container-oi grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="max-w-2xl">
          <Card className="p-5">
            <h2 className="text-sm font-bold">Key Takeaways</h2>
            <ul className="mt-3 space-y-2.5">
              {piece.takeaways.map((takeaway) => (
                <li key={takeaway} className="flex gap-2.5 text-sm" style={{ color: "var(--fg-muted)" }}>
                  <Icon
                    name="badge"
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--score-fg)" }}
                  />
                  {takeaway}
                </li>
              ))}
            </ul>
          </Card>

          <div className="my-8">
            <AdSlot format="in-content" />
          </div>

          <div
            className="rounded-[var(--radius-brand)] border border-dashed p-6 text-center"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <Icon name="book" size={26} className="mx-auto" style={{ color: "var(--fg-faint)" }} />
            <p className="mt-3 font-medium">The full write-up is being prepared.</p>
            <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
              The takeaways above are final; the supporting analysis publishes with the
              next index revision.
            </p>
            <Link
              href="/newsletter"
              className="mt-4 inline-flex rounded-[var(--radius-brand)] px-5 py-2.5 text-sm font-semibold"
              style={{ backgroundColor: "var(--bg-inverse)", color: "var(--fg-inverse)" }}
            >
              Get it by email
            </Link>
          </div>

          <section className="mt-10">
            <h2 className="text-lg font-bold">More Research</h2>
            <ul className="mt-4 space-y-3">
              {others.map((other) => (
                <Card as="li" key={other.slug} className="p-4">
                  <Link href={`/research/${other.slug}`} className="block">
                    <p className="text-xs" style={{ color: "var(--fg-faint)" }}>
                      {other.kindLabel}
                    </p>
                    <p className="mt-1 font-semibold">{other.title}</p>
                  </Link>
                </Card>
              ))}
            </ul>
          </section>
        </article>

        <aside className="space-y-4">
          <SponsorCard sponsor={SPONSORS.capitalRecon} />
          <AdSlot format="half-page" className="hidden lg:flex" />
          <NewsletterCard />
        </aside>
      </div>
    </>
  );
}
