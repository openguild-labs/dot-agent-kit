export interface XcmTransferParams {
  sourceChain: string;
  destChain: string;
  recipient: string;
  amount: bigint;
  assetId?: string;
}

export interface ChainConfig {
  name: string;
  endpoint: string;
  paraId?: number;
  nativeToken: string;
}
