import {
  Api,
  KnowChainId,
  Chain,
  SmoldotClient,
  getApi,
  getChainSpec,
  disconnect,
  getAllSupportedChains,

} from "@dot-agent-kit/common"

import { start } from "polkadot-api/smoldot"

// Define the interface for the Polkadot API

export interface IPolkadotApi {
  setApi(chainId: KnowChainId, api?: Api<KnowChainId>): void
  initializeApi(): Promise<void>
  disconnect(): Promise<void>
  getApi(chainId: KnowChainId): Api<KnowChainId>
}

export class PolkadotApi implements IPolkadotApi {
  private _apis: Map<KnowChainId, Api<KnowChainId>> = new Map()
  private initialized = false
  private smoldotClient: SmoldotClient

  constructor() {
    this.smoldotClient = start()
  }

  setApi(chainId: KnowChainId, api?: Api<KnowChainId>) {
    if (api) {
      this._apis.set(chainId, api)
    }
  }

  getApi(chainId: KnowChainId): Api<KnowChainId> {
    return this._apis.get(chainId) as Api<KnowChainId>
  }

  async initializeApi(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      const supportedChains = getAllSupportedChains()
      const chainSpecs: Record<KnowChainId, string> = {
        polkadot: '',
        west: '',
        polkadot_asset_hub: '',
        west_asset_hub: ''
      }
      
      for (const chain of supportedChains) {
        chainSpecs[chain.id as KnowChainId] = this.getChainSpec(chain)
      }

      // Initialize APIs for all supported chains
      for (const chain of supportedChains) {
        const api = await getApi(chain.id as KnowChainId, [chain], true, {
          enable: true,
          smoldot: this.smoldotClient,
          chainSpecs
        })
        this._apis.set(chain.id as KnowChainId, api)
      }

      this.initialized = true
    } catch (error) {
      throw new Error(
        `Failed to initialize APIs: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Disconnect all chain APIs
      for (const [chainId, api] of this._apis.entries()) {
        await disconnect(api)
        this._apis.delete(chainId)
      }

      if (this.smoldotClient) {
        await this.smoldotClient.terminate()
      }

      this.initialized = false
    } catch (error) {
      throw new Error(
        `Failed to disconnect: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  getChainSpec(chain: Chain) {
    return getChainSpec(chain.id)
  }
}
