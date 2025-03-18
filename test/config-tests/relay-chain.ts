import { TypedApi, createClient } from "polkadot-api"
import { west } from "@polkadot-api/descriptors"
import { getSmProvider } from "polkadot-api/sm-provider"
import { smoldot } from "./smoldot"
import { Chain } from "polkadot-api/smoldot"

export const smoldotRelayChain: Promise<Chain> = import("polkadot-api/chains/westend2").then(
  ({ chainSpec }) => smoldot.addChain({ chainSpec }),
)

const provider = getSmProvider(smoldotRelayChain)
export const relayChain = createClient(provider)

export const relayChainApi: TypedApi<typeof west> = relayChain.getTypedApi(west)
export type RelayChainApi = TypedApi<typeof west>