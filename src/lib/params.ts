import {
  COST_BANDS,
  FLEXIBILITY_VALUES,
  SORT_OPTIONS,
  type OpportunityFilters,
  type SortKey,
} from "./repository";
import type { CategorySlug, Flexibility } from "./contract";

type RawParams = Record<string, string | string[] | undefined>;

/** Canonical category slugs, per docs/DATA_MODEL.md. */
const CATEGORY_SLUGS: CategorySlug[] = [
  "online",
  "service",
  "ecommerce",
  "local",
  "creative",
];

function list(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Turns raw search params into filters, discarding anything outside the known
 * vocabulary so a hand-edited URL can never produce a broken query.
 */
export function parseFilters(params: RawParams): OpportunityFilters {
  const bandIds = COST_BANDS.map((b) => b.id);
  const sortKeys = SORT_OPTIONS.map((s) => s.key) as string[];
  const sort =
    typeof params.sort === "string" && sortKeys.includes(params.sort)
      ? (params.sort as SortKey)
      : "score";

  return {
    search: typeof params.q === "string" ? params.q : undefined,
    categories: list(params.category).filter((c): c is CategorySlug =>
      (CATEGORY_SLUGS as string[]).includes(c),
    ),
    costBands: list(params.cost).filter((c) => bandIds.includes(c)),
    flexibility: list(params.flex).filter((f): f is Flexibility =>
      (FLEXIBILITY_VALUES as string[]).includes(f),
    ),
    sort,
  };
}
