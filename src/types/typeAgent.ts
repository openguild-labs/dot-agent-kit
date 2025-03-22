import { ApiPromise } from '../tools/substrace';

/** Define type for chain configuration **/
export interface ChainConfig {
  url: string;
  name: string; 
}

/** Define interface for API connection **/
export interface ApiConnection {
  api: ApiPromise;
  disconnect: () => void;
}

/** Define configuration for PolkadotAgentKit **/
export interface AgentConfig {
  privateKey?: string; 
  delegatePrivateKey?: string; 
  chains: ChainConfig[]; 
}

/** Define type for chain configuration **/
export interface ChainConfig {
    url: string; 
    name: string; 
}
  
/**  Define interface for API connection **/
export interface ApiConnection {
    api: ApiPromise;
    disconnect: () => void;
}
  
/** Define configuration for PolkadotAgentKit **/
export interface AgentConfig {
    privateKey?: string; 
    delegatePrivateKey?: string; 
    chains: ChainConfig[]; 
}