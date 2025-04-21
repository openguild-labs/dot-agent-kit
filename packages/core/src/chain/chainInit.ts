import { chainDescriptorRegistry } from "./chainRegistry"

/**
 * Configuration for chain aliases
 */
interface ChainAliasConfig {
  descriptorName: string
  aliases: string[]
}

/**
 * Register a chain descriptor
 * @param chainName The chain name identifier
 * @param descriptor The chain descriptor object
 */
export function registerChainDescriptor(chainName: string, descriptor: any): void {
  try {
    // Register it in our registry
    chainDescriptorRegistry.registerDescriptor(chainName, descriptor)
  } catch (error) {
    throw error
  }
}

/**
 * Initialize default chain descriptors by importing them directly
 * This avoids the dynamic import path issues with @polkadot-api/descriptors
 */
export async function initializeDefaultChainDescriptors(
  descriptors: Record<string, any> = {},
  includeDefaults = true,
  chainConfigs: ChainAliasConfig[] = []
): Promise<void> {
  try {
    const defaultConfigs: ChainAliasConfig[] = includeDefaults
      ? [
          { descriptorName: "west", aliases: ["westend", "westend2"] },
          {
            descriptorName: "west_asset_hub",
            aliases: ["westend_asset_hub", "westend2_asset_hub"]
          },
          { descriptorName: "polkadot", aliases: ["polkadot"] },
          {
            descriptorName: "polkadot_asset_hub",
            aliases: ["polkadot_asset_hub"]
          },
          { descriptorName: "ksmcc3", aliases: ["kusama", "ksmcc3"] },
          {
            descriptorName: "ksmcc3_asset_hub",
            aliases: ["kusama_asset_hub", "ksmcc3_asset_hub"]
          }
        ]
      : []

    // Combine default and custom configurations
    const allConfigs = [...defaultConfigs, ...(chainConfigs || [])]

    // Register all descriptors
    for (const config of allConfigs) {
      const descriptor = descriptors[config.descriptorName]

      if (!descriptor) {
        continue
      }

      // Register all aliases for this descriptor
      for (const alias of config.aliases) {
        registerChainDescriptor(alias, descriptor)
      }
    }
  } catch (error) {
    throw error
  }
}
