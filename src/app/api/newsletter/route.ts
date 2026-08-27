import { NextResponse, type NextRequest } from "next/server";
import { subscribe } from "@/lib/email/subscribe";

/**
 * POST /api/newsletter — newsletter signup.
 *
 * Validation and consent are enforced server-side; the client-side `required`
 * attribute is a convenience, not a control.
 *
 * Responses are deliberately generic. Provider errors can echo the submitted
 * address and internal detail, so nothing from Kit or Supabase reaches the
 * caller — failures are logged server-side and reduced to a coarse message.
 */

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
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

  const result = await subscribe({
    email,
    consent: consent === true,
    source: typeof source === "string" && source.length <= 64 ? source : "web",
  });

  if (!result.ok) {
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
