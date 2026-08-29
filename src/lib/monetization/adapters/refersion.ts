import { createHmac, timingSafeEqual } from "node:crypto";
import { ConversionParseError, type ConversionAdapter, type SignatureInput } from "./types";
import type { NormalizedConversion } from "../types";

/**
 * Refersion adapter — INTERFACE ONLY, NOT A WORKING INTEGRATION.
 *
 * ## Status
 *
 * Same posture as the Impact adapter: the shape is defined so the conversion
 * service has something concrete to accept, but nothing here is verified
 * against Refersion's documentation and no credentials exist.
 *
 * Before enabling, confirm against the official docs:
 *
 *   - the webhook signature header name and digest encoding
 *   - whether Refersion signs the raw body or a canonicalised subset
 *   - the conversion payload field names, and which identifier is stable
 *     enough to serve as `network_conversion_id`
 *   - how refunds and reversals are represented, so `reversed` is recorded
 *     rather than a second `approved` row
 *
 * `IMPLEMENTATION_VERIFIED` below is the single gate. While it is false this
 * adapter reports itself unconfigured **regardless of any secret set in the
 * environment**, and the route answers 501. Setting
 * `REFERSION_WEBHOOK_SECRET` does not and must not enable it.
 */

/**
 * Flips to true only when the payload specification and signature scheme below
 * have been verified against Refersion's official documentation with real
 * credentials in hand, and `parse()` has been implemented.
 *
 * While false the adapter reports itself unconfigured no matter what secrets
 * are present, and the ingest route answers 501.
 */
const IMPLEMENTATION_VERIFIED = false;

const SIGNATURE_HEADER = "x-refersion-signature";

export const refersionAdapter: ConversionAdapter = {
  network: "refersion",

  isConfigured() {
    // Hard-disabled. A secret alone must NOT activate this adapter: parse()
    // always throws, so a "configured" adapter would accept a signed request
    // and then fail at 422 having already been treated as live. Flipping this
    // to a credential check is the LAST step of implementing the adapter, not
    // the first — see IMPLEMENTATION_VERIFIED above.
    if (!IMPLEMENTATION_VERIFIED) return false;
    return Boolean(process.env.REFERSION_WEBHOOK_SECRET);
  },

  async verifySignature({ rawBody, headers }: SignatureInput) {
    const secret = process.env.REFERSION_WEBHOOK_SECRET;
    const provided = headers.get(SIGNATURE_HEADER);
    if (!secret || !provided) return false;

    const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(provided, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  },

  parse(): NormalizedConversion[] {
    throw new ConversionParseError(
      "Refersion adapter is not implemented: awaiting real credentials and the " +
        "official webhook payload specification.",
    );
  },
};
