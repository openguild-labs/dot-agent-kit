import { DynamicStructuredTool } from "@langchain/core/tools"
import { ToolConfig, ToolNames } from "../types"
import { z } from "zod"

/**
 * Schema for the balance check tool input.
 * Defines the structure and validation rules for balance check requests.
 *
 * @example
 * ```typescript
 * {
 *   chain: "polkadot"  // Chain to check balance on
 * }
 * ```
 */
export const balanceToolSchema = z.object({
    chain: z
        .string()
        .describe(
            "The chain name to check balance on (e.g., 'polkadot', 'kusama', 'west', 'westend_asset_hub')"
        )
})

// Define tool types
export type BalanceTool = DynamicStructuredTool<typeof balanceToolSchema>

export interface BalanceToolResult {
    balance: string
    symbol: string
    chain: string
}

export const toolConfigBalance: ToolConfig = {
    name: ToolNames.CHECK_BALANCE,
    description: "Check balance of the wallet address on a specific chain",
    schema: balanceToolSchema
}



