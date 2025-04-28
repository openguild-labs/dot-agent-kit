import { Chain, ChainAssetHub } from "../chains"

/**
 * Determines if a chain is a system chain based on the value chainId
 * @param chainId
 * @returns boolean
 */
export const isSystemChain = (chain: Chain): chain is ChainAssetHub => {
  if (chain.type === "system" && chain.chainId) {
    const chainIdAsNumber = Number(chain.chainId)
    return chainIdAsNumber > 0 && chainIdAsNumber < 2000
  }

  return false
}
