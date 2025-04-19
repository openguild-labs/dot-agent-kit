// Export all chain-related functionality
export * from "./chainRegistry";
export * from "./chainInit";
export * from "./chainMap";

// Import the initialization function for convenient access
import { initializeDefaultChainDescriptors } from "./chainInit";

// Initialize default chain descriptors automatically when this module is imported
// This makes the SDK work automatically without manual initialization
try {
  // Use an immediately-invoked function expression to handle the async initialization
  (async () => {
    await initializeDefaultChainDescriptors();
  })();
} catch (error) {
  throw error;
}
