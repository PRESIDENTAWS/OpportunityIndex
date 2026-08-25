import { COST_BANDS, SORT_OPTIONS, type OpportunityFilters, type SortKey } from "./queries";
import { CATEGORIES, type CategorySlug } from "./types";

type RawParams = Record<string, string | string[] | undefined>;

function list(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

const FLEXIBILITY = ["Anywhere", "Remote", "Local"];

/**
 * Turns raw search params into filters, discarding anything not in the known
 * vocabulary so a hand-edited URL can never produce a broken query.
 */
export function parseFilters(params: RawParams): OpportunityFilters {
  const categorySlugs = CATEGORIES.map((c) => c.slug) as string[];
  const bandIds = COST_BANDS.map((b) => b.id);
  const sortKeys = SORT_OPTIONS.map((s) => s.key) as string[];
  const sort = typeof params.sort === "string" && sortKeys.includes(params.sort)
    ? (params.sort as SortKey)
    : "score";

  return {
    search: typeof params.q === "string" ? params.q : undefined,
    categories: list(params.category).filter((c) => categorySlugs.includes(c)) as CategorySlug[],
    costBands: list(params.cost).filter((c) => bandIds.includes(c)),
    flexibility: list(params.flex).filter((f) => FLEXIBILITY.includes(f)),
    sort,
  };
}
