import { Api, KnowChainId } from "@polkadot-agent-kit/common"
import { convertAddress, toMultiAddress } from "@polkadot-agent-kit/core"
import { MultiAddress } from "@polkadot-api/descriptors"
import { 
  ToolResponse,
  ChainNotAvailableError, 
  InvalidAddressError 
} from "../types"

// Utility function to generate tool_call_id
export const generateToolCallId = (prefix: string): string => `${prefix}_${Date.now()}`


export const getApiForChain = (apis: Map<KnowChainId, Api<KnowChainId>>, chain: string): Api<KnowChainId> => {
  const api = apis.get(chain as KnowChainId)
  if (!api) {
    const availableChains = Array.from(apis.keys())
    throw new ChainNotAvailableError(chain, availableChains)
  }
  return api 
}


export const validateAndFormatAddress = (address: string, chain: KnowChainId): string => {
  const formattedAddress = convertAddress(address, chain)
  if (!formattedAddress) {
    throw new InvalidAddressError(address)
  }
  return formattedAddress
}


export const validateAndFormatMultiAddress = (address: string, chain: KnowChainId): MultiAddress => {
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