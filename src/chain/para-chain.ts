import { TypedApi, createClient } from "polkadot-api"
import { getSmProvider } from "polkadot-api/sm-provider"
import { smoldotRelayChain } from "./relay-chain"
import { westend2_asset_hub } from "@polkadot-api/descriptors"
import { smoldot } from "./smoldot"
import { Chain } from "polkadot-api/smoldot"
import { relayChainMap } from "./chainMappings"

export const createParaChainApi = async (chainName: string): Promise<TypedApi<typeof westend2_asset_hub>> => {
  const relayChainName = relayChainMap[chainName];

  if (!relayChainName) {
    throw new Error(`Relay chain not found for parachain: ${chainName}`);
  }

  const smoldotParaChain: Promise<Chain> = Promise.all([
    smoldotRelayChain(relayChainName),
    import(`polkadot-api/chains/${chainName}`),
  ]).then(([relayChain, { chainSpec }]) =>
    smoldot.addChain({ chainSpec, potentialRelayChains: [relayChain] }),
  );

  const provider = getSmProvider(smoldotParaChain);
  return createClient(provider).getTypedApi(westend2_asset_hub);
};


