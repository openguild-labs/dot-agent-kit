import { TypedApi, createClient } from "polkadot-api"
import { getSmProvider } from "polkadot-api/sm-provider"
import { smoldotRelayChain } from "./relaychain"
import { west_asset_hub } from "@polkadot-api/descriptors"
import { smoldot } from "./smoldot"

const smoldotParaChain = Promise.all([
  smoldotRelayChain,
  import("polkadot-api/chains/westend2_asset_hub")
]).then(([relayChain, { chainSpec }]) =>
  smoldot.addChain({ chainSpec, potentialRelayChains: [relayChain] })
)

const provider = getSmProvider(smoldotParaChain)
export const paraChain = createClient(provider)

export const PARACHAIN_ID = 1000
export const paraChainApi: TypedApi<typeof west_asset_hub> = paraChain.getTypedApi(west_asset_hub)
