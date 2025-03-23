import { Chain, substrateApi } from '../tools/substrace';
import { ChainConfig, ApiConnection, AgentConfig } from '../types/typeAgent';
import { getPolkadotSigner } from 'polkadot-api/signer';
import { ed25519 } from '@noble/curves/ed25519';
import * as ss58 from '@subsquid/ss58';

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
 *   privateKey: '0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133', // or use process.env.PRIVATE_KEY
 *   delegatePrivateKey: '0x8075991ce870b93a8870eca0c0f91913d12f47948ca0fd25b49c6fa7cdbeee8b', // optional
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
  private connections: Map<string, ApiConnection> = new Map<string, ApiConnection>();

  /** Private key bytes for the main account */
  private mainPrivateKey: Uint8Array | null = null;
  
  /** Private key bytes for the delegate account */
  private delegatePrivateKey: Uint8Array | null = null;

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
    /* Get private key from config or env variable */
    const privateKeyStr = config.privateKey || process.env.PRIVATE_KEY;
    if (!privateKeyStr) throw new Error("Main private key is required");
    
    /* Convert private key to proper format using PAPI methods */
    this.mainPrivateKey = this.normalizePrivateKey(privateKeyStr);
    const mainPublicKey = ed25519.getPublicKey(this.mainPrivateKey);
    
    /* Generate address using ss58 codec (standard PAPI pattern) */
    this.address = ss58.codec('substrate').encode(mainPublicKey);

    /* Handle delegate key if provided */
    if (config.delegatePrivateKey) {
      this.delegatePrivateKey = this.normalizePrivateKey(config.delegatePrivateKey);
      const delegatePublicKey = ed25519.getPublicKey(this.delegatePrivateKey);
      this.delegateAddress = ss58.codec('substrate').encode(delegatePublicKey);
    }

    /* Initialize connections to all chains in the config */
    this.initializeConnections(config.chains);
  }

  /**
   * Normalize a private key string to Uint8Array format
   * Handles hex strings with or without 0x prefix
   * 
   * @param key - Private key as string
   * @returns Uint8Array representation of the key
   * @private
   */
  private normalizePrivateKey(key: string): Uint8Array {
    if (key.startsWith('0x')) {
      return new Uint8Array(
        key.substring(2).match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
    } else {
      return new Uint8Array(
        key.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
    }
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
        const connection = await substrateApi(
          chain,
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
  public async disconnectAll(): Promise<void> {
    await Promise.all(Array.from(this.connections.entries()).map(([_, connection]) => connection.disconnect()));
    this.connections.clear();
  }

  /**
   * Get main account public key
   * 
   * @returns The public key as Uint8Array or undefined if no private key is available
   */
  public getMainPublicKey(): Uint8Array | undefined {
    if (!this.mainPrivateKey) {
      throw new Error("Main private key not available");
    }
    return ed25519.getPublicKey(this.mainPrivateKey);
  }

  /**
   * Get delegate public key (if exists)
   * 
   * @returns The delegate public key as Uint8Array or undefined if no delegate exists
   */
  public getDelegatePublicKey(): Uint8Array | undefined {
    if (!this.delegatePrivateKey) {
      return undefined;
    }
    return ed25519.getPublicKey(this.delegatePrivateKey);
  }
  
  /**
   * Create a signer for the main account using PAPI's getPolkadotSigner
   * 
   * @returns A PAPI compatible signer
   */
  public createMainSigner() {
    if (!this.mainPrivateKey) {
      throw new Error("Main private key not available");
    }
    
    const publicKey = this.getMainPublicKey();
    return getPolkadotSigner(
      publicKey as Uint8Array,
      "Ed25519",
      (input: Uint8Array) => ed25519.sign(input, this.mainPrivateKey as Uint8Array)
    );
  }
  
  /**
   * Create a signer for the delegate account using PAPI's getPolkadotSigner
   * 
   * @returns A PAPI compatible signer or undefined if no delegate exists
   */
  public createDelegateSigner() {
    if (!this.delegatePrivateKey) {
      return undefined;
    }
    
    const publicKey = this.getDelegatePublicKey() as Uint8Array;
    return getPolkadotSigner(
      publicKey,
      "Ed25519",
      (input: Uint8Array) => ed25519.sign(input, this.delegatePrivateKey as Uint8Array)
    );
  }
}