import { KnowChainId } from "../chains"

export interface BalanceInfo {
  balance: bigint;
  decimals: number;
  symbol: string;
}

export const CHAIN_PROPERTIES: Record<KnowChainId, { decimals: number; symbol: string }> = {
  polkadot: { decimals: 10, symbol: 'DOT' },
  west: { decimals: 12, symbol: 'WND' },
  polkadot_asset_hub: { decimals: 10, symbol: 'DOT' },
  west_asset_hub: { decimals: 12, symbol: 'WND' }
} 