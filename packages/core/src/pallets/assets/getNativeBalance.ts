import { Api, KnowChainId } from "@polkadot-agent-kit/common"

interface BalanceInfo {
  balance: bigint;
  decimals: number;
  symbol: string;
}

const CHAIN_PROPERTIES: Record<KnowChainId, { decimals: number; symbol: string }> = {
  polkadot: { decimals: 10, symbol: 'DOT' },
  west: { decimals: 12, symbol: 'WND' },
  polkadot_asset_hub: { decimals: 10, symbol: 'DOT' },
  west_asset_hub: { decimals: 12, symbol: 'WND' }
}

/**
 * Retrieves the native balance and token information of an account
 * @param api The API instance to use for the query
 * @param address The address to query the balance for
 * @returns The native balance info including balance, decimals and symbol
 */
export const getNativeBalance = async (api: Api<KnowChainId>, address: string): Promise<BalanceInfo> => {
  const balance = await api.query.System.Account.getValue(address)
  const chainId = api.chainId
  const properties = CHAIN_PROPERTIES[chainId]
  
  return {
    balance: balance.data.free,
    decimals: properties.decimals,
    symbol: properties.symbol
  }
}
