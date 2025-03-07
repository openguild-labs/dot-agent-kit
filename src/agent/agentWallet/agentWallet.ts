import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { executeAction } from '../../tools/action';
import { ApiPromise, magicApi } from '../../tools/substrace/substraceConnector';
import { ChainRegistry } from '../../chain/chainRegistry';
import { HumanMessage } from "@langchain/core/messages";

export interface AgentConfig {
  openAIApiKey: string;
  wsEndpoint: string;
  temperature?: number;
  privateKey?: string;
  customPromptTemplate?: string;
  chainRegistry?: ChainRegistry;
}

export class PolkadotAgent {
  private model: ChatOpenAI;
  private prompt: PromptTemplate;
  private api: ApiPromise | null = null;
  private _disconnect: (() => void) | null = null;

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
You are an AI managing transfers on the Polkadot blockchain. Here are the available commands:
- "add proxy <proxy_address>"
- "check proxy <owner_address> <proxy_address>"
- "remove proxy <proxy_address>"
- "transfer <amount> from <source_chain> to <destination_chain>"

For XCM transfers:
- Source chain can be: "Westend", "Asset Hub" (parachain 1000)
- Destination chain can be: parachain ID (e.g. "1000") or "relay" for relay chain
- Amount should be in native tokens (e.g. "0.1 WND")

User input: {input}
Respond with a JSON object containing:
{{
  "action": "addProxy" | "checkProxy" | "removeProxy" | "xcmTransfer",
  "data": {{
    "proxyAddress": "<address>",
    "ownerAddress": "<address>",
    "amount": number,
    "sourceChain": string,
    "destChain": string
  }}
}}
Ensure the response is always a valid JSON object.`,
      inputVariables: ["input"]
    });

    // Initialize API connection
    this.initializeApi(config.wsEndpoint);
  }

  private async initializeApi(wsEndpoint: string) {
    try {
      const { api, disconnect } = await magicApi({ url: wsEndpoint, name: 'westend' }, 'west');
      this.api = api;
      this._disconnect = disconnect;
    } catch (error) {
      console.error('Failed to connect to API:', error);
    }
  }

  public async handleUserCommand(input: string): Promise<string> {
    if (!this.api) {
      throw new Error("API not initialized");
    }

    const response = await this.model.invoke([new HumanMessage(input)]);
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.text);
    } catch (error) {
      console.error("Failed to parse JSON response:", response.text);
      return `Error: Invalid JSON response from AI model. Response: ${response.text}`;
    }

    const { action, data } = parsedResponse;
    const result = await executeAction(action, { api: this.api, ...data });

    // Convert result to string if it's not already
    return typeof result === 'string' ? result : JSON.stringify(result);
  }

  public async disconnect() {
    if (this._disconnect) {
      this._disconnect();
    }
    this.api = null;
  }

  public async waitForReady(): Promise<void> {
    while (!this.api) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
