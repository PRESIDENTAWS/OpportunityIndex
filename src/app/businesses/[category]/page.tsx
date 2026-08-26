import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndexLayout } from "@/components/IndexLayout";
import { PageHeader } from "@/components/PageShell";
import { parseFilters } from "@/lib/params";
import { getCategories, getCategory, listOpportunities } from "@/lib/repository";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const match = await getCategory(category);
  if (!match) return { title: "Not found" };
  return { title: `${match.label} Business Models`, description: match.description };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await params;
  const match = await getCategory(category);
  if (!match) notFound();

  const filters = parseFilters(await searchParams);
  // The route's own category wins over anything in the query string.
  const [results, categories] = await Promise.all([
    listOpportunities({ ...filters, categories: [match.slug] }),
    getCategories(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={`${match.label} Business Models`}
        description={match.description}
      />
      <IndexLayout results={results} categories={categories} />
    </>
  );
}
