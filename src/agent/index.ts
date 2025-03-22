import { ApiPromise } from '../tools/substrace';
import { Chain, magicApi } from '../tools/substrace';
import { addressOfSubstrate, publicKeyOf } from '../../test/config-tests/account';
import { ChainConfig, ApiConnection, AgentConfig } from '../agent/type';

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

    // Delegate account (optional)
    if (config.delegatePrivateKey) {
      const delegatePublicKey = publicKeyOf(config.delegatePrivateKey);
      this.delegateAddress = addressOfSubstrate(delegatePublicKey);
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
      } catch (error) {
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