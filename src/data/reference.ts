import type { CategoryRow, ScoringFactorRow } from "@/lib/contract";

/**
 * Reference rows, transcribed from `supabase/seed.sql`. When Phase 2 connects
 * the database these are read from the `categories` and `scoring_factors`
 * tables instead — the shapes are already correct, so only the source changes.
 */

export const CATEGORY_ROWS: CategoryRow[] = [
  {
    slug: "online",
    label: "Online",
    description:
      "Digital products, audiences, and affiliate models. Cheap to start, slow to distribute, and the most scalable end of the index.",
    sort_order: 1,
  },
  {
    slug: "service",
    label: "Service",
    description:
      "You sell expertise and time. The fastest route to a first paying customer, and the one most bounded by hours in a week.",
    sort_order: 2,
  },
  {
    slug: "ecommerce",
    label: "E-Commerce",
    description:
      "Physical products through your own store or a marketplace. The best margins in the index, funded by the most working capital.",
    sort_order: 3,
  },
  {
    slug: "local",
    label: "Local Business",
    description:
      "Route, trade, and premises work in one geography. Unfashionable, recurring, and consistently the fastest to real monthly revenue.",
    sort_order: 4,
  },
  {
    slug: "creative",
    label: "Creative",
    description:
      "Craft, media, and content. High ceilings and long runways — these reward patience more than capital.",
    sort_order: 5,
  },
];

/**
 * The published scoring model. Weights sum to exactly 1.000, matching both the
 * `scoring_factors` table and the generated `opportunities.overall_score`
 * expression in `supabase/schema.sql`.
 */
export const SCORING_FACTOR_ROWS: ScoringFactorRow[] = [
  {
    key: "demand",
    label: "Market Demand",
    description: "Buyers are actively searching and spending in this market today.",
    weight: 0.25,
    sort_order: 1,
  },
  {
    key: "profit_potential",
    label: "Profit Potential",
    description: "Realistic monthly take-home once the operation is established.",
    weight: 0.22,
    sort_order: 2,
  },
  {
    key: "startup_cost",
    label: "Low Startup Cost",
    description: "Little capital is needed to get to a first paying customer.",
    weight: 0.18,
    sort_order: 3,
  },
  {
    key: "time_to_revenue",
    label: "Speed to Revenue",
    description: "The gap between starting and being paid is short.",
    weight: 0.15,
    sort_order: 4,
  },
  {
    key: "scalability",
    label: "Scalability",
    description: "Revenue can grow without hours growing at the same rate.",
    weight: 0.12,
    sort_order: 5,
  },
  {
    key: "competition",
    label: "Competitive Room",
    description: "The field is not yet saturated; a newcomer can still win work.",
    weight: 0.08,
    sort_order: 6,
  },
];
