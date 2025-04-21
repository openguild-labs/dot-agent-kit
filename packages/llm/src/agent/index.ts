import {
  ChainConfig,
  ApiConnection,
  AgentConfig,
  KeyType,
} from "@openguild-labs/agent-kit-common";
import { substrateApi } from "@openguild-labs/agent-kit-polkadot";
import { ed25519 } from "@noble/curves/ed25519";
import { sr25519CreateDerive, ed25519CreateDerive } from "@polkadot-labs/hdkd";
import {
  entropyToMiniSecret,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers";
import { chainDescriptorRegistry } from "@openguild-labs/agent-kit-polkadot";
import { initializeDefaultChainDescriptors } from "@openguild-labs/agent-kit-polkadot";
import * as ss58 from "@subsquid/ss58";
import { getPolkadotSigner } from "polkadot-api/signer";

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
 * import { PolkadotLangTools } from 'polkadot-agent-kit/tools';
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
 *
 *
 *     // Use the tools helper
 *     const tools = new PolkadotLangTools(agent);
 *     const balance = await tools.checkBalance('westend2');
 *
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
  private connections: Map<string, ApiConnection> = new Map<
    string,
    ApiConnection
  >();

  /** Private key bytes for the main account */
  private mainPrivateKey: Uint8Array | null = null;

  /** Private key bytes for the delegate account */
  private delegatePrivateKey: Uint8Array | null = null;

  /** Key type for the main account */
  private mainKeyType: KeyType = "Ed25519";

  /** Key type for the delegate account */
  private delegateKeyType: KeyType = "Ed25519";

  /** Flag indicating if initialization is complete */
  private initialized: boolean = false;

  /** Promise that resolves when initialization is complete */
  private initPromise: Promise<void> | null = null;

  /**
   * Creates a new PolkadotAgentKit instance
   *
   * @param config - The agent configuration
   * @param config.privateKey - The private key for the main account (optional if mnemonic is provided or set in PRIVATE_KEY env var)
   * @param config.mnemonic - The mnemonic phrase for the main account (optional if privateKey is provided)
   * @param config.derivationPath - The derivation path for the mnemonic (default: "")
   * @param config.keyType - The key type to use (default: Ed25519)
   * @param config.delegatePrivateKey - An optional delegate account private key
   * @param config.delegateMnemonic - An optional delegate mnemonic phrase
   * @param config.delegateDerivationPath - The derivation path for the delegate mnemonic (default: "")
   * @param config.delegateKeyType - The key type for the delegate (defaults to main keyType)
   * @param config.chains - Array of chain configurations to connect to
   *
   * @throws Error if no private key or mnemonic is available
   */
  constructor(config: AgentConfig) {
    /* Set key types from config or use defaults */
    this.mainKeyType = config.keyType || "Ed25519";
    this.delegateKeyType = config.delegateKeyType || this.mainKeyType;

    /* Handle main account - either from private key or mnemonic */
    if (config.privateKey || process.env.PRIVATE_KEY) {
      /* Get private key from config or env variable */
      const privateKeyStr = config.privateKey || process.env.PRIVATE_KEY;
      if (!privateKeyStr)
        throw new Error(
          "Main private key is required if no mnemonic is provided",
        );

      /* Convert private key to proper format */
      this.mainPrivateKey = this.normalizePrivateKey(privateKeyStr);
    } else if (config.mnemonic) {
      /* Generate private key from mnemonic */
      this.mainPrivateKey = this.generatePrivateKeyFromMnemonic(
        config.mnemonic,
        config.derivationPath || "",
        this.mainKeyType,
      );
    } else {
      throw new Error(
        "Either privateKey or mnemonic is required for the main account",
      );
    }

    /* Generate public key based on key type */
    const mainPublicKey = this.getMainPublicKey();
    if (!mainPublicKey) throw new Error("Failed to generate main public key");

    /* Generate address using ss58 codec */
    this.address = ss58.codec("substrate").encode(mainPublicKey);

    /* Handle delegate key if provided - either from private key or mnemonic */
    if (config.delegatePrivateKey) {
      this.delegatePrivateKey = this.normalizePrivateKey(
        config.delegatePrivateKey,
      );
    } else if (config.delegateMnemonic) {
      this.delegatePrivateKey = this.generatePrivateKeyFromMnemonic(
        config.delegateMnemonic,
        config.delegateDerivationPath || "",
        this.delegateKeyType,
      );
    }

    /* Generate delegate address if we have a delegate key */
    if (this.delegatePrivateKey) {
      const delegatePublicKey = this.getDelegatePublicKey();
      if (delegatePublicKey) {
        this.delegateAddress = ss58
          .codec("substrate")
          .encode(delegatePublicKey);
      }
    }

    /* Start chain initialization */
    this.initPromise = this.initialize(config.chains);
  }

  /**
   * Generate a private key from a mnemonic phrase
   *
   * @param mnemonic - The mnemonic phrase
   * @param path - The derivation path (default: "")
   * @param keyType - The key type (Sr25519 or Ed25519)
   * @returns The generated private key as Uint8Array
   */
  private generatePrivateKeyFromMnemonic(
    mnemonic: string,
    path: string = "",
    keyType: KeyType,
  ): Uint8Array {
    const entropy = mnemonicToEntropy(mnemonic);
    const miniSecret = entropyToMiniSecret(entropy);

    if (keyType === "Sr25519") {
      const derive = sr25519CreateDerive(miniSecret);
      const keyPair = derive(path);
      // Use the path in derive and store the result
      return keyPair.sign(new Uint8Array(32)).slice(0, 32); // Create key from signature
    } else {
      const derive = ed25519CreateDerive(miniSecret);
      const keyPair = derive(path);
      // Use the path in derive and store the result
      return keyPair.sign(new Uint8Array(32)).slice(0, 32); // Create key from signature
    }
  }

  /**
   * Initialize the agent with chain descriptors and connections
   * @param chains Chain configurations
   * @returns Promise that resolves when initialization is complete
   */
  private async initialize(chains: ChainConfig[]): Promise<void> {
    try {
      // Initialize chain descriptors if not already done by the auto-import
      if (
        Object.keys(chainDescriptorRegistry.getAllDescriptors()).length === 0
      ) {
        await initializeDefaultChainDescriptors();
      }

      // Initialize connections to chains
      await this.initializeConnections(chains);

      // Mark initialization as complete
      this.initialized = true;
    } catch (error) {
      console.error("❌ Failed to initialize PolkadotAgentKit:", error);
      throw error;
    }
  }

  /**
   * Wait for agent initialization to complete
   * @returns Promise that resolves when initialization is complete
   */
  public async waitForInitialization(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) await this.initPromise;
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
    if (key.startsWith("0x")) {
      return new Uint8Array(
        key
          .substring(2)
          .match(/.{1,2}/g)
          ?.map((byte) => parseInt(byte, 16)) || [],
      );
    } else {
      return new Uint8Array(
        key.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
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
        const connection = await substrateApi(chain, chain.name);
        this.connections.set(chain.name, connection);
      } catch (error) {
        console.error(`Connection to ${chain.name} failed:`, error);
        throw new Error(
          `Connection to ${chain.name} failed: ${error instanceof Error ? error.message : String(error)}`,
        );
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
   * // Get connection for a chain
   * const { api } = agent.getConnection('westend2');
   *
   * // Use API for queries
   * const balance = await api.query.System.Account.getValue(someAddress);
   *
   * ```
   */
  async getConnection(chainName: string): Promise<ApiConnection> {
    // Wait for initialization to complete
    await this.waitForInitialization();

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
    await Promise.all(
      Array.from(this.connections.entries()).map(([_, connection]) =>
        connection.disconnect(),
      ),
    );
    this.connections.clear();
  }

  /**
   * Get main account public key
   *
   * @returns The public key as Uint8Array
   * @throws Error if no main private key is available
   *
   * @example
   * ```typescript
   * // Get the main account public key
   * const publicKey = agent.getMainPublicKey();
   *
   * // Use it for signing or verification
   *
   *
   * // Use it with a transaction
   * const tx = api.tx.balances.transfer(destinationAddress, amount);
   * await tx.signAndSend(publicKey);
   * ```
   */
  public getMainPublicKey(): Uint8Array | undefined {
    if (!this.mainPrivateKey) {
      throw new Error("Main private key not available");
    }

    if (this.mainKeyType === "Sr25519") {
      // For Sr25519, use the derive function to get the public key
      const derive = sr25519CreateDerive(this.mainPrivateKey as Uint8Array);
      const keyPair = derive("");
      return keyPair.publicKey;
    } else {
      // For Ed25519, use the ed25519 lib
      return ed25519.getPublicKey(this.mainPrivateKey);
    }
  }

  /**
   * Get delegate public key (if exists)
   *
   * @returns The delegate public key as Uint8Array or undefined if no delegate exists
   *
   * @example
   * ```typescript
   * // Get the delegate public key if it exists
   * const delegateKey = agent.getDelegatePublicKey();
   *
   * // Check if delegate key exists before using
   * if (delegateKey) {
   *
   *
   *   // Use it with a transaction
   *   const tx = api.tx.balances.transfer(destinationAddress, amount);
   *   await tx.signAndSend(delegateKey);
   * }
   * ```
   */
  public getDelegatePublicKey(): Uint8Array | undefined {
    if (!this.delegatePrivateKey) {
      return undefined;
    }

    if (this.delegateKeyType === "Sr25519") {
      // For Sr25519, use the derive function to get the public key
      const derive = sr25519CreateDerive(this.delegatePrivateKey as Uint8Array);
      const keyPair = derive("");
      return keyPair.publicKey;
    } else {
      // For Ed25519, use the ed25519 lib
      return ed25519.getPublicKey(this.delegatePrivateKey);
    }
  }

  /**
   * Create a signer for the main account using PAPI's getPolkadotSigner
   *
   * @returns A PAPI compatible signer for use with the Polkadot API
   * @throws Error if no main private key is available
   *
   * @example
   * ```typescript
   * // Create a signer for the main account
   * const signer = agent.createMainSigner();
   *
   * // Use signer for a transaction
   * const tx = api.tx.balances.transferKeepAlive(destination, amount);
   * await tx.signAndSend(signer);
   * ```
   */
  public createMainSigner() {
    if (!this.mainPrivateKey) {
      throw new Error("Main private key not available");
    }

    const publicKey = this.getMainPublicKey();

    if (this.mainKeyType === "Sr25519") {
      // For Sr25519, use the derive function to create a signer
      const derive = sr25519CreateDerive(this.mainPrivateKey as Uint8Array);
      const keyPair = derive("");

      return getPolkadotSigner(
        publicKey as Uint8Array,
        "Sr25519",
        keyPair.sign,
      );
    } else {
      // For Ed25519, use the ed25519 lib
      return getPolkadotSigner(
        publicKey as Uint8Array,
        "Ed25519",
        (input: Uint8Array) =>
          ed25519.sign(input, this.mainPrivateKey as Uint8Array),
      );
    }
  }

  /**
   * Create a signer for the delegate account using PAPI's getPolkadotSigner
   *
   * @returns A PAPI compatible signer for use with the Polkadot API or undefined if no delegate exists
   *
   * @example
   * ```typescript
   * // Create a signer for the delegate account
   * const delegateSigner = agent.createDelegateSigner();
   *
   * // Check if delegate signer exists before using
   * if (delegateSigner) {
   *   const tx = api.tx.balances.transferKeepAlive(destination, amount);
   *   await tx.signAndSend(delegateSigner);
   * }
   * ```
   */
  public createDelegateSigner() {
    if (!this.delegatePrivateKey) {
      return undefined;
    }

    const publicKey = this.getDelegatePublicKey() as Uint8Array;

    if (this.delegateKeyType === "Sr25519") {
      // For Sr25519, use the derive function to create a signer
      const derive = sr25519CreateDerive(this.delegatePrivateKey as Uint8Array);
      const keyPair = derive("");

      return getPolkadotSigner(publicKey, "Sr25519", keyPair.sign);
    } else {
      // For Ed25519, use the ed25519 lib
      return getPolkadotSigner(publicKey, "Ed25519", (input: Uint8Array) =>
        ed25519.sign(input, this.delegatePrivateKey as Uint8Array),
      );
    }
  }
}
