import { createHmac, timingSafeEqual } from "node:crypto";
import { ConversionParseError, type ConversionAdapter, type SignatureInput } from "./types";
import type { NormalizedConversion } from "../types";

/**
 * Impact.com adapter — INTERFACE ONLY, NOT A WORKING INTEGRATION.
 *
 * ## Status
 *
 * This adapter is deliberately unfinished. Completing it requires two things
 * this repository does not have:
 *
 *   1. Real Impact credentials (account SID, auth token, signing secret).
 *   2. The official payload specification for the Actions/postback callback
 *      configured on the account, which varies by contract.
 *
 * The signature scheme below is a **placeholder HMAC-SHA256 over the raw body**.
 * It is a reasonable default, but it has NOT been verified against Impact's
 * documentation. Before enabling this adapter in production, confirm:
 *
 *   - the exact header carrying the signature
 *   - the digest algorithm and encoding (hex vs base64)
 *   - whether the signed payload includes a timestamp or nonce
 *   - the field names on the Action payload
 *
 * Until then `isConfigured()` returns false, the route answers 501, and no
 * conversion is ever recorded from this network. That is the intended state:
 * fabricating an integration would produce revenue numbers nobody can trust.
 */

const SIGNATURE_HEADER = "x-impact-signature";

export const impactAdapter: ConversionAdapter = {
  network: "impact",

  isConfigured() {
    return Boolean(process.env.IMPACT_WEBHOOK_SECRET);
  },

  async verifySignature({ rawBody, headers }: SignatureInput) {
    const secret = process.env.IMPACT_WEBHOOK_SECRET;
    const provided = headers.get(SIGNATURE_HEADER);
    if (!secret || !provided) return false;

    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(provided, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  },

  parse(): NormalizedConversion[] {
    throw new ConversionParseError(
      "Impact adapter is not implemented: awaiting real credentials and the " +
        "official Action payload specification.",
    );
  },
};
