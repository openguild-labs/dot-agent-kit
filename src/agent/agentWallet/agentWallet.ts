import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { Keyring } from "@polkadot/api";
import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { connectToSubstrate, addProxy, checkProxy, removeProxy } from '../../tools/pallet-proxy/walletManager';
import { cryptoWaitReady } from '@polkadot/util-crypto';

export interface AgentConfig {
  openAIApiKey: string;
  wsEndpoint: string;
  temperature?: number;
  privateKey?: string;
  customPromptTemplate?: string;
}

export class PolkadotAgent {
  private model: ChatOpenAI;
  private prompt: PromptTemplate;
  private keyring: Keyring;
  private sender: KeyringPair | null = null;
  private api: ApiPromise | null = null;
  private isInitialized = false;

  constructor(config: AgentConfig) {
    if (!config.openAIApiKey) {
      throw new Error("OpenAI API key is required");
    }
    if (!config.wsEndpoint) {
      throw new Error("WebSocket endpoint is required");
    }
    if (!config.privateKey) {
      throw new Error("Private key is required");
    }

    this.model = new ChatOpenAI({
      openAIApiKey: config.openAIApiKey,
      temperature: config.temperature || 0.7,
    });

    this.prompt = new PromptTemplate({
      template: config.customPromptTemplate || `
        You are an AI managing proxies on the Polkadot blockchain. Here are the available commands:
        - "add proxy <proxy_address>"
        - "check proxy <owner_address> <proxy_address>"
        - "remove proxy <proxy_address>"

        User input: {input}
        Respond in JSON format: {{ "action": "addProxy" / "checkProxy" / "removeProxy", "data": {{ ... }} }}
      `,
      inputVariables: ["input"]
    });

    this.keyring = new Keyring({ type: "sr25519" });
    this.initializeAgent(config).catch(console.error);
  }

  private async initializeAgent(config: AgentConfig) {
    await cryptoWaitReady();
    this.sender = this.keyring.addFromUri(config.privateKey!);
    this.api = await connectToSubstrate(config.wsEndpoint);
    this.isInitialized = true;
  }

  public async waitForReady(): Promise<void> {
    while (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  public async handlePrompt(input: string): Promise<string> {
    if (!this.sender) {
      throw new Error("Private key not set. Call setPrivateKey() first");
    }
    if (!this.api) {
      throw new Error("Not connected to Substrate node");
    }

    const chain = RunnableSequence.from([
      this.prompt,
      this.model,
    ]);
    const response = await chain.invoke({ input });

    try {
      const parsedResponse = JSON.parse(response.text);
      const { action, data } = parsedResponse;

      switch (action) {
        case "addProxy":
          await addProxy(
            this.api,
            this.sender,
            data.proxyAddress,
            data.proxyType,
            data.delay
          );
          return "✅ Proxy added successfully";

        case "checkProxy":
          const isProxy = await checkProxy(
            this.api,
            data.owner,
            data.proxy
          );
          return isProxy ? "✅ Proxy exists!" : "❌ Proxy not found.";

        case "removeProxy":
          await removeProxy(
            this.api,
            this.sender,
            data.proxyAddress,
            data.proxyType
          );
          return "✅ Proxy removed successfully";

        default:
          return "⚠️ Invalid action!";
      }
    } catch (error) {
      console.error("Error processing prompt:", error);
      throw new Error("Failed to process request");
    }
  }

  public async disconnect() {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
  }
}
