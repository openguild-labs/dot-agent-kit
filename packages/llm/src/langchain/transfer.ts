import { DynamicStructuredTool, tool } from "@langchain/core/tools"
import { z } from "zod"
import { transferNativeCall } from "@polkadot-agent-kit/core"
import {
  Api,
  getAllSupportedChains,
  getChainById,
  KnowChainId,
  parseUnits,
  getDecimalsByChainId
} from "@polkadot-agent-kit/common"
import { getApiForChain, validateAndFormatMultiAddress, executeTool } from "../utils"
import { TOOL_NAMES, ToolConfig, transferToolSchema } from "../types"

export type TransferTool = DynamicStructuredTool<typeof transferToolSchema>
interface TransferResult {
  amount: string
  address: string
  chain: string
}

const toolConfigTransferNative: ToolConfig = {
  name: TOOL_NAMES.TRANSFER_NATIVE,
  description: "Transfer native tokens to a specific address",
  schema: transferToolSchema
}

/**
 * Returns a tool that transfers native tokens to a specific address
 * @param api The API instance to use for the transfer
 * @returns A dynamic structured tool that transfers native tokens to the specified address
 */
export const transferNativeTool = (apis: Map<KnowChainId, Api<KnowChainId>>) => {
  return tool(async ({ amount, to, chain }: z.infer<typeof transferToolSchema>) => {
    return executeTool<TransferResult>(
      TOOL_NAMES.TRANSFER_NATIVE,
      async () => {
        const api = getApiForChain(apis, chain)
        const formattedAddress = validateAndFormatMultiAddress(to, chain as KnowChainId)
        const parsedAmount = parseUnits(amount, getDecimalsByChainId(chain))

        await transferNativeCall(api, formattedAddress, parsedAmount)
        return {
          amount,
          address: String(formattedAddress.value),
          chain
        }
      },
      result => `Transferred ${result.amount} to ${result.address}`
    )
  }, toolConfigTransferNative)
}
