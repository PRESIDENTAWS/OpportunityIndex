import seed from "@contract/opportunities.seed.json";
import { FUNDING_PROGRAM_ROWS } from "@/data/funding";
import { CATEGORY_ROWS } from "@/data/reference";
import {
  computeOverallScore,
  rateAll,
  SCORING_MODEL,
} from "./scoring-model";
import { getPublicSupabase } from "./supabase/server";
import type {
  CategoryRow,
  CategorySlug,
  Flexibility,
  FundingProgramRow,
  OpportunityRow,
  OpportunityStepRow,
  ScoringFactorRow,
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
 * Production reads public content from Supabase through the publishable-key
 * client, so Row Level Security remains enforced. When public Supabase
 * credentials are absent, local development and CI use the canonical fixtures.
 * A configured Supabase query failure is not hidden behind fixtures: it throws.
 */

// -----------------------------------------------------------------------------
// Canonical fixture fallback
// -----------------------------------------------------------------------------

type SeedOpportunity = Omit<OpportunityRow, "overall_score">;

const SEED_OPPORTUNITIES = (seed as { opportunities: SeedOpportunity[] }).opportunities;

const FIXTURE_OPPORTUNITY_ROWS: OpportunityRow[] = SEED_OPPORTUNITIES.map((row) => ({
  ...row,
  overall_score: computeOverallScore(row),
}));

const FIXTURE_SCORING_ROWS: ScoringFactorRow[] = SCORING_MODEL.map(
  ({ key, label, description, weight }, index) => ({
    key,
    label,
    description,
    weight,
    sort_order: index + 1,
  }),
);

type SupabaseOpportunityRecord = Omit<OpportunityRow, "steps"> & {
  opportunity_steps: OpportunityStepRow[] | null;
};

function databaseFailure(context: string, error: { message?: string }): never {
  throw new Error(`Supabase ${context} failed: ${error.message ?? "unknown error"}`);
}

async function loadCategoryRows(): Promise<CategoryRow[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [...CATEGORY_ROWS] as CategoryRow[];

  const { data, error } = await supabase
    .from("categories")
    .select("slug,label,description,sort_order")
    .order("sort_order", { ascending: true });

  if (error) databaseFailure("category read", error);
  return (data ?? []) as CategoryRow[];
}

async function loadScoringFactorRows(): Promise<ScoringFactorRow[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return FIXTURE_SCORING_ROWS;

  const { data, error } = await supabase
    .from("scoring_factors")
    .select("key,label,description,weight,sort_order")
    .order("sort_order", { ascending: true });

  if (error) databaseFailure("scoring-factor read", error);
  return (data ?? []) as ScoringFactorRow[];
}

async function loadOpportunityRows(): Promise<OpportunityRow[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return FIXTURE_OPPORTUNITY_ROWS;

  const { data, error } = await supabase
    .from("opportunities")
    .select(`
      slug,
      name,
      tagline,
      icon,
      category_slug,
      startup_cost_min,
      startup_cost_max,
      startup_cost_open_ended,
      monthly_profit_min,
      monthly_profit_max,
      monthly_profit_open_ended,
      hours_per_week_min,
      hours_per_week_max,
      flexibility,
      summary,
      factor_demand,
      factor_profit_potential,
      factor_startup_cost,
      factor_time_to_revenue,
      factor_scalability,
      factor_competition,
      overall_score,
      skills,
      pros,
      cons,
      tools,
      reviewed_at,
      opportunity_steps(position,title,detail)
    `);

  if (error) databaseFailure("opportunity read", error);

  return ((data ?? []) as SupabaseOpportunityRecord[]).map(
    ({ opportunity_steps, ...row }) => ({
      ...row,
      steps: opportunity_steps ?? [],
    }),
  );
}

async function loadFundingRows(): Promise<FundingProgramRow[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [...FUNDING_PROGRAM_ROWS];

  const { data, error } = await supabase
    .from("funding_programs")
    .select(`
      slug,
      name,
      funding_type,
      amount_min,
      amount_max,
      typical_rate,
      speed,
      min_credit_score,
      time_in_business,
      best_for,
      summary,
      requirements,
      reviewed_at
    `)
    .order("name", { ascending: true });

  if (error) databaseFailure("funding-program read", error);
  return (data ?? []) as FundingProgramRow[];
}

// -----------------------------------------------------------------------------
// Display labels for enum values
// -----------------------------------------------------------------------------

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

function toCategory(row: CategoryRow): Category {
  return { slug: row.slug, label: row.label, description: row.description };
}

function toOpportunity(
  row: OpportunityRow,
  categoryLabels: ReadonlyMap<CategorySlug, string>,
): Opportunity {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    icon: row.icon,
    categorySlug: row.category_slug,
    categoryLabel: categoryLabels.get(row.category_slug) ?? row.category_slug,
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

function categoryLabelMap(rows: CategoryRow[]): Map<CategorySlug, string> {
  return new Map(rows.map((category) => [category.slug, category.label]));
}

async function loadOpportunityDomainRows(): Promise<Opportunity[]> {
  const [rows, categories] = await Promise.all([loadOpportunityRows(), loadCategoryRows()]);
  const labels = categoryLabelMap(categories);
  return rows.map((row) => toOpportunity(row, labels));
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

export const INCOME_BANDS: Band[] = [
  { id: "to-2000", label: "Up to $2,000 / mo", min: 0, max: 2_000 },
  { id: "2000-5000", label: "$2,000 – $5,000 / mo", min: 2_000, max: 5_000 },
  { id: "5000-10000", label: "$5,000 – $10,000 / mo", min: 5_000, max: 10_000 },
  { id: "10000-plus", label: "$10,000+ / mo", min: 10_000, max: Infinity },
];

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
  return (await loadCategoryRows()).map(toCategory);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const row = (await loadCategoryRows()).find((category) => category.slug === slug);
  return row ? toCategory(row) : undefined;
}

export async function getScoringFactors(): Promise<ScoringFactor[]> {
  return (await loadScoringFactorRows()).map(({ key, label, description, weight }) => ({
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

function matchesCostBand(o: Opportunity, bandIds: string[]): boolean {
  return bandIds.some((id) => {
    const band = COST_BANDS.find((candidate) => candidate.id === id);
    if (!band) return false;
    return o.startupCost.min >= band.min && o.startupCost.min < band.max;
  });
}

function matchesIncomeBand(o: Opportunity, bandIds: string[]): boolean {
  return bandIds.some((id) => {
    const band = INCOME_BANDS.find((candidate) => candidate.id === id);
    if (!band) return false;
    return o.monthlyProfit.max >= band.min && o.monthlyProfit.max < band.max;
  });
}

function matchesTimeBand(o: Opportunity, bandIds: string[]): boolean {
  return bandIds.some((id) => {
    const band = TIME_BANDS.find((candidate) => candidate.id === id);
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
  let results = await loadOpportunityDomainRows();

  const term = filters.search?.trim().toLowerCase();
  if (term) results = results.filter((opportunity) => matchesSearch(opportunity, term));
  if (filters.categories?.length) {
    results = results.filter((opportunity) =>
      filters.categories!.includes(opportunity.categorySlug),
    );
  }
  if (filters.costBands?.length) {
    results = results.filter((opportunity) => matchesCostBand(opportunity, filters.costBands!));
  }
  if (filters.incomeBands?.length) {
    results = results.filter((opportunity) =>
      matchesIncomeBand(opportunity, filters.incomeBands!),
    );
  }
  if (filters.timeBands?.length) {
    results = results.filter((opportunity) => matchesTimeBand(opportunity, filters.timeBands!));
  }
  if (filters.flexibility?.length) {
    results = results.filter((opportunity) =>
      filters.flexibility!.includes(opportunity.flexibility),
    );
  }

  return sortOpportunities(results, filters.sort ?? "score");
}

export async function countOpportunities(): Promise<number> {
  return (await loadOpportunityRows()).length;
}

export async function getOpportunity(slug: string): Promise<Opportunity | undefined> {
  return (await loadOpportunityDomainRows()).find((opportunity) => opportunity.slug === slug);
}

export async function getOpportunitySlugs(): Promise<string[]> {
  return (await loadOpportunityRows()).map((opportunity) => opportunity.slug);
}

export async function getRelatedOpportunities(
  slug: string,
  limit = 3,
): Promise<Opportunity[]> {
  const opportunities = await loadOpportunityDomainRows();
  const target = opportunities.find((opportunity) => opportunity.slug === slug);
  if (!target) return [];

  return opportunities
    .filter((opportunity) => opportunity.slug !== slug)
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
  const [categories, opportunities] = await Promise.all([
    loadCategoryRows(),
    loadOpportunityRows(),
  ]);

  return categories.map((row) => ({
    category: toCategory(row),
    count: opportunities.filter((opportunity) => opportunity.category_slug === row.slug).length,
  }));
}

// -----------------------------------------------------------------------------
// Funding queries
// -----------------------------------------------------------------------------

export async function listFundingPrograms(): Promise<FundingProgram[]> {
  return (await loadFundingRows()).map(toFundingProgram);
}

export async function getFundingProgram(
  slug: string,
): Promise<FundingProgram | undefined> {
  const row = (await loadFundingRows()).find((funding) => funding.slug === slug);
  return row ? toFundingProgram(row) : undefined;
}

export async function getFundingProgramSlugs(): Promise<string[]> {
  return (await loadFundingRows()).map((funding) => funding.slug);
}
