import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Card, PageHeader, SectionHeading } from "@/components/PageShell";
import { ScoreBadge } from "@/components/ScoreBadge";
import { AdSlot } from "@/components/AdSlot";
import { hoursRange, moneyRange, plural } from "@/lib/format";
import { getCategoryCounts, listOpportunities } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Business Models by Category",
  description:
    "Browse every business model in the index by category — online, service, e-commerce, local, and creative.",
};

export default async function BusinessesPage() {
  const [counts, scored] = await Promise.all([getCategoryCounts(), listOpportunities()]);

  return (
    <>
      <PageHeader
        eyebrow="Categories"
        title="Business Models by Category"
        description="Five categories, one scoring scale. Start where your capital, your schedule, and your appetite for customer contact actually point."
      />

      <div className="container-oi py-8">
        <ul className="space-y-8">
          {counts.map(({ category, count }) => {
            const models = scored.filter((o) => o.categorySlug === category.slug);
            return (
              <li key={category.slug}>
                <SectionHeading
                  title={category.label}
                  count={plural(count, "model")}
                  action={{ label: `All ${category.label}`, href: `/businesses/${category.slug}` }}
                />
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {models.slice(0, 3).map((model) => (
                    <Card as="li" key={model.slug} className="p-4">
                      <Link href={`/hustles/${model.slug}`} className="flex items-start gap-3">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-brand)] border"
                          style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
                        >
                          <Icon name={model.icon} size={19} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{model.name}</span>
                          <span className="mt-1 block text-xs" style={{ color: "var(--fg-muted)" }}>
                            {model.tagline}
                          </span>
                          <span
                            className="mt-2 block text-xs tabular-nums"
                            style={{ color: "var(--fg-faint)" }}
                          >
                            {moneyRange(model.startupCost)} · {hoursRange(model.hoursPerWeek)}
                          </span>
                        </span>
                        <ScoreBadge score={model.score} size="sm" />
                      </Link>
                    </Card>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>

        <div className="mt-10">
          <AdSlot format="leaderboard" note="Footer Leaderboard" />
        </div>
      </div>
    </>
  );
}
