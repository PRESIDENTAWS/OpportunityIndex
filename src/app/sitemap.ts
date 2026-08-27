import type { MetadataRoute } from "next";
import {
  getFundingProgramSlugs,
  listOpportunities,
} from "@/lib/repository";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://opportunityindex.com";

const STATIC_PATHS = [
  "",
  "/hustles",
  "/funding",
  "/about",
  "/methodology",
  "/contact",
  "/newsletter",
  "/privacy",
  "/terms",
  "/disclaimer",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [opportunities, fundingSlugs] = await Promise.all([
    listOpportunities(),
    getFundingProgramSlugs(),
  ]);

  return [
    ...STATIC_PATHS.map((path) => ({
      url: `${BASE}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...opportunities.map((o) => ({
      url: `${BASE}/hustles/${o.slug}`,
      lastModified: new Date(o.reviewedAt),
      priority: 0.8,
    })),
    ...fundingSlugs.map((slug) => ({
      url: `${BASE}/funding/${slug}`,
      priority: 0.5,
    })),
  ];
}
