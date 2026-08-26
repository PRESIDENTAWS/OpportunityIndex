import type { MetadataRoute } from "next";
import {
  getCategories,
  listBusinessListings,
  listFranchises,
  listFundingPrograms,
  listOpportunities,
  listResearchPieces,
} from "@/lib/repository";

const BASE = "https://opportunityindex.com";

const STATIC_PATHS = [
  "",
  "/hustles",
  "/businesses",
  "/businesses-for-sale",
  "/franchises",
  "/funding",
  "/research",
  "/tools",
  "/tools/startup-cost",
  "/tools/break-even",
  "/tools/compare",
  "/about",
  "/methodology",
  "/advertise",
  "/contact",
  "/newsletter",
  "/privacy",
  "/terms",
  "/disclaimer",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, opportunities, listings, franchises, funding, research] =
    await Promise.all([
      getCategories(),
      listOpportunities(),
      listBusinessListings(),
      listFranchises(),
      listFundingPrograms(),
      listResearchPieces(),
    ]);

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...entries,
    ...categories.map((c) => ({ url: `${BASE}/businesses/${c.slug}`, priority: 0.6 })),
    ...opportunities.map((o) => ({
      url: `${BASE}/hustles/${o.slug}`,
      lastModified: new Date(o.reviewedAt),
      priority: 0.8,
    })),
    ...listings.map((l) => ({
      url: `${BASE}/businesses-for-sale/${l.slug}`,
      lastModified: new Date(l.reviewedAt),
      priority: 0.6,
    })),
    ...franchises.map((f) => ({
      url: `${BASE}/franchises/${f.slug}`,
      lastModified: new Date(f.reviewedAt),
      priority: 0.6,
    })),
    ...funding.map((f) => ({ url: `${BASE}/funding/${f.slug}`, priority: 0.6 })),
    ...research.map((r) => ({
      url: `${BASE}/research/${r.slug}`,
      lastModified: new Date(r.publishedAt),
      priority: 0.6,
    })),
  ];
}
