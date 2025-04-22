




import { Api, Chain, ChainId, KnowChainId } from "@dot-agent-kit/common";
import { Tool } from "@langchain/core/tools";
import { PolkadotClient } from "polkadot-api";

/**
 * Interface for Polkadot API implementations
 * Defines the interface that all Polkadot chain types must follow
 */
export interface IPolkadotAgentApi {

    getNativeBalanceTool(address: string): Tool;

}



