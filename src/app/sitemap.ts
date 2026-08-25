import type { MetadataRoute } from "next";
import { FRANCHISES } from "@/data/franchises";
import { FUNDING } from "@/data/funding";
import { LISTINGS } from "@/data/listings";
import { OPPORTUNITIES } from "@/data/opportunities";
import { RESEARCH } from "@/data/research";
import { CATEGORIES } from "@/lib/types";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...entries,
    ...CATEGORIES.map((c) => ({ url: `${BASE}/businesses/${c.slug}`, priority: 0.6 })),
    ...OPPORTUNITIES.map((o) => ({
      url: `${BASE}/hustles/${o.slug}`,
      lastModified: new Date(o.updated),
      priority: 0.8,
    })),
    ...LISTINGS.map((l) => ({
      url: `${BASE}/businesses-for-sale/${l.slug}`,
      lastModified: new Date(l.updated),
      priority: 0.6,
    })),
    ...FRANCHISES.map((f) => ({
      url: `${BASE}/franchises/${f.slug}`,
      lastModified: new Date(f.updated),
      priority: 0.6,
    })),
    ...FUNDING.map((f) => ({ url: `${BASE}/funding/${f.slug}`, priority: 0.6 })),
    ...RESEARCH.map((r) => ({
      url: `${BASE}/research/${r.slug}`,
      lastModified: new Date(r.published),
      priority: 0.6,
    })),
  ];
}
