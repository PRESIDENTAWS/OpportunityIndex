import { OPPORTUNITIES } from "@/data/opportunities";
import { overallScore } from "./scoring";
import { CATEGORIES, type CategorySlug, type Opportunity } from "./types";

export interface CostBand {
  id: string;
  label: string;
  min: number;
  max: number;
}

/** Startup-cost bands offered in the filter rail. */
export const COST_BANDS: CostBand[] = [
  { id: "0-500", label: "$0 – $500", min: 0, max: 500 },
  { id: "500-5000", label: "$500 – $5,000", min: 500, max: 5000 },
  { id: "5000-25000", label: "$5,000 – $25,000", min: 5000, max: 25000 },
  { id: "25000-plus", label: "$25,000+", min: 25000, max: Infinity },
];

export type SortKey = "score" | "startup-cost" | "profit" | "hours" | "name";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "score", label: "Overall Score" },
  { key: "startup-cost", label: "Lowest Startup Cost" },
  { key: "profit", label: "Highest Profit Potential" },
  { key: "hours", label: "Fewest Hours / Week" },
  { key: "name", label: "A – Z" },
];

export interface OpportunityFilters {
  search?: string;
  categories?: CategorySlug[];
  costBands?: string[];
  flexibility?: string[];
  sort?: SortKey;
}

export interface ScoredOpportunity extends Opportunity {
  score: number;
}

/** Every opportunity with its Overall Score attached, ranked highest first. */
export function allScored(): ScoredOpportunity[] {
  return OPPORTUNITIES.map((o) => ({ ...o, score: overallScore(o.factors) })).sort(
    (a, b) => b.score - a.score,
  );
}

function matchesSearch(o: Opportunity, term: string): boolean {
  const haystack = [o.name, o.tagline, o.summary, ...o.skills, ...o.tools]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

/**
 * A startup-cost range counts as inside a band when the two overlap at all —
 * a "$500 – $2,000" business is a legitimate answer to "$0 – $500 or less"
 * only if its floor falls in the band, so we test the range's minimum.
 */
function matchesCostBand(o: Opportunity, bandIds: string[]): boolean {
  return bandIds.some((id) => {
    const band = COST_BANDS.find((b) => b.id === id);
    if (!band) return false;
    return o.startupCost.min >= band.min && o.startupCost.min < band.max;
  });
}

export function filterOpportunities(
  filters: OpportunityFilters,
): ScoredOpportunity[] {
  const term = filters.search?.trim().toLowerCase();
  let results = allScored();

  if (term) results = results.filter((o) => matchesSearch(o, term));
  if (filters.categories?.length) {
    results = results.filter((o) => filters.categories!.includes(o.category));
  }
  if (filters.costBands?.length) {
    results = results.filter((o) => matchesCostBand(o, filters.costBands!));
  }
  if (filters.flexibility?.length) {
    results = results.filter((o) => filters.flexibility!.includes(o.flexibility));
  }

  return sortOpportunities(results, filters.sort ?? "score");
}

export function sortOpportunities(
  list: ScoredOpportunity[],
  sort: SortKey,
): ScoredOpportunity[] {
  const sorted = [...list];
  switch (sort) {
    case "startup-cost":
      return sorted.sort((a, b) => a.startupCost.min - b.startupCost.min);
    case "profit":
      return sorted.sort((a, b) => b.monthlyProfit.max - a.monthlyProfit.max);
    case "hours":
      return sorted.sort((a, b) => a.hoursPerWeek.min - b.hoursPerWeek.min);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "score":
    default:
      return sorted.sort((a, b) => b.score - a.score);
  }
}

export function getOpportunity(slug: string): ScoredOpportunity | undefined {
  return allScored().find((o) => o.slug === slug);
}

/** Same category, nearest score — used for "Compare with" on detail pages. */
export function relatedOpportunities(
  slug: string,
  limit = 3,
): ScoredOpportunity[] {
  const target = getOpportunity(slug);
  if (!target) return [];
  return allScored()
    .filter((o) => o.slug !== slug)
    .sort((a, b) => {
      const categoryGap =
        Number(b.category === target.category) - Number(a.category === target.category);
      if (categoryGap !== 0) return categoryGap;
      return Math.abs(a.score - target.score) - Math.abs(b.score - target.score);
    })
    .slice(0, limit);
}

export function categoryCounts(): { slug: CategorySlug; label: string; count: number }[] {
  return CATEGORIES.map((c) => ({
    ...c,
    count: OPPORTUNITIES.filter((o) => o.category === c.slug).length,
  }));
}

export function categoryLabel(slug: CategorySlug): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
