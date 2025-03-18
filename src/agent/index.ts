import { ApiPromise } from '../tools/substrace';
import { Chain, magicApi } from '../tools/substrace';
import { addressOfSubstrate, publicKeyOf } from '../../test/config-tests/account';

// Define type for chain configuration
interface ChainConfig {
  url: string; // WebSocket URL of the chain
  name: string; // Name of the chain (e.g., 'westend', 'kusama', 'polkadot')
}

// Define interface for API connection
interface ApiConnection {
  api: ApiPromise;
  disconnect: () => void;
}

// Define configuration for PolkadotAgentKit
interface AgentConfig {
  privateKey?: string; // Private key of the main account (optional, defaults to env)
  delegatePrivateKey?: string; // Private key of the delegate account (optional)
  chains: ChainConfig[]; // List of chains to connect to
}

/**
 * Core class for interacting with Polkadot/Substrate blockchains
 * Manages account details and chain connections
 */
export class PolkadotAgentKit {
  public address: string; // Address of the main account
  public delegateAddress?: string; // Address of the delegate account (if provided)
  private connections: Map<string, ApiConnection>;

  constructor(config: AgentConfig) {
    // Main account (use env if privateKey is not provided)
    const mainPrivateKey = config.privateKey || process.env.PRIVATE_KEY;
    if (!mainPrivateKey) throw new Error("Main private key is required");
    const mainPublicKey = publicKeyOf(mainPrivateKey);
    this.address = addressOfSubstrate(mainPublicKey);
    console.log('My account:', this.address);

    // Delegate account (optional)
    if (config.delegatePrivateKey) {
      const delegatePublicKey = publicKeyOf(config.delegatePrivateKey);
      this.delegateAddress = addressOfSubstrate(delegatePublicKey);
      console.log('My delegate account:', this.delegateAddress);
    }

    // Initialize connections map
    this.connections = new Map<string, ApiConnection>();

    // Connect to the specified chains
    this.initializeConnections(config.chains);
  }

  /**
   * Initialize connections to all chains in the config
   */
  private async initializeConnections(chains: ChainConfig[]): Promise<void> {
    for (const chain of chains) {
      try {
        const connection = await magicApi(
          { url: chain.url, name: chain.name },
          chain.name as Chain,
        );
        this.connections.set(chain.name, connection);
        console.log(`Connected to ${chain.name} at ${chain.url}`);
      } catch (error) {
        console.error(`Failed to connect to ${chain.name}:`, error);
        throw new Error(`Connection to ${chain.name} failed`);
      }
    }
  }

  /**
   * Get the API connection for a specific chain
   */
  public getConnection(chainName: string): ApiConnection {
    const connection = this.connections.get(chainName);
    if (!connection) {
      throw new Error(`No connection found for chain: ${chainName}`);
    }
    return connection;
  }

  /**
   * Disconnect from all chains
   */
  public disconnectAll(): void {
    for (const [chainName, connection] of this.connections) {
      connection.disconnect();
      console.log(`Disconnected from ${chainName}`);
    }
    this.connections.clear();
  }

  /**
   * Get main account public key
   */
  public getMainPublicKey(): Uint8Array {
    return publicKeyOf(process.env.PRIVATE_KEY || "");
  }

  /**
   * Get delegate public key (if exists)
   */
  public getDelegatePublicKey(): Uint8Array | undefined {
    return this.delegateAddress ? publicKeyOf(this.delegateAddress) : undefined;
  }
}