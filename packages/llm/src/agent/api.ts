import { KnowChainId } from "@polkadot-agent-kit/common"
import { DynamicStructuredTool } from "@langchain/core/tools"
import { checkBalanceTool } from "../langchain/balance"
import { transferNativeTool } from "../langchain/transfer"
import { PolkadotApi } from "@polkadot-agent-kit/core"

/**
 * Interface for Polkadot API implementations
 * Defines the interface that all Polkadot chain types must follow
 */
export interface IPolkadotAgentApi {
  /**
   * Returns a tool that checks the balance of a specific address
   * @param address The address to check the balance for
   * @returns A dynamic structured tool that checks the balance of the specified address
   */
  getNativeBalanceTool(address: string): DynamicStructuredTool
  /**
   * Returns a tool that transfers native tokens to a specific address
   * @param chainId The chain ID of the target chain
   * @returns A dynamic structured tool that transfers native tokens to the specified address
   */
  transferNativeTool(chainId: KnowChainId): DynamicStructuredTool
}

/**
 * Implementation of the IPolkadotAgentApi interface
 * Provides access to Polkadot API methods
 */
export class PolkadotAgentApi implements IPolkadotAgentApi {
  /**
   * The Polkadot API instance
   */
  private api: PolkadotApi
  constructor(api: PolkadotApi) {
    this.api = api
  }

  getNativeBalanceTool(address: string): DynamicStructuredTool {
    return checkBalanceTool(this.api.getAllApis(), address)
  }

  transferNativeTool(chainId: KnowChainId): DynamicStructuredTool {
    return transferNativeTool(this.api.getApi(chainId))
  }
}
