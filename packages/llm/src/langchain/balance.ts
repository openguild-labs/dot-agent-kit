import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { getNativeBalance, convertAddress } from "@polkadot-agent-kit/core"
import { Api, KnowChainId } from "@polkadot-agent-kit/common"

/**
 * Returns a tool that checks the balance of a specific address
 * @param apis Map of chain IDs to API instances
 * @param address The address to check the balance for
 * @returns A dynamic structured tool that checks the balance of the specified address
 */
export const checkBalanceTool = (apis: Map<KnowChainId, Api<KnowChainId>>, address: string) => {
  return tool(
    async ({ chain }: { chain: string }) => {
      try {
        const api = apis.get(chain as KnowChainId)

        if (!api) {
          const availableChains = Array.from(apis.keys()).join(", ")
          return {
            content: `Chain '${chain}' not available. You can check balance on: ${availableChains}`,
            tool_call_id: `balance_error_${Date.now()}`
          }
        }
        // format address with correct chain prefix
        const formattedAddress = convertAddress(address, chain as KnowChainId)
        if (!formattedAddress) {
          return {
            content: `Invalid address: ${address}`,
            tool_call_id: `balance_error_${Date.now()}`
          }
        }
        const balance = await getNativeBalance(api, formattedAddress)

        return {
          content: `Balance on ${chain}: ${balance.toString()}`,
          tool_call_id: `balance_${Date.now()}`
        }
      } catch (error) {
        return {
          content: `Error checking balance on ${chain}: ${error.message}`,
          tool_call_id: `balance_error_${Date.now()}`
        }
      }
    },
    {
      name: "check_balance",
      description: "Check balance of the agent's account on a specific chain",
      schema: z.object({
        chain: z
          .string()
          .describe(
            "The chain name to check balance on (e.g., 'polkadot', 'kusama', 'west', 'westend_asset_hub')"
          )
      })
    }
  )
}
