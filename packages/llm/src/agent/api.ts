import { Api, KnowChainId } from "@dot-agent-kit/common"
import { DynamicStructuredTool } from "@langchain/core/tools"
import { MultiAddress } from "@polkadot-api/descriptors"
import { checkBalanceTool } from "../langchain/balance"
import { transferNativeTool } from "../langchain/transfer"
import { PolkadotApi } from "@dot-agent-kit/core"

/**
 * Interface for Polkadot API implementations
 * Defines the interface that all Polkadot chain types must follow
 */
export interface IPolkadotAgentApi {
  getNativeBalanceTool(chainId: KnowChainId): DynamicStructuredTool
  transferNativeTool(chainId: KnowChainId): DynamicStructuredTool
}

export class PolkadotAgentApi implements IPolkadotAgentApi {
  private api: PolkadotApi
  constructor(api: PolkadotApi) {
    this.api = api
  }

  getNativeBalanceTool(chainId: KnowChainId): DynamicStructuredTool {
    return checkBalanceTool(this.api.getApi(chainId))
  }

  transferNativeTool(chainId: KnowChainId): DynamicStructuredTool {
    return transferNativeTool(this.api.getApi(chainId)) 
  }
}
