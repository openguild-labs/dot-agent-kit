// Main entry point for the Polkadot Agent Kit SDK

// Export core modules
export * from './agent';
export * from './chain';
export * from './tools';

// Export types selectively to avoid naming conflicts
export { ApiConnection, AgentConfig } from './types/typeAgent';
// Re-export these types explicitly from xcmTypes
export { CHAINS, XcmTransferParams } from './types/xcmTypes';
export * from './types/connect';

// Import initialization functions
import { initializeDefaultChainDescriptors } from './chain/chainInit';
import { chainDescriptorRegistry } from './chain/chainRegistry';

/**
 * Initialize the Polkadot Agent Kit SDK manually
 * This is optional as the SDK initializes automatically on import,
 * but this function allows for explicit initialization and error handling
 * 
 * @param options Configuration options for SDK initialization
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeSDK(options?: {
  silent?: boolean; // Whether to suppress console logs
}): Promise<void> {
  try {
    // Check if descriptors are already initialized
    if (Object.keys(chainDescriptorRegistry.getAllDescriptors()).length > 0) {
      if (!options?.silent) {
        console.log('✅ SDK already initialized');
      }
      return;
    }
    
    // Initialize chain descriptors
    await initializeDefaultChainDescriptors();
    
    if (!options?.silent) {
      console.log('✅ Polkadot Agent Kit SDK initialized successfully');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Polkadot Agent Kit SDK:', error);
    throw error;
  }
}

// Auto-initialize the SDK on import
// This makes it work like a normal SDK without manual setup
try {
  (async () => {
    await initializeSDK({ silent: true });
  })();
} catch (error) {
  console.error('❌ SDK auto-initialization failed:', error);
} 