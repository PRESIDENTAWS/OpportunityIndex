/**
 * Monetization row shapes, mirroring supabase/migrations/0001_monetization.sql.
 *
 * Same convention as the rest of the codebase: snake_case rows here, translated
 * once at the data-access boundary. Money is in MINOR units (cents) throughout,
 * matching the migration — never floats.
 */

export type AffiliateNetwork = "impact" | "refersion" | "direct" | "other";

export type ConversionStatus = "pending" | "approved" | "reversed" | "paid";

export type SponsorshipStatus =
  | "draft"
  | "scheduled"
  | "live"
  | "completed"
  | "cancelled";

export interface AffiliateProgramRow {
  id: string;
  slug: string;
  name: string;
  merchant: string;
  network: AffiliateNetwork;
  commission_rate: number | null;
  commission_flat: number | null;
  currency: string;
  cookie_window_days: number | null;
  disclosure_note: string | null;
  is_active: boolean;
}

export interface AffiliateLinkRow {
  id: string;
  program_id: string;
  slug: string;
  label: string;
  destination_url: string;
  opportunity_slug: string | null;
  category_slug: string | null;
  placement: string | null;
  is_active: boolean;
  expires_at: string | null;
}

/** A link joined to the program it belongs to — what the redirect needs. */
export interface ResolvedAffiliateLink extends AffiliateLinkRow {
  program: Pick<
    AffiliateProgramRow,
    "id" | "slug" | "name" | "network" | "is_active" | "cookie_window_days"
  >;
}

export interface AffiliateClickInsert {
  link_id: string;
  program_id: string;
  click_id: string;
  visitor_hash: string | null;
  country_code: string | null;
  device_type: string | null;
  referrer_host: string | null;
  opportunity_slug: string | null;
  category_slug: string | null;
  placement: string | null;
  destination_host: string;
}

/**
 * A conversion as an adapter hands it to the service — already normalized from
 * whatever shape the network sent.
 */
export interface NormalizedConversion {
  network: AffiliateNetwork;
  /** The network's own id. Unique per network; the dedupe key. */
  networkConversionId: string;
  programSlug: string;
  merchant: string;
  /** Our click UUID, when the network echoed it back. Often absent. */
  clickId: string | null;
  orderReference: string | null;
  /** Customer order value in minor units. */
  grossValueMinor: number;
  /** What we actually earn, in minor units. */
  commissionMinor: number;
  currency: string;
  status: ConversionStatus;
  occurredAt: string;
  /**
   * When the NETWORK last changed this conversion's status.
   *
   * Distinct from `occurredAt`, which is when the sale happened. This is what
   * orders out-of-order webhook deliveries: an update that cannot prove it is
   * newer than what we hold does not overwrite settled revenue.
   */
  statusUpdatedAt: string | null;
}

export type ConversionOutcome =
  | { result: "recorded"; id: string }
  | { result: "duplicate"; networkConversionId: string }
  | { result: "updated"; id: string }
  /** An older or backward update that was refused. Not an error. */
  | { result: "ignored"; reason: "stale" | "invalid-transition" }
  | { result: "rejected"; reason: string };
