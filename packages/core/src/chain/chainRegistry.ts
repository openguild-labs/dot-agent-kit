import { CHAINS, ChainConfigXCM } from "@dot-agent-kit/common"

// Type definitions for chain registry
export type ChainName = string
export type Multichain<T> = Record<ChainName, T>

/**
 * Dynamic chain descriptor registry
 * Instead of hardcoding chains, we'll use a dynamic approach where descriptors
 * can be loaded and registered at runtime
 */
export class ChainDescriptorRegistry {
  private descriptors: Map<string, any> = new Map()

  /**
   * Register a chain descriptor
   * @param chainName The unique identifier for the chain
   * @param descriptor The chain descriptor from @polkadot-api/descriptors
   */
  registerDescriptor(chainName: string, descriptor: any): void {
    this.descriptors.set(chainName.toLowerCase(), descriptor)
  }

  /**
   * Get a chain descriptor by name
   * @param chainName The chain name to look up
   * @returns The chain descriptor or undefined if not found
   */
  getDescriptor(chainName: string): any | undefined {
    return this.descriptors.get(chainName.toLowerCase())
  }

  /**
   * Check if a descriptor exists for a chain
   * @param chainName The chain name to check
   * @returns True if a descriptor exists
   */
  hasDescriptor(chainName: string): boolean {
    return this.descriptors.has(chainName.toLowerCase())
  }

  /**
   * Get all registered chain descriptors
   * @returns An object containing all descriptors
   */
  getAllDescriptors(): Record<string, any> {
    const result: Record<string, any> = {}
    this.descriptors.forEach((descriptor, name) => {
      result[name] = descriptor
    })
    return result
  }
}

// Create and export a singleton instance
export const chainDescriptorRegistry = new ChainDescriptorRegistry()

// For backwards compatibility during migration
export const typedApi = chainDescriptorRegistry.getAllDescriptors()

/** Define the ChainRegistry class **/
export class ChainRegistry {
  private chains: Multichain<ChainConfigXCM> = {}

  /**
   * Register a chain configuration
   * @param config The chain configuration to register
   */
  registerChain(config: ChainConfigXCM): void {
    this.chains[config.name.toLowerCase()] = config
    if (config?.parachainId) {
      this.chains[config.parachainId.toString()] = config
    }
  }

  /**
   * Get a chain configuration by name
   * @param name The name of the chain to get
   * @returns The chain configuration or undefined if not found
   */
  getChain(name: ChainName): ChainConfigXCM | undefined {
    return this.chains[name.toLowerCase()] || this.chains[name]
  }

  /**
   * Check if a chain exists by name
   * @param name The name of the chain to check
   * @returns True if the chain exists
   */
  isValidChain(name: ChainName): boolean {
    return name.toLowerCase() in this.chains || name in this.chains
  }

  /**
   * Check if a chain is a relay chain
   * @param name The chain name or identifier
   * @returns True if the chain is a relay chain
   */
  isRelayChain(name: ChainName): boolean {
    const chain = this.getChain(name)
    return chain?.type === CHAINS.RELAY_CHAIN
  }
}
