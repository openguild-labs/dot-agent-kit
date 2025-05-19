import { DynamicStructuredTool, tool } from "@langchain/core/tools"
import { z } from "zod"
import { getNativeBalance } from "@polkadot-agent-kit/core"
import { Api, KnowChainId, formatBalance } from "@polkadot-agent-kit/common"
import {
  getApiForChain,
  validateAndFormatAddress,
  executeTool
} from "../utils"
import { balanceToolSchema, TOOL_NAMES, ToolConfig } from "../types"


// Define tool types
export type BalanceTool = DynamicStructuredTool<typeof balanceToolSchema>


interface BalanceToolResult {
  balance: string
  symbol: string
  chain: string
}



const toolConfig: ToolConfig = {
  name: TOOL_NAMES.CHECK_BALANCE,
  description: "Check balance of the wallet address on a specific chain",
  schema: balanceToolSchema
}

/**
 * Returns a tool that checks the balance of a specific address
 * @param apis Map of chain IDs to API instances
 * @param address The address to check the balance for
 * @returns A dynamic structured tool that checks the balance of the specified address
 */
export const checkBalanceTool = (apis: Map<KnowChainId, Api<KnowChainId>>, address: string) => {
  return tool(
    async ({ chain }: z.infer<typeof balanceToolSchema>) => {
      return executeTool<BalanceToolResult>(
        TOOL_NAMES.CHECK_BALANCE,
        async () => {
          const api = getApiForChain(apis, chain)
          const formattedAddress = validateAndFormatAddress(address, chain as KnowChainId)
          const balanceInfo = await getNativeBalance(api, formattedAddress)
          const formattedBalance = formatBalance(balanceInfo.balance, balanceInfo.decimals)

          return {
            balance: formattedBalance,
            symbol: balanceInfo.symbol,
            chain
          }
        },
        (result) => `Balance on ${result.chain}: ${result.balance} ${result.symbol}`
      )
    },
    toolConfig
  )
}
