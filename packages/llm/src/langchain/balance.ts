import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { getNativeBalance, convertAddress } from "@polkadot-agent-kit/core"
import { Api, KnowChainId, formatBalance } from "@polkadot-agent-kit/common"

// Utility function to generate tool_call_id
const generateToolCallId = (prefix: string) => `${prefix}_${Date.now()}`

// Utility function to validate chain and retrieve the API
const getApiForChain = (apis: Map<KnowChainId, Api<KnowChainId>>, chain: string) => {
  const api = apis.get(chain as KnowChainId)
  if (!api) {
    const availableChains = Array.from(apis.keys()).join(", ")
    throw new Error(`Chain '${chain}' not available. Available chains: ${availableChains}`)
  }
  return api
}

// Utility function to validate and format the address
const validateAndFormatAddress = (address: string, chain: KnowChainId) => {
  const formattedAddress = convertAddress(address, chain)
  if (!formattedAddress) {
    throw new Error(`Invalid address: ${address}`)
  }
  return formattedAddress
}

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
        // Validate chain and get API instance
        const api = getApiForChain(apis, chain)
        
        if (!api) {
          const availableChains = Array.from(apis.keys()).join(", ")
          return {
            content: `Chain '${chain}' not available. You can check balance on: ${availableChains}`,
            tool_call_id: `balance_error_${Date.now()}`
          }
        }
        // format address with correct chain prefix
        const formattedAddress = validateAndFormatAddress(address, chain as KnowChainId)
        if (!formattedAddress) {
          return {
            content: `Invalid address: ${address}`,
            tool_call_id: `balance_error_${Date.now()}`
          }
        }
        const balanceInfo = await getNativeBalance(api, formattedAddress)
        const formattedBalance = formatBalance(balanceInfo.balance, balanceInfo.decimals)

        return {
          content: `Balance on ${chain}: ${formattedBalance} ${balanceInfo.symbol}`,
          tool_call_id: generateToolCallId("balance")

        }
      } catch (error: any) {
        return {
          content: `Error checking balance on ${chain}: ${error.message}`,
          tool_call_id: generateToolCallId("balance_error")
        }
      }
    },
    {
      name: "check_balance",
      description: "Check balance of the wallet address on a specific chain",
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
