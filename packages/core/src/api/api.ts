import { Api, KnowChainId, Chain } from "@dot-agent-kit/common";


// Define the interface for the Polkadot API

export interface IPolkadotApi {

    setApi(api?: Api<KnowChainId>): void
    initializeApi(chain: Chain): Promise<void>;
    disconnect(): Promise<void>;

}

