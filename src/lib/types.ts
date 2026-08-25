export type CategorySlug =
  | "online"
  | "service"
  | "e-commerce"
  | "local-business"
  | "creative";

export interface Category {
  slug: CategorySlug;
  label: string;
}

export const CATEGORIES: Category[] = [
  { slug: "online", label: "Online" },
  { slug: "service", label: "Service" },
  { slug: "e-commerce", label: "E-Commerce" },
  { slug: "local-business", label: "Local Business" },
  { slug: "creative", label: "Creative" },
];

export type Flexibility = "Anywhere" | "Remote" | "Local";

/** A money range. `openEnded` renders the upper bound as "$X+". */
export interface Range {
  min: number;
  max: number;
  openEnded?: boolean;
}

/**
 * The six factors behind every Overall Score. Each is 0-100, where higher is
 * always better for the operator (so `startupCost: 90` means *cheap* to start,
 * and `competition: 90` means the field is *not* crowded).
 */
export interface ScoreFactors {
  demand: number;
  startupCost: number;
  profitPotential: number;
  timeToRevenue: number;
  competition: number;
  scalability: number;
}

export interface FactorMeta {
  key: keyof ScoreFactors;
  label: string;
  weight: number;
  /** What a high score on this factor means. */
  meaning: string;
}

/** Weights sum to 1. Kept here so the methodology page and the scorer agree. */
export const SCORE_FACTORS: FactorMeta[] = [
  {
    key: "demand",
    label: "Market Demand",
    weight: 0.25,
    meaning: "Buyers are actively searching and spending in this market today.",
  },
  {
    key: "profitPotential",
    label: "Profit Potential",
    weight: 0.22,
    meaning: "Realistic monthly take-home once the operation is established.",
  },
  {
    key: "startupCost",
    label: "Low Startup Cost",
    weight: 0.18,
    meaning: "Little capital is needed to get to a first paying customer.",
  },
  {
    key: "timeToRevenue",
    label: "Speed to Revenue",
    weight: 0.15,
    meaning: "The gap between starting and being paid is short.",
  },
  {
    key: "scalability",
    label: "Scalability",
    weight: 0.12,
    meaning: "Revenue can grow without hours growing at the same rate.",
  },
  {
    key: "competition",
    label: "Competitive Room",
    weight: 0.08,
    meaning: "The field is not yet saturated; a newcomer can still win work.",
  },
];

export interface Opportunity {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  category: CategorySlug;
  startupCost: Range;
  monthlyProfit: Range;
  hoursPerWeek: Range;
  flexibility: Flexibility;
  factors: ScoreFactors;
  /** Long-form body for the detail page. */
  summary: string;
  skills: string[];
  pros: string[];
  cons: string[];
  steps: { title: string; detail: string }[];
  tools: string[];
  updated: string;
}

export interface BusinessListing {
  slug: string;
  name: string;
  industry: string;
  location: string;
  askingPrice: number;
  revenue: number;
  cashFlow: number;
  established: number;
  employees: number;
  ownerFinancing: boolean;
  reasonForSale: string;
  highlights: string[];
  updated: string;
}

export interface Franchise {
  slug: string;
  name: string;
  industry: string;
  franchiseFee: number;
  totalInvestment: Range;
  royalty: string;
  units: number;
  yearFounded: number;
  liquidCapital: number;
  summary: string;
  support: string[];
  updated: string;
}

export interface FundingProgram {
  slug: string;
  name: string;
  type: string;
  amount: Range;
  typicalRate: string;
  speed: string;
  minCreditScore: number | null;
  timeInBusiness: string;
  bestFor: string;
  requirements: string[];
  summary: string;
}

export interface ResearchPiece {
  slug: string;
  title: string;
  kind: "Report" | "Guide" | "Data Study";
  readingTime: number;
  published: string;
  excerpt: string;
  takeaways: string[];
}
