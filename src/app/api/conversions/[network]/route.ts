import { NextResponse, type NextRequest } from "next/server";
import { ConversionParseError, getAdapter } from "@/lib/monetization/adapters";
import { recordConversion } from "@/lib/monetization/conversions";

/**
 * POST /api/conversions/[network] — authenticated conversion ingest.
 *
 * Every request must carry a valid adapter-specific signature. An unverified
 * payload is refused before anything is read from it, because an unauthenticated
 * write here would let anyone insert fabricated revenue.
 *
 * Both shipped adapters are interface-only, so this route answers 501 until
 * real credentials and an official payload specification are supplied. It is
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

  if (!adapter.isConfigured()) {
    return NextResponse.json(
      { error: "Integration not configured" },
      { status: 501 },
    );
  }

  // Exact bytes: re-serializing JSON would invalidate most HMAC schemes.
  const rawBody = await request.text();

  const verified = await adapter.verifySignature({ rawBody, headers: request.headers });
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let conversions;
  try {
    conversions = adapter.parse(rawBody);
  } catch (error) {
    if (error instanceof ConversionParseError) {
      console.error(`[conversions] ${network}: ${error.message}`);
      return NextResponse.json({ error: "Unprocessable payload" }, { status: 422 });
    }
    throw error;
  }

  const results = [];
  for (const conversion of conversions) {
    results.push(await recordConversion(conversion, JSON.parse(rawBody)));
  }

  return NextResponse.json({ processed: results.length, results });
}
