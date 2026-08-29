import type {
  CategorySlug,
  Flexibility,
  ListingStatus,
  ResearchKind,
  ScoringFactorKey,
} from "./contract";

export type { CategorySlug, Flexibility, ListingStatus, ResearchKind, ScoringFactorKey };

/**
 * Domain types: what components consume.
 *
 * These are the camelCase counterpart of the snake_case rows in `contract.ts`.
 * The repository translates between them exactly once, per the naming
 * translation rules in `docs/DATA_MODEL.md`.
 */

/** A money range in whole US dollars. `openEnded` renders the max as "$X+". */
export interface MoneyRange {
  min: number;
  max: number;
  openEnded: boolean;
}

/** Hours per week. The contract defines no open-ended form for these. */
export interface HoursRange {
  min: number;
  max: number;
}

export interface Category {
  slug: CategorySlug;
  label: string;
  description: string;
}

export interface ScoringFactor {
  key: ScoringFactorKey;
  label: string;
  description: string;
  weight: number;
}

export interface OpportunityStep {
  position: number;
  title: string;
  detail: string;
}

export interface Opportunity {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  categorySlug: CategorySlug;
  categoryLabel: string;

  startupCost: MoneyRange;
  monthlyProfit: MoneyRange;
  hoursPerWeek: HoursRange;

  flexibility: Flexibility;
  /** Display form of `flexibility`. Capitalisation is presentation-only. */
  flexibilityLabel: string;

  summary: string;
  skills: string[];
  pros: string[];
  cons: string[];
  tools: string[];
  steps: OpportunityStep[];

  /** Each scored dimension, 0-100, higher always better for the operator. */
  factors: Record<ScoringFactorKey, number>;

  /**
   * The database's generated `overall_score`. Read, never recomputed — see
   * `docs/DATA_MODEL.md`.
   */
  score: number;

  /** Editorial review date, not a row modification timestamp. */
  reviewedAt: string;
}

export interface BusinessListing {
  slug: string;
  name: string;
  industry: string;
  location: string;
  askingPrice: number;
  annualRevenue: number;
  cashFlow: number;
  establishedYear: number;
  employeeCount: number;
  ownerFinancing: boolean;
  reasonForSale: string;
  highlights: string[];
  status: ListingStatus;
  reviewedAt: string;
  /** Asking price over cash flow. Safe: the schema constrains cash flow > 0. */
  cashFlowMultiple: number;
}

export interface Franchise {
  slug: string;
  name: string;
  industry: string;
  franchiseFee: number;
  totalInvestment: MoneyRange;
  royalty: string;
  liquidCapitalRequired: number;
  unitCount: number;
  foundedYear: number;
  summary: string;
  support: string[];
  reviewedAt: string;
}

export interface FundingProgram {
  slug: string;
  name: string;
  fundingType: string;
  amount: MoneyRange;
  typicalRate: string;
  speed: string;
  /** Null means not underwritten on a credit score at all. */
  minCreditScore: number | null;
  timeInBusiness: string;
  bestFor: string;
  summary: string;
  requirements: string[];
  reviewedAt: string;
}

export interface ResearchPiece {
  slug: string;
  title: string;
  kind: ResearchKind;
  /** Display form of `kind` — "Data Study" for `data_study`. */
  kindLabel: string;
  excerpt: string;
  /** Null while takeaways publish ahead of the full write-up. */
  body: string | null;
  takeaways: string[];
  readingTimeMinutes: number;
  publishedAt: string;
}
