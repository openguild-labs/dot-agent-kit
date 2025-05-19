import { z } from "zod"


/**
 * Constants for tool names used across the application.
 * These constants ensure consistency in tool naming and prevent typos.
 */
export const TOOL_NAMES = {
    /** Tool for checking native token balance */
    CHECK_BALANCE: "check_balance",
    /** Tool for transferring native tokens */
    TRANSFER_NATIVE: "transfer_native"
} as const

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
    chain: z.string().describe(
        "The chain name to check balance on (e.g., 'polkadot', 'kusama', 'west', 'westend_asset_hub')"
    )
})


/**
 * Interface for tool configuration.
 * Defines the structure for configuring tools.
 * 
 * @example
 * ```typescript
 * const config: ToolConfig = {
 *   name: "check_balance",
 *   description: "Check balance of the wallet address on a specific chain",
 *   schema: balanceToolSchema
 * }
 * ```
 */
export interface ToolConfig {
    /** The name of the tool */
    name: string
    /** Description of what the tool does */
    description: string
    /** Zod schema for validating tool inputs */
    schema: z.ZodType
}


export interface ToolResponse {
    content: string
    tool_call_id: string
}

export interface ToolError extends Error {
    code: string
    details?: unknown
}

export class ChainNotAvailableError extends Error implements ToolError {
    code = 'CHAIN_NOT_AVAILABLE'
    constructor(chain: string, availableChains: string[]) {
        super(`Chain '${chain}' not available. Available chains: ${availableChains.join(", ")}`)
    }
}

export class InvalidAddressError extends Error implements ToolError {
    code = 'INVALID_ADDRESS'
    constructor(address: string) {
        super(`Invalid address: ${address}`)
    }
}

