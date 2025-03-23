import { ChainConfig, CHAINS } from '../types/xcmTypes';

/**
 * Dynamic chain descriptor registry
 * Instead of hardcoding chains, we'll use a dynamic approach where descriptors
 * can be loaded and registered at runtime
 */
export class ChainDescriptorRegistry {
  private descriptors: Map<string, any> = new Map();

  /**
   * Register a chain descriptor
   * @param chainName The unique identifier for the chain
   * @param descriptor The chain descriptor from @polkadot-api/descriptors
   */
  registerDescriptor(chainName: string, descriptor: any): void {
    this.descriptors.set(chainName.toLowerCase(), descriptor);
  }

  /**
   * Get a chain descriptor by name
   * @param chainName The chain name to look up
   * @returns The chain descriptor or undefined if not found
   */
  getDescriptor(chainName: string): any | undefined {
    return this.descriptors.get(chainName.toLowerCase());
  }

  /**
   * Check if a descriptor exists for a chain
   * @param chainName The chain name to check
   * @returns True if a descriptor exists
   */
  hasDescriptor(chainName: string): boolean {
    return this.descriptors.has(chainName.toLowerCase());
  }

  /**
   * Get all registered chain descriptors
   * @returns An object containing all descriptors
   */
  getAllDescriptors(): Record<string, any> {
    const result: Record<string, any> = {};
    this.descriptors.forEach((descriptor, name) => {
      result[name] = descriptor;
    });
    return result;
  }
}

// Create and export a singleton instance
export const chainDescriptorRegistry = new ChainDescriptorRegistry();

// For backwards compatibility during migration
export const typedApi = chainDescriptorRegistry.getAllDescriptors();

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
    return chain?.type === CHAINS.RELAY_CHAIN;
  }
}