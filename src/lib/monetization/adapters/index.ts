import { impactAdapter } from "./impact";
import { refersionAdapter } from "./refersion";
import type { ConversionAdapter } from "./types";

/**
 * Registry of conversion adapters.
 *
 * Both entries are interface-only stubs today, hard-disabled by an
 * `IMPLEMENTATION_VERIFIED` flag inside each file. Neither reports itself
 * configured even when its webhook secret is present, so neither can record a
 * conversion until it is implemented against the network's official payload
 * specification — see the file-level notes in each adapter.
 */
const ADAPTERS: ConversionAdapter[] = [impactAdapter, refersionAdapter];

export function getAdapter(network: string): ConversionAdapter | undefined {
  return ADAPTERS.find((a) => a.network === network);
}

export function listAdapters(): { network: string; configured: boolean }[] {
  return ADAPTERS.map((a) => ({ network: a.network, configured: a.isConfigured() }));
}

export type { ConversionAdapter } from "./types";
export { ConversionParseError } from "./types";
