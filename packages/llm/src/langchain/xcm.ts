import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { PolkadotLangTools } from "@dot-agent-kit/core"
import { buildAccountSigner } from "@dot-agent-kit/common"
import { teleportToRelayChain, teleportToParaChain } from "@dot-agent-kit/core"
import { substrateApi } from "@dot-agent-kit/core"
import { ChainMap, defaultChainMap } from "@dot-agent-kit/core"

export const xcmTransfer = (tools: PolkadotLangTools, chainMap: ChainMap = defaultChainMap) => {
  const availableChains = Object.keys(chainMap)

  return tool(
    async ({
      sourceChain,
      destinationChain,
      amount,
      address
    }: {
      sourceChain: string
      destinationChain: string
      amount: number
      address: string
    }) => {
      try {
        // Validate both chains exist
        if (!chainMap[sourceChain]) {
          throw new Error(`Source chain "${sourceChain}" does not exist in chainMap`)
        }

        if (!chainMap[destinationChain]) {
          throw new Error(`Destination chain "${destinationChain}" does not exist in chainMap`)
        }

        const sourceChainInfo = chainMap[sourceChain]
        const destChainInfo = chainMap[destinationChain]

        // Connect to source chain
        // TODO: Uncomment this when substrateApi is implemented
        const { api, disconnect } = await substrateApi(
          { url: sourceChainInfo.url, name: sourceChainInfo.name },
          sourceChainInfo.apiKey
        )

        const signer = buildAccountSigner()
        let txHash: string

        // Determine the appropriate XCM operation based on chain types
        if (sourceChainInfo.type === "RelayChain" && destChainInfo.type === "ParaChain") {
          // Relay → Parachain transfer
          const tx = teleportToParaChain(address, BigInt(amount * 1e12))
          const result = await tx.signAndSubmit(signer)
          txHash = await result.txHash.toString()
        } else if (sourceChainInfo.type === "ParaChain" && destChainInfo.type === "RelayChain") {
          // Parachain → Relay transfer
          const tx = teleportToRelayChain(address, BigInt(amount * 1e12))
          const result = await tx.signAndSubmit(signer)
          txHash = await result.txHash.toString()
        } else {
          throw new Error(
            `Unsupported transfer path: ${sourceChainInfo.type} to ${destChainInfo.type}`
          )
        }

        if (disconnect) disconnect()

        return {
          content: JSON.stringify({
            message: `Successfully transferred ${amount} tokens from ${sourceChain} to ${destinationChain}`,
            sourceChain,
            destinationChain,
            amount,
            recipient: address,
            hash: txHash
          }),
          tool_call_id: `xcm_${Date.now()}`
        }
      } catch (error) {
        console.error(`Error in xcmTransfer: ${error}`)
        return {
          content: JSON.stringify({
            error: true,
            sourceChain,
            destinationChain,
            message: `Unable to transfer tokens: ${error instanceof Error ? error.message : String(error)}`
          }),
          tool_call_id: `xcm_${Date.now()}`
        }
      }
    },
    {
      name: "xcmTransfer",
      description: `Transfer tokens between chains using XCM with your account. Available chains: ${availableChains.join(", ")}`,
      schema: z.object({
        sourceChain: z
          .string()
          .describe("Name of the source chain sending the tokens (must exist in chainMap)"),
        destinationChain: z
          .string()
          .describe("Name of the destination chain receiving the tokens (must exist in chainMap)"),
        amount: z.number().positive().describe("Amount of tokens to transfer"),
        address: z.string().describe("Address to receive tokens")
      })
    }
  )
}
