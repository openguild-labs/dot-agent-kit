import {
  Api,
  KnowChainId,
  Chain,
  SmoldotClient,
  getApi,
  getChainSpec,
  disconnect,
  getAllSupportedChains,
  specRegistry
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
  private initPromise: Promise<void> | null = null

  constructor() {
    this.smoldotClient = start()
  }

  setApi(chainId: KnowChainId, api?: Api<KnowChainId>) {
    if (api) {
      this._apis.set(chainId, api)
    }
  }

  getApi(chainId: KnowChainId): Api<KnowChainId> {
    if (!this.initialized) {
      throw new Error("APIs not initialized. Call initializeApi() first.")
    }
    const api = this._apis.get(chainId)
    if (!api) {
      throw new Error(`API for chain ${chainId} not found`)
    }
    return api
  }
  
  getAllApis(): Map<KnowChainId, Api<KnowChainId>> {
    if (!this.initialized) {
      throw new Error("APIs not initialized. Call initializeApi() first.")
    }
    return this._apis
  }
  async initializeApi(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    if (this.initialized) {
      return
    }

    this.initPromise = (async () => {
      try {
        const supportedChains = getAllSupportedChains()

        const chainSpecs: Record<KnowChainId, string> = {
          polkadot: "",
          west: "",
          polkadot_asset_hub: "",
          west_asset_hub: ""
        }

        for (const chain of supportedChains) {
          chainSpecs[chain.id as KnowChainId] = this.getChainSpec(chain.id as KnowChainId)
        }

        const apiInitPromises = supportedChains.map(async chain => {
          try {
            const api = await getApi(chain.id as KnowChainId, [chain], true, {
              enable: true,
              smoldot: this.smoldotClient,
              chainSpecs
            })
            return { chain, api }
          } catch (error) {
            console.error(`Failed to initialize API for ${chain.id}:`, error)
            throw error
          }
        })

        const results = await Promise.all(apiInitPromises)
        for (const { chain, api } of results) {
          this._apis.set(chain.id as KnowChainId, api)
        }

        this.initialized = true
      } catch (error) {
        throw new Error(
          `Failed to initialize APIs: ${error instanceof Error ? error.message : String(error)}`
        )
      } finally {
        this.initPromise = null
      }
    })()

    return this.initPromise
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

  getChainSpec(chainId: KnowChainId) {
    return getChainSpec(chainId, specRegistry())
  }
}
