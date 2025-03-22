import { west, west_asset_hub } from "@polkadot-api/descriptors";
import { ChainConfig, Chain } from '../types/xcmTypes';

/** Define type for chain configuration **/
interface TypedApi {
	westend: typeof west;
	westend_asset_hub: typeof west_asset_hub;
}

/** Apply the type annotation to the typedApi object **/
export const typedApi: TypedApi = {
	westend: west,
	westend_asset_hub: west_asset_hub,
};

/** Define the ChainRegistry class **/
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
           this.chains.get(name); 
  }

  isValidChain(name: string): boolean {
    return this.chains.has(name.toLowerCase()) || 
           this.chains.has(name); 
  }

  isRelayChain(name: string): boolean {
    const chain = this.getChain(name.toLowerCase());
    return chain?.type === Chain.RELAY_CHAIN;
  }
}