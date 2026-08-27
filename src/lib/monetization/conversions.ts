import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import type { ConversionOutcome, NormalizedConversion } from "./types";

/**
 * The conversion service.
 *
 * A row lands here only because a network told us about it through a verified
 * webhook or an imported report. Nothing in this file infers a conversion from
 * a click: clicks are intent, conversions are money, and treating one as the
 * other is how affiliate revenue gets overstated.
 */

/**
 * Records one normalized conversion.
 *
 * Idempotent by `(network, network_conversion_id)`, which the migration
 * enforces with a unique constraint. A replayed webhook resolves to either
 * `duplicate` (nothing changed) or `updated` (the network moved the status,
 * e.g. pending -> approved -> paid), never to a second revenue row.
 */
export async function recordConversion(
  conversion: NormalizedConversion,
  rawPayload?: unknown,
): Promise<ConversionOutcome> {
  const supabase = getServerSupabase();
  if (!supabase) {
    return { result: "rejected", reason: "storage-unavailable" };
  }

  if (conversion.commissionMinor < 0 || conversion.grossValueMinor < 0) {
    return { result: "rejected", reason: "negative-amount" };
  }

  // The program must already exist and be known. We never create one on the
  // fly: a program is a human decision backed by a real signed agreement.
  const { data: program } = await supabase
    .from("affiliate_programs")
    .select("id")
    .eq("slug", conversion.programSlug)
    .maybeSingle();

  if (!program) {
    return { result: "rejected", reason: "unknown-program" };
  }

  // Only attach a click when it actually exists. A network reporting a click id
  // we never issued is not a reason to drop the conversion — the money is real
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

  const { data: existing } = await supabase
    .from("affiliate_conversions")
    .select("id, status")
    .eq("network", conversion.network)
    .eq("network_conversion_id", conversion.networkConversionId)
    .maybeSingle();

  if (existing) {
    if (existing.status === conversion.status) {
      return { result: "duplicate", networkConversionId: conversion.networkConversionId };
    }
    const { error } = await supabase
      .from("affiliate_conversions")
      .update({
        status: conversion.status,
        status_updated_at: new Date().toISOString(),
        commission_minor: conversion.commissionMinor,
        gross_value_minor: conversion.grossValueMinor,
        raw_payload: rawPayload ?? null,
      })
      .eq("id", existing.id);

    if (error) return { result: "rejected", reason: "update-failed" };
    return { result: "updated", id: existing.id };
  }

  const { data: inserted, error } = await supabase
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
      raw_payload: rawPayload ?? null,
    })
    .select("id")
    .single();

  if (error) {
    // 23505 is a unique violation: two identical webhooks raced. The other one
    // won, so this is a duplicate, not a failure.
    if (error.code === "23505") {
      return { result: "duplicate", networkConversionId: conversion.networkConversionId };
    }
    return { result: "rejected", reason: "insert-failed" };
  }

  return { result: "recorded", id: inserted.id };
}
