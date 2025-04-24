import {
  Api,
  KnowChainId,
  Chain,
  SmoldotClient,
  getApi,
  getChainSpec,
  disconnect
} from "@dot-agent-kit/common"

import { start } from "polkadot-api/smoldot"

// Define the interface for the Polkadot API

export interface IPolkadotApi {
  setApi(api?: Api<KnowChainId>): void
  initializeApi(chain: Chain): Promise<void>
  disconnect(): Promise<void>
}

export class PolkadotApi implements IPolkadotApi {
  private _api?: Api<KnowChainId>
  public api: Api<KnowChainId>
  private initialized = false
  private disconnectAllowed = true
  private smoldotClient: SmoldotClient

  constructor() {
    this.smoldotClient = start()
  }

  setApi(api?: Api<KnowChainId>) {
    this._api = api
  }

  async initializeApi(chain: Chain) {
    if (this.initialized) {
      return
    } else {
      this.api = await getApi(chain.id, [chain], true, {
        enable: true,
        smoldot: this.smoldotClient,
        chainSpecs: { [chain.id]: this.getChainSpec(chain) }
      })
      this.initialized = true
    }
  }
  async disconnect(): Promise<void> {
    try {
      if (this._api) {
        await disconnect(this._api)
      }
      if (this.smoldotClient) {
        await this.smoldotClient.terminate()
      }
      this.initialized = false
      this._api = undefined
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
