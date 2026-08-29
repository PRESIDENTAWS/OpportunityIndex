import type { Flexibility } from "./contract";

export interface Band {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface CostBand extends Band {}

export const COST_BANDS: CostBand[] = [
  { id: "0-500", label: "$0 – $500", min: 0, max: 500 },
  { id: "500-5000", label: "$500 – $5,000", min: 500, max: 5000 },
  { id: "5000-25000", label: "$5,000 – $25,000", min: 5000, max: 25000 },
  { id: "25000-plus", label: "$25,000+", min: 25000, max: Infinity },
];

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

export const FLEXIBILITY_VALUES: Flexibility[] = ["anywhere", "remote", "local"];

const FLEXIBILITY_LABELS: Record<Flexibility, string> = {
  anywhere: "Anywhere",
  remote: "Remote",
  local: "Local",
};

export function flexibilityLabel(value: Flexibility): string {
  return FLEXIBILITY_LABELS[value];
}
