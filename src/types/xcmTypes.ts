export enum ChainType {
  RELAY_CHAIN = 'RELAY_CHAIN',
  SYSTEM_PARACHAIN = 'SYSTEM_PARACHAIN',
  PARACHAIN = 'PARACHAIN'
}

export interface ChainConfig {
  name: string;
  type: ChainType;
  parachainId?: number;
  endpoint: string;
  xcmPallet: string; // 'xcmPallet' or 'polkadotXcm'
}

export interface XcmTransferParams {
  sourceChain: string;
  destChain: string;
  recipient: string;
  amount: bigint;
  assetId?: string;
}