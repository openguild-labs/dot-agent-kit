import { westend2, westend2_asset_hub } from "@polkadot-api/descriptors";
import { TypedApi } from "polkadot-api";
import { createParaChainApi } from "./para-chain";
import { createRelayChainApi } from "./relay-chain";

type Chains = {
    [key: string]: Promise<TypedApi<typeof westend2 | typeof westend2_asset_hub>>;
};

export const chains: Chains = {
    westend2_asset_hub: createParaChainApi("westend2_asset_hub"),
    westend2: createRelayChainApi("westend2"),
};

export const getChainApi = async (chainName: string): Promise<TypedApi<typeof westend2 | typeof westend2_asset_hub>> => {
    return chains[chainName];
};

export type RelayChainApi = TypedApi<typeof westend2>;
