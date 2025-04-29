# Polkadot AI Agent Kit 

![Group 57](https://github.com/user-attachments/assets/ddc9ebc7-0bc6-4bac-af3e-82f378c959f5)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Status: In Development](https://img.shields.io/badge/Status-In%20Development-yellow)
<br/>
<br/>
**Polkadot AI Agent Kitt** is an open-source library designed to build AI Agents that interact with the Polkadot ecosystem. The library provides tools for wallet management, cross-chain transactions, NFT interactions, DeFi integrations, and interactions with Asset Hub and parachains such as People Chain and Kusama Chain. The project will be archived under the **[OpenGuild](https://github.com/openguild-labs)** organization upon completion.

- All packages can be found in: https://www.npmjs.com/settings/polkadot-agent-kit/packages

## 📦 Project Overview

### Objectives
- **Simplify** the development of AI Agents on Polkadot.
- Provide **extensive tools** for interacting with Substrate, parachains, XCM, NFTs, and DeFi protocols.
- Support **secure wallet management** through Proxy or MPC solutions.
- Integrate an **AI interface** for controlling the Agent using natural language.

## ✨ Features

| Feature | Description |
|----------|-------|
| **Substrate Connection** | Support HTTP/WebSocket connections to Polkadot, Kusama, and parachains. |
| **Wallet Management** | Use **pallet-proxy** for delegation or MPC solutions for multi-layer security. |
| **Cross-Chain Transactions** | Transfer tokens via XCM between Relay Chain, Asset Hub, and parachains. |
| **NFT Interactions** | Manage and interact with NFTs across parachains (e.g., minting, transferring, and querying NFTs). |
| **DeFi Integrations** | Interact with DeFi protocols for staking, swapping, and yield farming. |
| **OpenGov Interaction** | Create/vote on proposals on People Chain and manage governance. |
| **AI Interface** | Control the Agent using natural language commands (e.g., *"Swap 100 USDC to DOT and transfer to Coretime Chain"*). |

## 🛠️ Phases & Deliverables

### **Phase 1: Core Library**
| Tool | Description |
|---------|-------|
| **Substrate Connection** | Basic connection to Substrate nodes via Polkadot.js API. |
| **Wallet Management** | Integrate Proxy Accounts and authentication via SR25519/Ed25519. |
| **XCM Transaction Tools** | Support token transfers via XCM between parachains. |
| **Parachain Modules** | Interact with Asset Hub (Assets), People Chain (Governance), and Coretime Chain. |
| **NFT Tools** | Provide tools for minting, transferring, and querying NFTs across parachains. |
| **DeFi Tools** | Enable interactions with DeFi protocols for staking, swapping, and yield farming. |

### **Phase 2: AI Interface**
| Deliverable | Description |
|-------------|-------|
| **Prompt Interface** | Control the Agent using commands such as: |
| ```await agent.prompt("Vote Proposal #123 on OpenGov")``` | |
| ```await agent.prompt("Transfer 10 DOT from Asset Hub to Coretime Chain")``` | |
| ```await agent.prompt("Mint an NFT on Asset Hub")``` | |
| ```await agent.prompt("Stake 100 DOT on a DeFi protocol")``` | |
| **Natural Language Processing** | Integrate AI models to analyze natural language requests. |

## Chain Configuration and Setup

This project provides a flexible, interactive system to install Polkadot chains. The `.papi/` directory is included in `.gitignore` to prevent tracking of chain descriptors, which means each developer needs to set up their desired chains after cloning the repository.

### Quick Setup

After cloning the project, the easiest way to setup chains is:

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run the interactive chain setup script:
   ```bash
   pnpm run test:setup
   ```

This will launch an interactive CLI menu that allows you to:
- Choose from common predefined chains
- Add custom chains
- Install from a configuration file
- Save your configuration for later use

### Command Line Options

The setup script supports various command line options for more flexibility:

```bash
# Show all available options
pnpm run setup -- --help

# List all common predefined chains
pnpm run setup -- --list

# Install specific chains directly
pnpm run setup -- --install west,west_asset_hub

# Install chains from a configuration file
pnpm run setup -- --config ./my-chains.json
```

### Custom Chain Configuration

You can create your own chain configuration file with this format:

```json
{
  "chains": [
    {
      "id": "chain_id",
      "name": "chain_name_in_system",
      "description": "Description of the chain (optional)"
    }
  ]
}
```

The setup script will automatically detect:
1. A `chains.config.json` file in the project root directory
2. A custom path specified via the `--config` option
3. An environment variable `CHAINS_CONFIG_PATH` pointing to your config file

### Why is `.papi/` in `.gitignore`?

The `.papi/` directory contains descriptors for Polkadot chains. These descriptors:
1. Can be quite large
2. Can be generated automatically
3. May differ between development environments
4. May be updated frequently

By placing this directory in `.gitignore`, we avoid tracking unnecessary files and allow each developer to set up chains according to their specific needs.

### Troubleshooting

If you encounter errors during chain installation:

1. Make sure you're using the Node.js version specified in `package.json` (Node.js 22).
2. Delete the `.papi/` directory and try again from scratch.
3. For specific chains, you can try installing them manually:
   ```bash
   npx papi add [chain_id] -n [chain_name]
   ```
4. Ensure you have a stable internet connection when running the setup script.

## Dynamic Chain Registry

The Polkadot AI Agent Kit has been enhanced with a dynamic chain registry system, allowing the library to support any Substrate-based parachain, not just predefined ones. This makes the library more flexible and future-proof.

### Automatic Initialization

The SDK now automatically initializes chain descriptors when imported, making it work like a standard SDK without manual setup:

```typescript
// Just import the SDK - chain descriptors are loaded automatically
import { PolkadotAgentKit } from 'polkadot-agent-kit';

// Create an agent - no initialization needed
const agent = new PolkadotAgentKit({
  privateKey: process.env.PRIVATE_KEY,
  chains: [
    { name: 'westend', url: 'wss://westend-rpc.polkadot.io' }
  ]
});

// Use the agent immediately
const connection = await agent.getConnection('westend');
```

If you need to control the initialization timing, you can use the explicit initialization function:

```typescript
import { initializeSDK, PolkadotAgentKit } from 'polkadot-agent-kit';

// Initialize SDK explicitly (optional, it also initializes automatically)
await initializeSDK();

// Now create your agent
const agent = new PolkadotAgentKit({ /* config */ });
```

### How It Works

1. **Chain Descriptors**: Chain descriptors are registered at runtime, instead of being hardcoded imports.

2. **Registering Chains**: You can register any Substrate-based chain using our registry system:

   ```typescript
   import { registerChainDescriptor } from 'polkadot-agent-kit/chain/chainInit';
   import { someChainDescriptor } from '@polkadot-api/descriptors';
   
   // Register a new chain
   registerChainDescriptor('my_custom_chain', someChainDescriptor);
   ```

3. **Using Registered Chains**: Once registered, you can use the chain with the agent:

   ```typescript
   const agent = new PolkadotAgentKit({
     privateKey: process.env.PRIVATE_KEY,
     chains: [
       { name: 'my_custom_chain', url: 'wss://my-custom-chain-rpc.example.com' }
     ]
   });
   
   // Use the chain like any other
   const { api } = await agent.getConnection('my_custom_chain');
   ```

4. **Default Chains**: The library still initializes common chains by default for convenience:

   - westend2 (Westend Relay Chain)
   - westend2_asset_hub (Westend Asset Hub)
   - polkadot (Polkadot Relay Chain)
   - polkadot_asset_hub (Polkadot Asset Hub)
   - kusama (Kusama Relay Chain)
   - kusama_asset_hub (Kusama Asset Hub)

### Custom Chain Descriptors

For custom chains, you need to:

1. Import the descriptor from `@polkadot-api/descriptors` or create a custom one
2. Register it with `registerChainDescriptor(chainName, descriptor)`

This approach ensures the library remains flexible while working correctly with the package structure of Polkadot API.

### Chain Naming Conventions

For compatibility reasons, the library supports multiple naming conventions for the same chains:

| Chain Type | Supported Names |
|------------|----------------|
| Westend Relay Chain | `westend`, `westend2` |
| Westend Asset Hub | `westend_asset_hub`, `westend2_asset_hub` |
| Kusama Relay Chain | `kusama`, `ksmcc3` |
| Kusama Asset Hub | `kusama_asset_hub`, `ksmcc3_asset_hub` |

When connecting to chains, you can use either naming convention. We recommend using the more descriptive names (`westend`, `westend_asset_hub`, etc.) for better readability.

### Automatic Reconnection

The SDK includes an automatic reconnection system to handle network disruptions and chain reorganizations. When connection issues like `ChainHead disjointed` errors occur, the system will:

1. Detect the connection problem automatically
2. Attempt to reconnect with exponential backoff (starting at 1 second, doubling each time)
3. Try up to 5 reconnection attempts before giving up
4. Maintain your existing API objects with the same references

This provides better resilience against temporary network issues and chain reorganizations without requiring application-level error handling in most cases.

Example of a connection that automatically recovers:

```typescript
// Create an agent as usual
const agent = new PolkadotAgentKit({
  privateKey: process.env.PRIVATE_KEY,
  chains: [{ name: 'westend', url: 'wss://westend-rpc.polkadot.io' }]
});

// Get a connection - it will automatically reconnect if needed
const { api } = await agent.getConnection('westend');

// Even if the connection drops temporarily, it will reconnect in the background
// and your code can continue to use the same API object
```

## Key Types and Mnemonic Support

The Polkadot AI Agent Kit now supports both Sr25519 and Ed25519 key types with dynamic configuration, as well as mnemonic phrase key generation.

### Key Type Configuration

You can specify which key type to use when creating your agent:

```typescript
// Create an agent with Sr25519 keys
const agent = new PolkadotAgentKit({
  privateKey: process.env.PRIVATE_KEY,
  keyType: 'Sr25519',  // Use Sr25519 for signing (default is Ed25519)
  chains: [
    { name: 'westend', url: 'wss://westend-rpc.polkadot.io' }
  ]
});
```

### Mnemonic Phrase Support

You can now create an agent using a mnemonic phrase instead of a raw private key:

```typescript
// Create an agent from a mnemonic phrase
const agent = new PolkadotAgentKit({
  mnemonic: 'word1 word2 word3 ... word12',  // Your 12 or 24 word mnemonic
  derivationPath: '',  // Optional derivation path (default: '')
  keyType: 'Sr25519',  // Optional key type (default: Ed25519)
  chains: [
    { name: 'westend', url: 'wss://westend-rpc.polkadot.io' }
  ]
});
```

### Using Both Key Types and Delegation

You can mix key types and use both private keys and mnemonics with delegation:

```typescript
// Advanced configuration with different key types
const agent = new PolkadotAgentKit({
  // Main account with mnemonic
  mnemonic: 'word1 word2 word3 ... word12',
  derivationPath: '//0',
  keyType: 'Sr25519',
  
  // Delegate account with private key
  delegatePrivateKey: '0x1234...',
  delegateKeyType: 'Ed25519',
  
  // Or delegate with mnemonic
  // delegateMnemonic: 'word1 word2 word3 ... word12',
  // delegateDerivationPath: '//1',
  // delegateKeyType: 'Sr25519',
  
  chains: [
    { name: 'westend', url: 'wss://westend-rpc.polkadot.io' }
  ]
});
```

### Available Key Types

| Key Type | Description |
|----------|-------------|
| `Ed25519` | Edwards-curve Digital Signature Algorithm (EdDSA) with 255-bit curve. Default key type. |
| `Sr25519` | Schnorrkel/Ristretto signatures on the Ristretto group on curve25519. Used by Polkadot ecosystem for account keys. |

---

## 🤝 Contributing

We welcome contributions from the community! Please:
1. Fork the repository.
2. Create a new branch for your feature/bug fix.
3. Submit a Pull Request with a detailed description of your changes.

---

## 📜 License

This project is licensed under the **[MIT License](LICENSE)**.
