export type SortKey = "score" | "startup-cost" | "profit" | "hours" | "name";

/**
 * Client-safe sort vocabulary.
 *
 * Keep this module free of database, fixture, or server-only imports so client
 * controls can use the same labels without pulling the repository data layer
 * into the browser bundle.
 */
export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "score", label: "Overall Score" },
  { key: "startup-cost", label: "Lowest Startup Cost" },
  { key: "profit", label: "Highest Profit Potential" },
  { key: "hours", label: "Fewest Hours / Week" },
  { key: "name", label: "A – Z" },
];
