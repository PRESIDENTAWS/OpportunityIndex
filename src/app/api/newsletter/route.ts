import { NextResponse, type NextRequest } from "next/server";
import { subscribe } from "@/lib/email/subscribe";
import { RateLimiter } from "@/lib/rate-limit";

/**
 * POST /api/newsletter — newsletter signup.
 *
 * Validation, consent, and the `source` allowlist are all enforced server-side;
 * the client-side attributes are convenience, not controls.
 *
 * Responses are deliberately generic. Provider errors can echo the submitted
 * address and internal detail, so nothing from Kit or Supabase reaches the
 * caller — failures are logged server-side and reduced to a coarse message.
 */

export const dynamic = "force-dynamic";

/** Five signups per IP per ten minutes. Per-instance; see RateLimiter. */
const limiter = new RateLimiter(5, 10 * 60 * 1000);

/** Largest body worth parsing: this endpoint takes three short fields. */
const MAX_BODY_BYTES = 2_048;

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  const limit = limiter.check(clientKey(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))),
        },
      },
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Invalid request." }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, consent, source } =
    (payload ?? {}) as { email?: unknown; consent?: unknown; source?: unknown };

  if (typeof email !== "string") {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const result = await subscribe({ email, consent: consent === true, source });

  if (!result.ok) {
    if (result.reason === "storage-failed") {
      // Never report success we cannot back with a stored record.
      return NextResponse.json(
        { error: "We could not save your subscription. Please try again shortly." },
        { status: 503 },
      );
    }
    const message =
      result.reason === "consent-required"
        ? "Please confirm you want to receive the newsletter."
        : "Enter a valid email address.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Success is reported the same way whether or not a downstream provider is
  // configured: the visitor does not need to know our integration state.
  return NextResponse.json({ ok: true });
}
