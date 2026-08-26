import seed from "@contract/opportunities.seed.json";
import { FRANCHISE_ROWS } from "@/data/franchises";
import { FUNDING_PROGRAM_ROWS } from "@/data/funding";
import { BUSINESS_LISTING_ROWS } from "@/data/listings";
import { CATEGORY_ROWS, SCORING_FACTOR_ROWS } from "@/data/reference";
import { RESEARCH_PIECE_ROWS } from "@/data/research";
import type {
  BusinessListingRow,
  CategorySlug,
  Flexibility,
  FranchiseRow,
  FundingProgramRow,
  OpportunityRow,
  ResearchKind,
  ResearchPieceRow,
} from "./contract";
import type {
  BusinessListing,
  Category,
  Franchise,
  FundingProgram,
  Opportunity,
  ResearchPiece,
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
 * This is the one place in the application permitted to evaluate the scoring
 * formula, and it exists only because there is no database yet. It uses the
 * published weights from `scoring_factors` rather than hard-coded numbers, so
 * it cannot disagree with the methodology the site renders. In Phase 2 this
 * function is deleted and the column is read from the database instead.
 */
function generatedOverallScore(row: SeedOpportunity): number {
  const factors: Record<string, number> = {
    demand: row.factor_demand,
    profit_potential: row.factor_profit_potential,
    startup_cost: row.factor_startup_cost,
    time_to_revenue: row.factor_time_to_revenue,
    scalability: row.factor_scalability,
    competition: row.factor_competition,
  };
  const total = SCORING_FACTOR_ROWS.reduce(
    (sum, factor) => sum + factors[factor.key] * factor.weight,
    0,
  );
  return Math.round(total);
}

const OPPORTUNITY_ROWS: OpportunityRow[] = SEED_OPPORTUNITIES.map((row) => ({
  ...row,
  overall_score: generatedOverallScore(row),
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

const RESEARCH_KIND_LABELS: Record<ResearchKind, string> = {
  report: "Report",
  guide: "Guide",
  data_study: "Data Study",
};

export function flexibilityLabel(value: Flexibility): string {
  return FLEXIBILITY_LABELS[value];
}

export function researchKindLabel(value: ResearchKind): string {
  return RESEARCH_KIND_LABELS[value];
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
    factors: {
      demand: row.factor_demand,
      profit_potential: row.factor_profit_potential,
      startup_cost: row.factor_startup_cost,
      time_to_revenue: row.factor_time_to_revenue,
      scalability: row.factor_scalability,
      competition: row.factor_competition,
    },
    score: row.overall_score,
    reviewedAt: row.reviewed_at,
  };
}

function toBusinessListing(row: BusinessListingRow): BusinessListing {
  return {
    slug: row.slug,
    name: row.name,
    industry: row.industry,
    location: row.location,
    askingPrice: row.asking_price,
    annualRevenue: row.annual_revenue,
    cashFlow: row.cash_flow,
    establishedYear: row.established_year,
    employeeCount: row.employee_count,
    ownerFinancing: row.owner_financing,
    reasonForSale: row.reason_for_sale,
    highlights: row.highlights,
    status: row.status,
    reviewedAt: row.reviewed_at,
    cashFlowMultiple: row.asking_price / row.cash_flow,
  };
}

function toFranchise(row: FranchiseRow): Franchise {
  return {
    slug: row.slug,
    name: row.name,
    industry: row.industry,
    franchiseFee: row.franchise_fee,
    totalInvestment: {
      min: row.total_investment_min,
      max: row.total_investment_max,
      openEnded: false,
    },
    royalty: row.royalty,
    liquidCapitalRequired: row.liquid_capital_required,
    unitCount: row.unit_count,
    foundedYear: row.founded_year,
    summary: row.summary,
    support: row.support,
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

function toResearchPiece(row: ResearchPieceRow): ResearchPiece {
  return {
    slug: row.slug,
    title: row.title,
    kind: row.kind,
    kindLabel: RESEARCH_KIND_LABELS[row.kind],
    excerpt: row.excerpt,
    body: row.body,
    takeaways: row.takeaways,
    readingTimeMinutes: row.reading_time_minutes,
    publishedAt: row.published_at,
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

export interface OpportunityFilters {
  search?: string;
  categories?: CategorySlug[];
  costBands?: string[];
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
  return [...SCORING_FACTOR_ROWS]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(({ key, label, description, weight }) => ({ key, label, description, weight }));
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
// Business listing queries
// -----------------------------------------------------------------------------

export async function listBusinessListings(): Promise<BusinessListing[]> {
  return BUSINESS_LISTING_ROWS.map(toBusinessListing);
}

export async function getBusinessListing(
  slug: string,
): Promise<BusinessListing | undefined> {
  const row = BUSINESS_LISTING_ROWS.find((l) => l.slug === slug);
  return row ? toBusinessListing(row) : undefined;
}

export async function getBusinessListingSlugs(): Promise<string[]> {
  return BUSINESS_LISTING_ROWS.map((l) => l.slug);
}

// -----------------------------------------------------------------------------
// Franchise queries
// -----------------------------------------------------------------------------

export async function listFranchises(): Promise<Franchise[]> {
  return FRANCHISE_ROWS.map(toFranchise);
}

export async function getFranchise(slug: string): Promise<Franchise | undefined> {
  const row = FRANCHISE_ROWS.find((f) => f.slug === slug);
  return row ? toFranchise(row) : undefined;
}

export async function getFranchiseSlugs(): Promise<string[]> {
  return FRANCHISE_ROWS.map((f) => f.slug);
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

// -----------------------------------------------------------------------------
// Research queries
// -----------------------------------------------------------------------------

export const RESEARCH_KINDS: ResearchKind[] = ["report", "guide", "data_study"];

export async function listResearchPieces(kind?: ResearchKind): Promise<ResearchPiece[]> {
  const rows = kind
    ? RESEARCH_PIECE_ROWS.filter((r) => r.kind === kind)
    : RESEARCH_PIECE_ROWS;
  return [...rows]
    .sort((a, b) => b.published_at.localeCompare(a.published_at))
    .map(toResearchPiece);
}

export async function getResearchPiece(slug: string): Promise<ResearchPiece | undefined> {
  const row = RESEARCH_PIECE_ROWS.find((r) => r.slug === slug);
  return row ? toResearchPiece(row) : undefined;
}

export async function getResearchPieceSlugs(): Promise<string[]> {
  return RESEARCH_PIECE_ROWS.map((r) => r.slug);
}
