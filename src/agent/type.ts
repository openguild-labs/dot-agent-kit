import { ApiPromise } from '../tools/substrace';

// Define type for chain configuration
export interface ChainConfig {
  url: string; // WebSocket URL of the chain
  name: string; // Name of the chain (e.g., 'westend', 'kusama', 'polkadot')
}

// Define interface for API connection
export interface ApiConnection {
  api: ApiPromise;
  disconnect: () => void;
}

// Define configuration for PolkadotAgentKit
export interface AgentConfig {
  privateKey?: string; // Private key of the main account (optional, defaults to env)
  delegatePrivateKey?: string; // Private key of the delegate account (optional)
  chains: ChainConfig[]; // List of chains to connect to
}
// Define type for chain configuration
export interface ChainConfig {
    url: string; // WebSocket URL of the chain
    name: string; // Name of the chain (e.g., 'westend', 'kusama', 'polkadot')
}
  
// Define interface for API connection
export interface ApiConnection {
    api: ApiPromise;
    disconnect: () => void;
}
  
// Define configuration for PolkadotAgentKit
export interface AgentConfig {
    privateKey?: string; // Private key of the main account (optional, defaults to env)
    delegatePrivateKey?: string; // Private key of the delegate account (optional)
    chains: ChainConfig[]; // List of chains to connect to
}