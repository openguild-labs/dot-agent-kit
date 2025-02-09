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
