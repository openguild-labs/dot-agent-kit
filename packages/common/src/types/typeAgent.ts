import { ApiPromise } from "../../../core/dist"
/** Define type for chain configuration **/
export interface ChainConfig {
  url: string
  name: string
}

/** Define interface for API connection **/
export interface ApiConnection {
  api: ApiPromise
  disconnect: () => void
}

/** Key type supported by the agent */
export type KeyType = "Sr25519" | "Ed25519"

/** Define configuration for PolkadotAgentKit **/
export interface AgentConfig {
  /** Private key as string (hex encoded) */
  privateKey?: string
  /** Mnemonic phrase to generate keys */
  mnemonic?: string
  /** Derivation path for the mnemonic (default: empty string) */
  derivationPath?: string
  /** Key type to use (Sr25519 or Ed25519, default: Ed25519) */
  keyType?: KeyType
  /** Optional delegate private key */
  delegatePrivateKey?: string
  /** Optional delegate mnemonic phrase */
  delegateMnemonic?: string
  /** Optional delegate derivation path */
  delegateDerivationPath?: string
  /** Optional delegate key type (defaults to main keyType) */
  delegateKeyType?: KeyType
  /** Chain configurations */
  chains: ChainConfig[]
}
