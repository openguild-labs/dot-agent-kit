import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { getNativeBalance, convertAddress } from "@polkadot-agent-kit/core"
import { Api, KnowChainId, getAllSupportedChains, getChainByName } from "@polkadot-agent-kit/common"

/**
 * Enhances the tool to process prompts and dynamically switch between chains.
 * @returns A tool that sets the chain context based on the provided chain name or ID in the prompt.
 */
export const checkBalanceTool = (
    apis: Map<string, any>,
    address: string
) => {
    return tool(
        async ({ chainId, prompt }: { chainId?: string; prompt?: string }) => {
            try {
                let chain;
                if (prompt) {
                    const supportedChains = getAllSupportedChains();
                    chain = supportedChains.find(c => prompt.toLowerCase().includes(c.name.toLowerCase()));
                    if (!chain) {
                        throw new Error(`No matching chain found in prompt: ${prompt}`);
                    }
                } else if (chainId) {
                    chain = getChainById(chainId);
                }

                if (!chain) {
                    throw new Error(`Chain not found. Provide a valid chainId or include chain details in the prompt.`);
                }

                return {
                    content: `Current chain context set to ${chain.name}`,
                    tool_call_id: `set_chain_context_${Date.now()}`
                };
            } catch (error) {
                return {
                    content: `Error setting chain context: ${error.message}`,
                    tool_call_id: `set_chain_context_error_${Date.now()}`
                };
            }
        },
        {
            name: "set_chain_context",
            description: "Set the current blockchain context (chainId or prompt)",
            schema: z.object({
                chainId: z.string().optional().describe("The ID of the blockchain to set as context"),
                prompt: z.string().optional().describe("A prompt containing chain-specific instructions")
            })
        }
    );
};
