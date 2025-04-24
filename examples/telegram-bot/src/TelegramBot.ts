import { Telegraf } from 'telegraf';
import { ChatOpenAI } from '@langchain/openai';
import { Tool } from '@langchain/core/tools';
import { setupHandlers } from './handlers';
import { PolkadotAgentKit } from '@dot-agent-kit/sdk';
import { getChainByName, KnowChainId, getAllSupportedChains } from '@dot-agent-kit/common';
import { polkadot } from '@polkadot-api/descriptors';


interface BotConfig {
  botToken: string;
  openAiApiKey?: string;
  privateKey?: string;
  // delegatePrivateKey?: string;
  // chains: { url: string; name: string; apiKey: string; type: 'RelayChain' | 'ParaChain'; paraId?: number }[];
}

export class TelegramBot {
  private bot: Telegraf;
  private agent: PolkadotAgentKit;
  private llm: ChatOpenAI;

  constructor(config: BotConfig) {
    const {
      botToken,
      openAiApiKey,
      privateKey,
      // delegatePrivateKey,
      // chains,
    } = config;

    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN must be provided!');
    }

    this.bot = new Telegraf(botToken);

    this.agent = new PolkadotAgentKit(config.privateKey as string, {keyType: 'Sr25519'});


    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: openAiApiKey,
      streaming: true,
    });


    const balanceTool = this.agent.getNativeBalanceTool(polkadot as unknown as KnowChainId);
    // const tools = new PolkadotLangTools(this.agent);
    // const xcmTool = xcmTransfer(tools, this.chainMap) as unknown as Tool;
    // const balanceTool = checkBalanceTool(tools) as unknown as Tool;
    // const proxiesTool = checkProxiesTool(tools, this.chainMap) as unknown as Tool;

    setupHandlers(this.bot, this.llm, {
      // xcmTransfer: xcmTool,
      checkBalance: balanceTool,
      // checkProxies: proxiesTool,
    });
  }

  public async start(): Promise<void> {
    try {
      await this.bot.launch();
      
    } catch (error) {
      console.error('Failed to start bot:', error);
      throw error;
    }
  }

  public stop(): void {
    // this.agent.disconnectAll();
    this.bot.stop();
    
  }
}