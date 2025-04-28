export enum CHAINS {
  RELAY_CHAIN = "RELAY_CHAIN",
  SYSTEM_PARACHAIN = "SYSTEM_PARACHAIN",
  PARACHAIN = "PARACHAIN"
}

export interface ChainConfigXCM {
  name: string
  type: CHAINS
  parachainId?: number
  endpoint: string
  xcmPallet: "xcmPallet" | "polkadotXcm"
}

export interface XcmTransferParams {
  sourceChain: string
  destChain: string
  recipient: string
  amount: bigint
  assetId?: string
}
