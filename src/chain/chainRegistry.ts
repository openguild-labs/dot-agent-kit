import { west, dot } from "@polkadot-api/descriptors";
import { ChainConfig, ChainType } from '../types/xcmTypes';

// Define an interface for the typed API
interface TypedApi {
	west: typeof west;
	dot: typeof dot;
}
// Apply the type annotation to the typedApi object
export const typedApi: TypedApi = {
	west: west,
	dot: dot,
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