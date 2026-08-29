import { NextResponse, type NextRequest } from "next/server";
import { ConversionParseError, getAdapter } from "@/lib/monetization/adapters";
import {
  isBodyTooLarge,
  MAX_WEBHOOK_BYTES,
  safeJsonParse,
} from "@/lib/monetization/conversion-policy";
import { recordConversion } from "@/lib/monetization/conversions";

/**
 * POST /api/conversions/[network] — authenticated conversion ingest.
 *
 * Every request must carry a valid adapter-specific signature. An unverified
 * payload is refused before anything is read from it, because an
 * unauthenticated write here would let anyone insert fabricated revenue.
 *
 * Both shipped adapters are hard-disabled pending verification against official
 * network documentation, so this route answers 501 for every network. It is
 * wired end to end so that finishing an adapter is the only remaining work.
 */

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ network: string }> },
) {
  const { network } = await params;

  const adapter = getAdapter(network);
  if (!adapter) {
    return NextResponse.json({ error: "Unknown network" }, { status: 404 });
  }

  // Checked before reading the body: an unimplemented adapter must not be
  // reachable by payload size or content.
  if (!adapter.isConfigured()) {
    return NextResponse.json({ error: "Integration not configured" }, { status: 501 });
  }

  // Exact bytes: re-serializing JSON would invalidate most HMAC schemes.
  const rawBody = await request.text();

  // Refuse an oversized body before signing or parsing it. Hashing megabytes of
  // attacker-supplied data is free work for them and real cost for us.
  if (isBodyTooLarge(rawBody)) {
    return NextResponse.json(
      { error: "Payload too large" },
      { status: 413, headers: { "X-Max-Bytes": String(MAX_WEBHOOK_BYTES) } },
    );
  }

  const verified = await adapter.verifySignature({ rawBody, headers: request.headers });
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Malformed JSON is a 400, never an unhandled 500.
  const parsed = safeJsonParse(rawBody);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  let conversions;
  try {
    conversions = adapter.parse(rawBody);
  } catch (error) {
    if (error instanceof ConversionParseError) {
      console.error(`[conversions] ${network}: ${error.message}`);
      return NextResponse.json({ error: "Unprocessable payload" }, { status: 422 });
    }
    // Any other adapter fault is ours, not the caller's.
    console.error(`[conversions] ${network}: unexpected adapter error`);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  const results = [];
  for (const conversion of conversions) {
    // The raw body is passed for hashing and redaction only; it is never
    // stored as received.
    results.push(await recordConversion(conversion, rawBody));
  }

  return NextResponse.json({ processed: results.length, results });
}
