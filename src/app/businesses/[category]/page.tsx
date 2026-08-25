import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndexLayout } from "@/components/IndexLayout";
import { PageHeader } from "@/components/PageShell";
import { parseFilters } from "@/lib/params";
import { filterOpportunities } from "@/lib/queries";
import { CATEGORIES, type CategorySlug } from "@/lib/types";

const BLURBS: Record<CategorySlug, string> = {
  online: "Digital products, audiences, and affiliate models. Cheap to start, slow to distribute, and the most scalable end of the index.",
  service: "You sell expertise and time. The fastest route to a first paying customer, and the one most bounded by hours in a week.",
  "e-commerce": "Physical products through your own store or a marketplace. The best margins in the index, funded by the most working capital.",
  "local-business": "Route, trade, and premises work in one geography. Unfashionable, recurring, and consistently the fastest to real monthly revenue.",
  creative: "Craft, media, and content. High ceilings and long runways — these reward patience more than capital.",
};

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const match = CATEGORIES.find((c) => c.slug === category);
  if (!match) return { title: "Not found" };
  return { title: `${match.label} Business Models`, description: BLURBS[match.slug] };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await params;
  const match = CATEGORIES.find((c) => c.slug === category);
  if (!match) notFound();

  const filters = parseFilters(await searchParams);
  // The route's own category wins over anything in the query string.
  const results = filterOpportunities({ ...filters, categories: [match.slug] });

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={`${match.label} Business Models`}
        description={BLURBS[match.slug]}
      />
      <IndexLayout results={results} />
    </>
  );
}
