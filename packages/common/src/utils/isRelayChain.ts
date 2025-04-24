import type { Chain, ChainAssetHub, ChainRelay } from "../chains"

/**
 * Determines if a chain is a relay chain based
 * @param Chain
 * @returns boolean
 */
export const isRelayChain = (chain: Chain): chain is ChainRelay => {
  if (chain.type === "relay") return true
  return false
}
