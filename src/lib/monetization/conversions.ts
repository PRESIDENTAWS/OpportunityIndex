import "server-only";

import { createHash } from "node:crypto";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  isStaleUpdate,
  isValidTransition,
  redactPayload,
} from "./conversion-policy";
import type { ConversionOutcome, ConversionStatus, NormalizedConversion } from "./types";

/**
 * The conversion service.
 *
 * A row here exists only because a network told us about it through a verified
 * webhook or an imported report. Nothing in this file infers a conversion from
 * a click: clicks are intent, conversions are money.
 *
 * ## Protecting recorded revenue
 *
 * Networks replay webhooks and deliver them out of order. Three rules keep a
 * late or stale delivery from corrupting a settled record:
 *
 *  1. **Idempotency** — `(network, network_conversion_id)` is unique, so the
 *     same conversion lands exactly once.
 *  2. **Lifecycle** — only forward transitions are permitted. Nothing returns
 *     to `pending`, so an old `pending` replay cannot un-earn a `paid` row.
 *  3. **Recency** — an update must carry a `statusUpdatedAt` strictly newer
 *     than the stored one.
 *
 * Rules 2 and 3 are applied both in code and as predicates on the UPDATE
 * statement, so two webhooks racing cannot interleave into a bad state.
 */

/** Digest of the payload as received. Proves what arrived without keeping it. */
function payloadDigest(rawBody: string): string {
  return createHash("sha256").update(rawBody).digest("hex");
}

export async function recordConversion(
  conversion: NormalizedConversion,
  rawBody?: string,
): Promise<ConversionOutcome> {
  const supabase = getServerSupabase();
  if (!supabase) return { result: "rejected", reason: "storage-unavailable" };

  if (conversion.commissionMinor < 0 || conversion.grossValueMinor < 0) {
    return { result: "rejected", reason: "negative-amount" };
  }
  if (!Number.isFinite(conversion.commissionMinor) || !Number.isFinite(conversion.grossValueMinor)) {
    return { result: "rejected", reason: "non-numeric-amount" };
  }

  // The program must already exist. We never create one on the fly: a program
  // is a human decision backed by a real signed agreement.
  const { data: program } = await supabase
    .from("affiliate_programs")
    .select("id")
    .eq("slug", conversion.programSlug)
    .maybeSingle();

  if (!program) return { result: "rejected", reason: "unknown-program" };

  // Only attach a click that actually exists. A network reporting a click id we
  // never issued is not a reason to drop the conversion — the money is real
  // either way — so the row is written with a null click instead.
  let clickId: string | null = null;
  if (conversion.clickId) {
    const { data: click } = await supabase
      .from("affiliate_clicks")
      .select("click_id")
      .eq("click_id", conversion.clickId)
      .maybeSingle();
    clickId = click?.click_id ?? null;
  }

  const statusUpdatedAt = conversion.statusUpdatedAt ?? new Date().toISOString();
  const redacted = rawBody ? redactPayload(safeParse(rawBody)) : null;
  const digest = rawBody ? payloadDigest(rawBody) : null;

  // Insert first. The unique constraint decides the race: exactly one concurrent
  // writer wins, and the loser falls through to the guarded update below.
  const { data: inserted, error: insertError } = await supabase
    .from("affiliate_conversions")
    .insert({
      program_id: program.id,
      click_id: clickId,
      network: conversion.network,
      network_conversion_id: conversion.networkConversionId,
      merchant: conversion.merchant,
      order_reference: conversion.orderReference,
      gross_value_minor: conversion.grossValueMinor,
      commission_minor: conversion.commissionMinor,
      currency: conversion.currency,
      status: conversion.status,
      occurred_at: conversion.occurredAt,
      status_updated_at: statusUpdatedAt,
      payload_redacted: redacted,
      payload_sha256: digest,
    })
    .select("id")
    .single();

  if (!insertError && inserted) return { result: "recorded", id: inserted.id };

  // 23505 is a unique violation: the conversion already exists.
  if (insertError && insertError.code !== "23505") {
    return { result: "rejected", reason: "insert-failed" };
  }

  const { data: existing } = await supabase
    .from("affiliate_conversions")
    .select("id, status, status_updated_at")
    .eq("network", conversion.network)
    .eq("network_conversion_id", conversion.networkConversionId)
    .maybeSingle();

  if (!existing) return { result: "rejected", reason: "insert-failed" };

  const currentStatus = existing.status as ConversionStatus;

  if (currentStatus === conversion.status) {
    return { result: "duplicate", networkConversionId: conversion.networkConversionId };
  }
  if (!isValidTransition(currentStatus, conversion.status)) {
    console.warn(
      `[conversions] refused ${currentStatus} -> ${conversion.status} for ${conversion.network}:${conversion.networkConversionId}`,
    );
    return { result: "ignored", reason: "invalid-transition" };
  }
  if (isStaleUpdate(existing.status_updated_at, conversion.statusUpdatedAt)) {
    return { result: "ignored", reason: "stale" };
  }

  // Both guards are repeated as predicates on the statement itself, so a
  // concurrent writer that changed the row between the read above and this
  // write cannot be clobbered: the update simply matches no rows.
  const { data: updated, error: updateError } = await supabase
    .from("affiliate_conversions")
    .update({
      status: conversion.status,
      status_updated_at: statusUpdatedAt,
      commission_minor: conversion.commissionMinor,
      gross_value_minor: conversion.grossValueMinor,
      payload_redacted: redacted,
      payload_sha256: digest,
    })
    .eq("id", existing.id)
    .eq("status", currentStatus)
    .lt("status_updated_at", statusUpdatedAt)
    .select("id");

  if (updateError) return { result: "rejected", reason: "update-failed" };
  if (!updated || updated.length === 0) {
    // Another writer got there first with a newer state.
    return { result: "ignored", reason: "stale" };
  }

  return { result: "updated", id: existing.id };
}

function safeParse(body: string): unknown {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}
