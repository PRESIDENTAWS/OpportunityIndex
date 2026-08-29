import type { CategoryRow } from "@/lib/contract";

/**
 * Category rows, transcribed from `supabase/seed.sql`. When Supabase is
 * connected these are read from the `categories` table instead — the shape is
 * already correct, so only the source changes.
 *
 * Scoring factors are NOT duplicated here: they live in
 * src/lib/scoring-model.ts, which is the single definition the scorer, the
 * breakdown, the matcher, and /methodology all read.
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
