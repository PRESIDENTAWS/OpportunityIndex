import seed from "@contract/opportunities.seed.json";
import { FUNDING_PROGRAM_ROWS } from "@/data/funding";
import { CATEGORY_ROWS } from "@/data/reference";
import {
  computeOverallScore,
  rateAll,
  SCORING_MODEL,
} from "./scoring-model";
import type {
  CategorySlug,
  Flexibility,
  FundingProgramRow,
  OpportunityRow,
} from "./contract";
import type {
  Category,
  FundingProgram,
  Opportunity,
  ScoringFactor,
} from "./types";

/**
 * The single data-access boundary.
 *
 * Every page and component reads domain data through this module and nothing
 * else — no route imports a dataset directly. Functions are async so that
 * swapping the fixture source for Supabase in Phase 2 changes this file and
 * nothing that calls it.
 *
 * Responsibilities, in order:
 *   1. Load contract-shaped rows (fixtures today, Postgres later)
 *   2. Translate snake_case rows to camelCase domain objects, exactly once
 *   3. Apply filtering and sorting
 */

// -----------------------------------------------------------------------------
// Fixture source
// -----------------------------------------------------------------------------

/**
 * Opportunities come from `data/opportunities.seed.json` — the same file
 * `supabase/seed.sql` loads into the database, so the fixture and the seed
 * cannot drift.
 */
type SeedOpportunity = Omit<OpportunityRow, "overall_score">;

const SEED_OPPORTUNITIES = (seed as { opportunities: SeedOpportunity[] }).opportunities;

/**
 * Stands in for `opportunities.overall_score`, which Postgres generates.
 *
 * The arithmetic lives in src/lib/scoring-model.ts, so this cannot disagree
 * with the model the site publishes. When Supabase is connected, the column is
 * read from the database and this mapping drops the `overall_score` line.
 */
const OPPORTUNITY_ROWS: OpportunityRow[] = SEED_OPPORTUNITIES.map((row) => ({
  ...row,
  overall_score: computeOverallScore(row),
}));

// -----------------------------------------------------------------------------
// Display labels for enum values
// -----------------------------------------------------------------------------
// Enum labels are stored lowercase; capitalisation is presentation-only.

const FLEXIBILITY_LABELS: Record<Flexibility, string> = {
  anywhere: "Anywhere",
  remote: "Remote",
  local: "Local",
};

export function flexibilityLabel(value: Flexibility): string {
  return FLEXIBILITY_LABELS[value];
}

// -----------------------------------------------------------------------------
// Row -> domain mappers
// -----------------------------------------------------------------------------

const CATEGORY_LABELS = new Map(CATEGORY_ROWS.map((c) => [c.slug, c.label]));

function toCategory(row: (typeof CATEGORY_ROWS)[number]): Category {
  return { slug: row.slug, label: row.label, description: row.description };
}

function toOpportunity(row: OpportunityRow): Opportunity {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    icon: row.icon,
    categorySlug: row.category_slug,
    categoryLabel: CATEGORY_LABELS.get(row.category_slug) ?? row.category_slug,
    startupCost: {
      min: row.startup_cost_min,
      max: row.startup_cost_max,
      openEnded: row.startup_cost_open_ended,
    },
    monthlyProfit: {
      min: row.monthly_profit_min,
      max: row.monthly_profit_max,
      openEnded: row.monthly_profit_open_ended,
    },
    hoursPerWeek: { min: row.hours_per_week_min, max: row.hours_per_week_max },
    flexibility: row.flexibility,
    flexibilityLabel: FLEXIBILITY_LABELS[row.flexibility],
    summary: row.summary,
    skills: row.skills,
    pros: row.pros,
    cons: row.cons,
    tools: row.tools,
    steps: [...row.steps].sort((a, b) => a.position - b.position),
    factors: rateAll(row),
    score: row.overall_score,
    reviewedAt: row.reviewed_at,
  };
}

function toFundingProgram(row: FundingProgramRow): FundingProgram {
  return {
    slug: row.slug,
    name: row.name,
    fundingType: row.funding_type,
    amount: { min: row.amount_min, max: row.amount_max, openEnded: false },
    typicalRate: row.typical_rate,
    speed: row.speed,
    minCreditScore: row.min_credit_score,
    timeInBusiness: row.time_in_business,
    bestFor: row.best_for,
    summary: row.summary,
    requirements: row.requirements,
    reviewedAt: row.reviewed_at,
  };
}

// -----------------------------------------------------------------------------
// Filtering vocabulary
// -----------------------------------------------------------------------------

export interface CostBand {
  id: string;
  label: string;
  min: number;
  max: number;
}

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

export const FLEXIBILITY_VALUES: Flexibility[] = ["anywhere", "remote", "local"];

export interface Band {
  id: string;
  label: string;
  min: number;
  max: number;
}

/**
 * Income-potential bands, matched against each opportunity's realistic monthly
 * ceiling. "Up to $2,000" means the ceiling lands in that band, not that the
 * opportunity can never exceed it.
 */
export const INCOME_BANDS: Band[] = [
  { id: "to-2000", label: "Up to $2,000 / mo", min: 0, max: 2_000 },
  { id: "2000-5000", label: "$2,000 – $5,000 / mo", min: 2_000, max: 5_000 },
  { id: "5000-10000", label: "$5,000 – $10,000 / mo", min: 5_000, max: 10_000 },
  { id: "10000-plus", label: "$10,000+ / mo", min: 10_000, max: Infinity },
];

/** Time bands, matched against the minimum hours an opportunity needs. */
export const TIME_BANDS: Band[] = [
  { id: "to-10", label: "Under 10 hrs / week", min: 0, max: 10 },
  { id: "10-20", label: "10 – 20 hrs / week", min: 10, max: 20 },
  { id: "20-plus", label: "20+ hrs / week", min: 20, max: Infinity },
];

export interface OpportunityFilters {
  search?: string;
  categories?: CategorySlug[];
  costBands?: string[];
  incomeBands?: string[];
  timeBands?: string[];
  flexibility?: Flexibility[];
  sort?: SortKey;
}

// -----------------------------------------------------------------------------
// Reference queries
// -----------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  return [...CATEGORY_ROWS]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toCategory);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const row = CATEGORY_ROWS.find((c) => c.slug === slug);
  return row ? toCategory(row) : undefined;
}

export async function getScoringFactors(): Promise<ScoringFactor[]> {
  return SCORING_MODEL.map(({ key, label, description, weight }) => ({
    key,
    label,
    description,
    weight,
  }));
}

// -----------------------------------------------------------------------------
// Opportunity queries
// -----------------------------------------------------------------------------

function matchesSearch(o: Opportunity, term: string): boolean {
  return [o.name, o.tagline, o.summary, ...o.skills, ...o.tools]
    .join(" ")
    .toLowerCase()
    .includes(term);
}

/**
 * A startup cost falls in a band when its floor does. Testing the minimum keeps
 * "$0 – $500" from matching a business that merely starts within reach of it.
 */
function matchesCostBand(o: Opportunity, bandIds: string[]): boolean {
  return bandIds.some((id) => {
    const band = COST_BANDS.find((b) => b.id === id);
    if (!band) return false;
    return o.startupCost.min >= band.min && o.startupCost.min < band.max;
  });
}

/** An opportunity's income ceiling falls inside one of the selected bands. */
function matchesIncomeBand(o: Opportunity, bandIds: string[]): boolean {
  return bandIds.some((id) => {
    const band = INCOME_BANDS.find((b) => b.id === id);
    if (!band) return false;
    return o.monthlyProfit.max >= band.min && o.monthlyProfit.max < band.max;
  });
}

/** The hours an opportunity needs at minimum fall inside a selected band. */
function matchesTimeBand(o: Opportunity, bandIds: string[]): boolean {
  return bandIds.some((id) => {
    const band = TIME_BANDS.find((b) => b.id === id);
    if (!band) return false;
    return o.hoursPerWeek.min >= band.min && o.hoursPerWeek.min < band.max;
  });
}

function sortOpportunities(list: Opportunity[], sort: SortKey): Opportunity[] {
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
      return sorted.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  }
}

export async function listOpportunities(
  filters: OpportunityFilters = {},
): Promise<Opportunity[]> {
  let results = OPPORTUNITY_ROWS.map(toOpportunity);

  const term = filters.search?.trim().toLowerCase();
  if (term) results = results.filter((o) => matchesSearch(o, term));
  if (filters.categories?.length) {
    results = results.filter((o) => filters.categories!.includes(o.categorySlug));
  }
  if (filters.costBands?.length) {
    results = results.filter((o) => matchesCostBand(o, filters.costBands!));
  }
  if (filters.incomeBands?.length) {
    results = results.filter((o) => matchesIncomeBand(o, filters.incomeBands!));
  }
  if (filters.timeBands?.length) {
    results = results.filter((o) => matchesTimeBand(o, filters.timeBands!));
  }
  if (filters.flexibility?.length) {
    results = results.filter((o) => filters.flexibility!.includes(o.flexibility));
  }

  return sortOpportunities(results, filters.sort ?? "score");
}

export async function countOpportunities(): Promise<number> {
  return OPPORTUNITY_ROWS.length;
}

export async function getOpportunity(slug: string): Promise<Opportunity | undefined> {
  const row = OPPORTUNITY_ROWS.find((o) => o.slug === slug);
  return row ? toOpportunity(row) : undefined;
}

export async function getOpportunitySlugs(): Promise<string[]> {
  return OPPORTUNITY_ROWS.map((o) => o.slug);
}

/** Same category first, then nearest score — used for "Compare with". */
export async function getRelatedOpportunities(
  slug: string,
  limit = 3,
): Promise<Opportunity[]> {
  const target = await getOpportunity(slug);
  if (!target) return [];
  return OPPORTUNITY_ROWS.map(toOpportunity)
    .filter((o) => o.slug !== slug)
    .sort((a, b) => {
      const sameCategory =
        Number(b.categorySlug === target.categorySlug) -
        Number(a.categorySlug === target.categorySlug);
      if (sameCategory !== 0) return sameCategory;
      return Math.abs(a.score - target.score) - Math.abs(b.score - target.score);
    })
    .slice(0, limit);
}

export async function getCategoryCounts(): Promise<
  { category: Category; count: number }[]
> {
  const categories = await getCategories();
  return categories.map((category) => ({
    category,
    count: OPPORTUNITY_ROWS.filter((o) => o.category_slug === category.slug).length,
  }));
}

// -----------------------------------------------------------------------------
// Funding queries
// -----------------------------------------------------------------------------

export async function listFundingPrograms(): Promise<FundingProgram[]> {
  return FUNDING_PROGRAM_ROWS.map(toFundingProgram);
}

export async function getFundingProgram(
  slug: string,
): Promise<FundingProgram | undefined> {
  const row = FUNDING_PROGRAM_ROWS.find((f) => f.slug === slug);
  return row ? toFundingProgram(row) : undefined;
}

export async function getFundingProgramSlugs(): Promise<string[]> {
  return FUNDING_PROGRAM_ROWS.map((f) => f.slug);
}

