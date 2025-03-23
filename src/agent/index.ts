import { Chain, magicApi } from '../tools/substrace';
import { addressOfSubstrate, publicKeyOf } from '../../test/config-tests/account';
import { ChainConfig, ApiConnection, AgentConfig } from '../types/typeAgent';

/**
 * # PolkadotAgentKit
 * 
 * Core class for interacting with Polkadot/Substrate blockchains, providing a unified interface
 * to manage accounts, connections to multiple chains, and cross-chain transactions.
 * 
 * ## Features
 * 
 * - Account management (main account and optional delegate)
 * - Multi-chain connection management
 * - Automatic chain connection/disconnection
 * - Simple API access for chain interactions
 * 
 * ## Example Usage
 * 
 * ```typescript
 * import { PolkadotAgentKit } from 'polkadot-agent-kit';
 * import { PolkadotTools } from 'polkadot-agent-kit/tools';
 * 
 * // Initialize the agent with your account and chains
 * const agent = new PolkadotAgentKit({
 *   privateKey: process.env.PRIVATE_KEY,
 *   delegatePrivateKey: process.env.DELEGATE_PRIVATE_KEY,
 *   chains: [
 *     { name: 'westend2', url: 'wss://westend-rpc.polkadot.io' },
 *     { name: 'westend2_asset_hub', url: 'wss://westend-asset-hub-rpc.polkadot.io', relayChain: 'westend2' }
 *   ]
 * });
 * 
 * // Use the agent to interact with chains
 * async function main() {
 *   try {
 *     // Access a specific chain
 *     const { api } = agent.getConnection('westend2');
 *     
 *     // Use the API for transactions
 *     const tx = api.tx.Balances.transfer_keep_alive({
 *       dest: 'destination-address',
 *       value: 1000000000 // 0.1 WND
 *     });
 *     
 *     // Sign and submit transaction
 *     const result = await tx.signAndSend(agent.getMainPublicKey());
 *     console.log('Transaction hash:', result.hash);
 *     
 *     // Use the tools helper
 *     const tools = new PolkadotTools(agent);
 *     const balance = await tools.checkBalance('westend2');
 *     console.log('WND Balance:', balance);
 *     
 *     // Always disconnect when done
 *     agent.disconnectAll();
 *   } catch (error) {
 *     console.error('Error:', error);
 *     agent.disconnectAll();
 *   }
 * }
 * ```
 */
export class PolkadotAgentKit {
  /** The main account address in SS58 format */
  public address: string;
  
  /** The delegate address in SS58 format, if a delegate private key was provided */
  public delegateAddress?: string; 
  
  /** Map of chain connections indexed by chain name */
  private connections: Map<string, ApiConnection>;

  /**
   * Creates a new PolkadotAgentKit instance
   * 
   * @param config - The agent configuration
   * @param config.privateKey - The private key for the main account (optional if set in PRIVATE_KEY env var)
   * @param config.delegatePrivateKey - An optional delegate account private key
   * @param config.chains - Array of chain configurations to connect to
   * 
   * @throws Error if no private key is available
   */
  constructor(config: AgentConfig) {
    const mainPrivateKey = config.privateKey || process.env.PRIVATE_KEY;
    if (!mainPrivateKey) throw new Error("Main private key is required");
    const mainPublicKey = publicKeyOf(mainPrivateKey);
    this.address = addressOfSubstrate(mainPublicKey);

    if (config.delegatePrivateKey) {
      const delegatePublicKey = publicKeyOf(config.delegatePrivateKey);
      this.delegateAddress = addressOfSubstrate(delegatePublicKey);
    }

    this.connections = new Map<string, ApiConnection>();
    this.initializeConnections(config.chains);
    
  }

  /**
   * Initialize connections to all chains in the config
   * 
   * @param chains - Array of chain configurations
   * @private
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
   * 
   * @param chainName - The name of the chain to get connection for
   * @returns The API connection object with `api` and `disconnect` properties
   * @throws Error if no connection exists for the specified chain
   * 
   * @example
   * ```typescript
   * // Get API for specific chain
   * const { api } = agent.getConnection('westend2');
   * 
   * // Use API for queries
   * const balance = await api.query.System.Account.getValue(someAddress);
   * console.log('Balance:', balance.data.free.toString());
   * ```
   */
  public getConnection(chainName: string): ApiConnection {
    const connection = this.connections.get(chainName);
    if (!connection) {
      throw new Error(`No connection found for chain: ${chainName}`);
    }
    return connection;
  }

  /**
   * Disconnect from all chains and clear connections
   * 
   * Always call this method when you're done using the agent to free resources
   * 
   * @example
   * ```typescript
   * // When done with the agent
   * agent.disconnectAll();
   * ```
   */
  public disconnectAll(): void {
    for (const [chainName, connection] of this.connections) {
      connection.disconnect();
    }
    this.connections.clear();
  }

  /**
   * Get main account public key
   * 
   * @returns The public key as Uint8Array
   */
  public getMainPublicKey(): Uint8Array {
    return publicKeyOf(process.env.PRIVATE_KEY || "");
  }

  /**
   * Get delegate public key (if exists)
   * 
   * @returns The delegate public key as Uint8Array or undefined if no delegate exists
   */
  public getDelegatePublicKey(): Uint8Array | undefined {
    return this.delegateAddress ? publicKeyOf(this.delegateAddress) : undefined;
  }
}