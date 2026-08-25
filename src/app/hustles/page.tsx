import type { Metadata } from "next";
import { IndexLayout } from "@/components/IndexLayout";
import { PageHeader } from "@/components/PageShell";
import { parseFilters } from "@/lib/params";
import { allScored, filterOpportunities } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Side Hustles & Business Models",
  description:
    "Every opportunity in the index, scored on startup cost, profit potential, speed to revenue, demand, scalability, and competition.",
};

export default async function HustlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const results = filterOpportunities(parseFilters(await searchParams));

  return (
    <>
      <PageHeader
        eyebrow="The Index"
        title="Side Hustles & Business Models"
        description={`All ${allScored().length} models in the index, each scored on the same six factors. Filter by what you can actually spend, and sort by what matters to you.`}
      />
      <IndexLayout results={results} />
    </>
  );
}
