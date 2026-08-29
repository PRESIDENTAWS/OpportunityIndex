import { NextResponse, type NextRequest } from "next/server";
import {
  findAffiliateLink,
  newClickId,
  recordClick,
  visitorHash,
} from "@/lib/monetization/affiliate";
import {
  buildRedirectUrl,
  checkDestination,
  clickCookieMaxAgeSeconds,
  CLICK_COOKIE_NAME,
  deviceType,
  isLinkRedeemable,
  isRecordableClick,
  referrerHost,
} from "@/lib/monetization/affiliate-url";

/**
 * GET /api/go/[linkSlug] — the affiliate redirect.
 *
 * The destination is looked up in our own database by slug. This route
 * **never** accepts a destination URL from the request, which is what keeps it
 * from being an open redirect.
 *
 * Order of operations matters: the click is recorded *before* the 302, so a
 * visitor who leaves immediately is still attributed.
 */

// Click recording is a write; there is nothing here to cache.
export const dynamic = "force-dynamic";

/** Reads the client IP from proxy headers. Used only as hash input, never stored. */
function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim() || null;
  return request.headers.get("x-real-ip");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkSlug: string }> },
) {
  const { linkSlug } = await params;

  const link = await findAffiliateLink(linkSlug);
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Disabled program, disabled link, or past its expiry.
  if (!isLinkRedeemable(link)) {
    return NextResponse.json({ error: "Link is not active" }, { status: 410 });
  }

  // Defence in depth: a stored row could still be malformed or non-HTTPS.
  const destination = checkDestination(link.destination_url);
  if (!destination.ok) {
    console.error(
      `[affiliate] rejected destination for "${linkSlug}": ${destination.reason}`,
    );
    return NextResponse.json({ error: "Link is not available" }, { status: 502 });
  }

  const clickId = newClickId();

  const target = buildRedirectUrl(destination.url, {
    programSlug: link.program.slug,
    categorySlug: link.category_slug,
    opportunitySlug: link.opportunity_slug,
  });

  const userAgent = request.headers.get("user-agent");

  // Crawlers and link previews still get redirected — the link should resolve
  // for them — but they are not written to the click log, because crawler hits
  // inflate click-through and depress apparent conversion rates.
  const recordable = isRecordableClick(userAgent);

  if (recordable) {
    // Recorded before redirecting. Failure is logged inside recordClick and
    // deliberately does not block the visitor.
    await recordClick({
      link_id: link.id,
      program_id: link.program_id,
      click_id: clickId,
      visitor_hash: visitorHash(clientIp(request), userAgent),
      country_code: request.headers.get("x-vercel-ip-country")?.slice(0, 2) ?? null,
      device_type: deviceType(userAgent),
      referrer_host: referrerHost(request.headers.get("referer")),
      opportunity_slug: link.opportunity_slug,
      category_slug: link.category_slug,
      placement: link.placement,
      destination_host: target.hostname,
    });
  }

  const response = NextResponse.redirect(target.toString(), 302);

  // First-party attribution cookie: the click UUID and nothing else.
  //
  // httpOnly, because no client-side code reads it. The authoritative
  // attribution record is the affiliate_clicks row; this cookie only lets a
  // later conversion be tied back to a click, and a value the browser can read
  // is a value the browser can forge.
  //
  // Only set for a recorded click: a cookie pointing at a click_id that was
  // never written would attribute a conversion to nothing.
  if (recordable) {
    response.cookies.set({
      name: CLICK_COOKIE_NAME,
      value: clickId,
      maxAge: clickCookieMaxAgeSeconds(link.program.cookie_window_days),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
