import { Api, KnowChainId } from "@dot-agent-kit/common"
import { DynamicStructuredTool } from "@langchain/core/tools"
import { MultiAddress } from "@polkadot-api/descriptors"
import { checkBalanceTool } from "../langchain/balance"
import { transferNativeTool } from "../langchain/transfer"

/**
 * Interface for Polkadot API implementations
 * Defines the interface that all Polkadot chain types must follow
 */
export interface IPolkadotAgentApi {
  getNativeBalanceTool(address: string): DynamicStructuredTool
  transferNativeTool(to: MultiAddress, amount: bigint): DynamicStructuredTool
}

export class PolkadotAgentApi implements IPolkadotAgentApi {
  private api: Api<KnowChainId>
  constructor(api: Api<KnowChainId>) {
    this.api = api
  }

  getNativeBalanceTool(address: string): DynamicStructuredTool {
    return checkBalanceTool(this.api)
  }

  transferNativeTool(to: MultiAddress, amount: bigint): DynamicStructuredTool {
    return transferNativeTool(this.api)
  }
}
