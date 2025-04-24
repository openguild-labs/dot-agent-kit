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
  isSupportedChain,
  AgentConfig
} from "@dot-agent-kit/common"
import { DynamicStructuredTool } from "@langchain/core/tools"
import { sr25519CreateDerive, ed25519CreateDerive } from "@polkadot-labs/hdkd"
import * as ss58 from "@subsquid/ss58"

export class PolkadotAgentKit implements IPolkadotApi, IPolkadotAgentApi {
  private polkadotApi: PolkadotApi
  private agentApi: PolkadotAgentApi

  public chainId: string
  public wallet: Uint8Array
  public config: AgentConfig

  constructor(chainId: string, wallet: string, config: AgentConfig) {
    this.polkadotApi = new PolkadotApi()
    this.agentApi = new PolkadotAgentApi(this.polkadotApi.api)
    this.wallet = this.normalizePrivateKey(wallet)
    this.chainId = chainId
    this.config = config
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
   * Get Address
   *
   * @returns The address as string
   * @throws Error if no main private key is available
   *
   * @example
   * ```typescript
   * // Get the main account address
   * const address = agent.getAddress();
   * ```
   */
  public getAddress(): string {
    const publicKey = this.getPublicKey()
    const value = publicKey
    if (!value) {
      return ""
    }
    return ss58.codec(this.chainId).encode(value)
  }

  
  /**
   * Get main account public key
   *
   * @returns The public key as Uint8Array
   * @throws Error if no main private key is available
   *
   * @example
   * ```typescript
   * // Get the main account public key
   * const publicKey = agent.getPublicKey();
   * ```
   */
  private getPublicKey(): Uint8Array {
    if (this.config.keyType === "Sr25519") {
      // For Sr25519, use the derive function to get the public key
      const derive = sr25519CreateDerive(this.wallet as Uint8Array)
      return derive(this.config.derivationPath || "").publicKey
    } else {
      // For Ed25519, use the ed25519 lib
      const derive = ed25519CreateDerive(this.wallet as Uint8Array)
      return derive(this.config.derivationPath || "").publicKey
    }
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
