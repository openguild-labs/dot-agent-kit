import { chainDescriptorRegistry } from './chainRegistry';

/**
 * Register a chain descriptor
 * @param chainName The chain name identifier
 * @param descriptor The chain descriptor object
 */
export function registerChainDescriptor(chainName: string, descriptor: any): void {
  try {
    // Register it in our registry
    chainDescriptorRegistry.registerDescriptor(chainName, descriptor);
    console.log(`Successfully registered chain descriptor for ${chainName}`);
  } catch (error) {
    console.error(`Failed to register chain descriptor for ${chainName}:`, error);
    throw error;
  }
}

/**
 * Initialize default chain descriptors by importing them directly
 * This avoids the dynamic import path issues with @polkadot-api/descriptors
 */
export async function initializeDefaultChainDescriptors(): Promise<void> {
  try {
    // Import descriptors directly to avoid path resolution issues
    // These imports are resolved at compile time rather than runtime
    const { west, west_asset_hub, polkadot, polkadot_asset_hub, ksmcc3, ksmcc3_asset_hub } = await import('@polkadot-api/descriptors');
    
    // Register each descriptor with our registry - handle both naming conventions
    // Westend chains - register both 'westend' and 'westend2' for compatibility
    registerChainDescriptor('westend', west);
    registerChainDescriptor('westend2', west);
    registerChainDescriptor('westend_asset_hub', west_asset_hub);
    registerChainDescriptor('westend2_asset_hub', west_asset_hub);
    
    // Polkadot chains
    registerChainDescriptor('polkadot', polkadot);
    registerChainDescriptor('polkadot_asset_hub', polkadot_asset_hub);
    
    // Kusama chains
    registerChainDescriptor('kusama', ksmcc3);
    registerChainDescriptor('ksmcc3', ksmcc3); // Alternative name
    registerChainDescriptor('kusama_asset_hub', ksmcc3_asset_hub);
    registerChainDescriptor('ksmcc3_asset_hub', ksmcc3_asset_hub); // Alternative name
    
    console.log('Successfully initialized default chain descriptors');
  } catch (error) {
    console.error('Failed to initialize default chain descriptors:', error);
    throw error;
  }
} 