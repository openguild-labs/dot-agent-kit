import { west, west_asset_hub } from "@polkadot-api/descriptors";
import { ChainConfig, ChainType } from '../types/xcmTypes';

// Define an interface for the typed API
interface TypedApi {
	west: typeof west;
	westend2_asset_hub: typeof west_asset_hub;
}

// Apply the type annotation to the typedApi object
export const typedApi: TypedApi = {
	west: west,
	westend2_asset_hub: west_asset_hub,
};

export class ChainRegistry {
  private chains: Map<string, ChainConfig> = new Map();

  registerChain(config: ChainConfig): void {
    this.chains.set(config.name.toLowerCase(), config);
    if (config.parachainId) {
      this.chains.set(config.parachainId.toString(), config);
    }
  }

  getChain(name: string): ChainConfig | undefined {
    return this.chains.get(name.toLowerCase()) || 
           this.chains.get(name); // Try to find by parachain ID
  }

  isValidChain(name: string): boolean {
    return this.chains.has(name.toLowerCase()) || 
           this.chains.has(name); // Check both name and parachain ID
  }

  isRelayChain(name: string): boolean {
    const chain = this.getChain(name.toLowerCase());
    return chain?.type === ChainType.RELAY_CHAIN;
  }
}