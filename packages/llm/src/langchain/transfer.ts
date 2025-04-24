import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { transferNativeCall } from "@dot-agent-kit/core"
import { Api, KnowChainId } from "@dot-agent-kit/common"
import { MultiAddress } from "@dot-agent-kit/common/.papi/descriptors"

export const transferNativeTool = (api: Api<KnowChainId>) => {
  return tool(
    async ({ address, amount }: { address: MultiAddress; amount: bigint }) => {
      try {
        const balance = await transferNativeCall(api, address, amount)
        return {
          content: `Transferred ${amount} to ${address}`,
          tool_call_id: `transfer_${Date.now()}`
        }
      } catch (error) {
        return {
          content: `Error transferring ${amount} to ${address}: ${error.message}`,
          tool_call_id: `transfer_error_${Date.now()}`
        }
      }
    },
    {
      name: "transfer_native",
      description: "Transfer native tokens to a specific address",
      schema: z.object({
        address: z.string().describe("The address to transfer the tokens to"),
        amount: z.bigint().describe("The amount of tokens to transfer")
      })
    }
  )
}
