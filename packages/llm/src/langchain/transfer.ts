import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { convertAddress, toMultiAddress, transferNativeCall } from "@polkadot-agent-kit/core"
import { Api, getAllSupportedChains, getChainById, KnowChainId, parseUnits } from "@polkadot-agent-kit/common"
import { MultiAddress } from "@polkadot-api/descriptors"


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
const validateAndFormatAddress = (address: string, chain: KnowChainId): MultiAddress => {
  const formattedAddress = convertAddress(address, chain)
  if (!formattedAddress) {
    throw new Error(`Invalid address: ${address}`)
  }
  return toMultiAddress(formattedAddress)
}


function getDecimals(chainId: string): number {
  const chain = getChainById(chainId, getAllSupportedChains())
  return chain.decimals
}



/**
 * Returns a tool that transfers native tokens to a specific address
 * @param api The API instance to use for the transfer
 * @returns A dynamic structured tool that transfers native tokens to the specified address
 */
export const transferNativeTool = (apis: Map<KnowChainId, Api<KnowChainId>>) => {
  return tool(
    async ({ amount, to, chain }: { amount: string; to: string; chain: string }) => {
      try {
        // Validate chain and get API instance
        const api = getApiForChain(apis, chain)

        if (!api) {
          const availableChains = Array.from(apis.keys()).join(", ")
          return {
            content: `Chain '${chain}' not available. You can check supported chains on: ${availableChains}`,
            tool_call_id: `transfer_native_error_${Date.now()}`
          }
        }
        // format address with correct chain prefix
        const formattedAddress = validateAndFormatAddress(to, chain as KnowChainId)
        if (!formattedAddress) {
          return {
            content: `Invalid address: ${to}`,
            tool_call_id: `transfer_native_error_${Date.now()}`
          }
        }

        const parsedAmount = parseUnits(amount, getDecimals(chain))
        await transferNativeCall(api, formattedAddress, parsedAmount)
        return {
          content: `Transferred ${amount} to ${formattedAddress}`,
          tool_call_id: `transfer_native_${Date.now()}`
        }
      } catch (error) {
        return {
          content: `Error transferring ${amount} to ${to}: ${error.message}`,
          tool_call_id: `transfer_native_error_${Date.now()}`
        }
      }
    },
    {
      name: "transfer_native",
      description: "Transfer native tokens to a specific address",
      schema: z.object({
        amount: z.string().describe("The amount of tokens to transfer"),
        to: z.string().describe("The address to transfer the tokens to"),
        chain: z.string().describe("The chain to transfer the tokens to"),
      })
    }
  )
}
