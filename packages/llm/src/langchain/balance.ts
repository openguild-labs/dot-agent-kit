import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { getNativeBalance, PolkadotApi } from "@dot-agent-kit/core"
import { Api, KnowChainId } from "@dot-agent-kit/common"

export const checkBalanceTool = (api: Api<KnowChainId>) => {
  return tool(
    async ({ address }: { address: string }) => {
      try {
        const balance = await getNativeBalance(api, address)
        return {
          content: `Balance on ${address}: ${balance.toString()}`,
          tool_call_id: `balance_${Date.now()}`
        }
      } catch (error) {
        return {
          content: `Error checking balance on ${address}: ${error.message}`,
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
            "The chain name to check balance on (e.g., 'polkadot', 'kusama', 'westend', 'westend_asset_hub', etc.)"
          )
      })
    }
  )
}
