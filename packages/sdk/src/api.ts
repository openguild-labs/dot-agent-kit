// // Main entry point for the Polkadot Agent Kit SDK

// // Import initialization functions
// import { PolkadotAgentKit } from "@dot-agent-kit/llm";
// import { RelayChainTools, ParaChainTools } from "@dot-agent-kit/core";

// /**
//  * Initialize the Polkadot Agent Kit SDK manually
//  * This is optional as the SDK initializes automatically on import,
//  * but this function allows for explicit initialization and error handling
//  *
//  * @param options Configuration options for SDK initialization
//  * @returns Promise that resolves when initialization is complete
//  */
// export async function initializeSDK(options?: {
//   silent?: boolean // Whether to suppress console logs
// }): Promise<void> {
//   try {
//     // Check if descriptors are already initialized
//     if (Object.keys(chainDescriptorRegistry.getAllDescriptors()).length > 0) {
//       if (!options?.silent) {
//       }
//       return
//     }

//     // Initialize chain descriptors
//     await initializeDefaultChainDescriptors()

//     if (!options?.silent) {
//     }
//   } catch (error) {
//     console.error("❌ Failed to initialize Polkadot Agent Kit SDK:", error)
//     throw error
//   }
// }

// // Auto-initialize the SDK on import
// // This makes it work like a normal SDK without manual setup
// try {
//   ;(async () => {
//     await initializeSDK({ silent: true })
//   })()
// } catch (error) {
//   console.error("❌ SDK auto-initialization failed:", error)
// }

import { IPolkadotAgentApi, PolkadotAgentApi } from "@dot-agent-kit/llm"
import { IPolkadotApi, PolkadotApi } from "@dot-agent-kit/core"
import {
  Api,
  Chain,
  disconnect,
  getApi,
  getChainSpec,
  KnowChainId,
  SmoldotClient,
  getChainByName,
  getAllSupportedChains,
  isSupportedChain
} from "@dot-agent-kit/common"
import { DynamicStructuredTool } from "@langchain/core/tools"

export class PolkadotAgentKit implements IPolkadotApi, IPolkadotAgentApi {
  private polkadotApi: PolkadotApi
  private agentApi: PolkadotAgentApi

  public chainId: string
  public wallet: Uint8Array

  constructor(chainId: string, wallet: string) {
    this.polkadotApi = new PolkadotApi()
    this.agentApi = new PolkadotAgentApi(this.polkadotApi.api)
    this.wallet = this.normalizePrivateKey(wallet)
    this.chainId = chainId
  }

  setApi(api?: Api<KnowChainId>): void {
    this.polkadotApi.setApi(api)
  }

  initializeApi(): Promise<void> {
    if (!isSupportedChain(this.chainId)) {
      throw new Error(`Chain ${this.chainId} is not supported`)
    }
    return this.polkadotApi.initializeApi(getChainByName(this.chainId, getAllSupportedChains()))
  }

  disconnect(): Promise<void> {
    return this.polkadotApi.disconnect()
  }

  getNativeBalanceTool(address: string): DynamicStructuredTool {
    return this.agentApi.getNativeBalanceTool(address)
  }

  /**
   * Normalize a private key string to Uint8Array format
   * Handles hex strings with or without 0x prefix
   *
   * @param key - Private key as string
   * @returns Uint8Array representation of the key
   * @private
   */
  private normalizePrivateKey(key: string): Uint8Array {
    if (key.startsWith("0x")) {
      return new Uint8Array(
        key
          .substring(2)
          .match(/.{1,2}/g)
          ?.map(byte => parseInt(byte, 16)) || []
      )
    } else {
      return new Uint8Array(key.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [])
    }
  }
}
