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


import { IPolkadotAgentApi } from "@dot-agent-kit/llm"
import { IPolkadotApi } from "@dot-agent-kit/core"
import { Api, Chain, getApi, getChainSpec, KnowChainId, SmoldotClient } from "@dot-agent-kit/common"
import * as ed from '@noble/curves/ed25519';
import { start } from "polkadot-api/smoldot";

export class PolkadotApi implements IPolkadotApi {
    private _api?: Api<KnowChainId>
    private api: Api<KnowChainId>
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

        }

        else {
            this.api = await getApi(chain.id, [chain], true, {
                enable: true,
                smoldot: this.smoldotClient,
                chainSpecs: { [chain.id]: this.getChainSpec(chain) }
            })
        }
    }
    disconnect(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    getChainSpec(chain: Chain) {
        return getChainSpec(chain.id)
    }
}