import type { NormalizedConversion } from "../types";

/**
 * The contract every affiliate-network adapter implements.
 *
 * An adapter's only job is to prove a payload really came from its network and
 * then translate it into `NormalizedConversion`. It records nothing itself —
 * the conversion service owns persistence, deduplication, and status handling.
 */
export interface ConversionAdapter {
  /** Matches the `network` path segment, e.g. /api/conversions/impact. */
  readonly network: string;

  /** False when the adapter's credentials are absent; the route then 501s. */
  isConfigured(): boolean;

  /**
   * Verifies the request actually came from the network.
   *
   * Must be constant-time against the signature and must return false rather
   * than throwing. An adapter that cannot verify a payload must never report
   * success — an unverified conversion is an invitation to write fake revenue
   * into the database.
   */
  verifySignature(input: SignatureInput): Promise<boolean>;

  /**
   * Translates a verified payload into zero or more normalized conversions.
   * Throws on a payload that verified but cannot be parsed, so the route can
   * answer 400 and the network can retry.
   */
  parse(rawBody: string): NormalizedConversion[];
}

export interface SignatureInput {
  /** Exact bytes as received. Re-serializing breaks most HMAC schemes. */
  rawBody: string;
  headers: Headers;
}

/** Thrown by `parse` when a verified payload still cannot be understood. */
export class ConversionParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConversionParseError";
  }
}
