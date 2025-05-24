import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ToolConfig, ToolNames } from "../types";

/**
 * Schema for the transfer tool input.
 * Defines the structure and validation rules for token transfer requests.
 *
 * @example
 * ```typescript
 * {
 *   amount: "1.5",  // Amount of tokens to transfer
 *   to: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",  // Recipient address
 *   chain: "polkadot"  // Target chain
 * }
 * ```
 */
export const transferToolSchema = z.object({
    amount: z.string().describe("The amount of tokens to transfer"),
    to: z.string().describe("The address to transfer the tokens to"),
    chain: z.string().describe("The chain to transfer the tokens to")
})

export type TransferTool = DynamicStructuredTool<typeof transferToolSchema>

export interface TransferResult {
    amount: string
    address: string
    chain: string
}

export const toolConfigTransferNative: ToolConfig = {
    name: ToolNames.TRANSFER_NATIVE,
    description: "Transfer native tokens to a specific address",
    schema: transferToolSchema
}



