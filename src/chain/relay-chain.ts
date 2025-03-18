import { TypedApi, createClient } from "polkadot-api"
import { westend2 } from "@polkadot-api/descriptors"
import { getSmProvider } from "polkadot-api/sm-provider"
import { smoldot } from "./smoldot"
import { Chain } from "polkadot-api/smoldot"

export const createRelayChainApi = async (chainName: string): Promise<TypedApi<typeof westend2>> => {
  const smoldotRelayChain: Promise<Chain> = import(`polkadot-api/chains/${chainName}`).then(
    ({ chainSpec }) => smoldot.addChain({ chainSpec }),
  );

  const provider = getSmProvider(smoldotRelayChain);
  return createClient(provider).getTypedApi(westend2);
};

export const smoldotRelayChain = (chainName: string): Promise<Chain> => {
  return import(`polkadot-api/chains/${chainName}`).then(
    ({ chainSpec }) => smoldot.addChain({ chainSpec }),
  );
};
