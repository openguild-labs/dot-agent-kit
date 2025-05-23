import { Api, KnownChainId } from "@polkadot-agent-kit/common"
import { convertAddress, toMultiAddress } from "@polkadot-agent-kit/core"
import { MultiAddress } from "@polkadot-api/descriptors"
import { ToolResponse, ChainNotAvailableError, InvalidAddressError } from "../types"

/**
 * Internal utility to generate unique IDs for tool responses.
 * Used by createErrorResponse and createSuccessResponse to generate
 * tool_call_id values in the format: `${prefix}_${timestamp}`
 */
const generateToolCallId = (prefix: string): string => `${prefix}_${Date.now()}`

export const getApiForChain = (
  apis: Map<KnownChainId, Api<KnownChainId>>,
  chain: string
): Api<KnownChainId> => {
  const api = apis.get(chain as KnownChainId)
  if (!api) {
    const availableChains = Array.from(apis.keys())
    throw new ChainNotAvailableError(chain, availableChains)
  }
  return api
}

export const validateAndFormatAddress = (address: string, chain: KnownChainId): string => {
  const formattedAddress = convertAddress(address, chain)
  if (!formattedAddress) {
    throw new InvalidAddressError(address)
  }
  return formattedAddress
}

export const validateAndFormatMultiAddress = (
  address: string,
  chain: KnownChainId
): MultiAddress => {
  const formattedAddress = validateAndFormatAddress(address, chain)
  return toMultiAddress(formattedAddress)
}

export const createErrorResponse = (message: string, toolName: string): ToolResponse => ({
  content: message,
  tool_call_id: generateToolCallId(`${toolName}_error`)
})

export const createSuccessResponse = (message: string, toolName: string): ToolResponse => ({
  content: message,
  tool_call_id: generateToolCallId(toolName)
})

export const executeTool = async <T>(
  toolName: string,
  operation: () => Promise<T>,
  successMessage: (result: T) => string
): Promise<ToolResponse> => {
  try {
    const result = await operation()
    return createSuccessResponse(successMessage(result), toolName)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return createErrorResponse(errorMessage, toolName)
  }
}
