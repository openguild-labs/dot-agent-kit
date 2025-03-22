# Polkadot AI Agent Kit 

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Status: In Development](https://img.shields.io/badge/Status-In%20Development-yellow)

**Polkadot AI Agent Kitt** is an open-source library designed to build AI Agents that interact with the Polkadot ecosystem. The library provides tools for wallet management, cross-chain transactions, NFT interactions, DeFi integrations, and interactions with Asset Hub and parachains such as People Chain and Kusama Chain. The project will be archived under the **[OpenGuild](https://github.com/openguild-labs)** organization upon completion.

---

## 📦 Project Overview

### Objectives
- **Simplify** the development of AI Agents on Polkadot.
- Provide **extensive tools** for interacting with Substrate, parachains, XCM, NFTs, and DeFi protocols.
- Support **secure wallet management** through Proxy or MPC solutions.
- Integrate an **AI interface** for controlling the Agent using natural language.

---

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

---

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

---

## 🗺️ Roadmap

| Phase | Task | Status |
|-----------|-----------|------------|
| Phase 1 | Build core library (Substrate, XCM, Proxy, NFT, DeFi) | Planned |
| Phase 2 | Develop AI Interface and NLP | Planned |
| Phase 3 | Integrate MPC wallets and enhanced security | Planned |

---

## 🤝 Contributing

We welcome contributions from the community! Please:
1. Fork the repository.
2. Create a new branch for your feature/bug fix.
3. Submit a Pull Request with a detailed description of your changes.

---

## 📜 License

This project is licensed under the **[MIT License](LICENSE)**.

---

## 📬 Contact

- **GitHub Issues**: [Report Bugs/Suggestions](https://github.com/chauanhtuan185/polkadot-ai-agent-kit/issues)
- **Email**: [Telegram](https://t.me/kayx64)

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
pnpm run test:setup -- --help

# List all common predefined chains
pnpm run test:setup -- --list

# Install specific chains directly
pnpm run test:setup -- --install west,west_asset_hub

# Install chains from a configuration file
pnpm run test:setup -- --config ./my-chains.json
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
