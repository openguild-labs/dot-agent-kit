import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { ChatOpenAI } from '@langchain/openai';
import { PolkadotAgentKit } from '../../../src/agent/index';
import { PolkadotTools } from '../../../src/tools/index';
import { Tool } from '@langchain/core/tools';
import { setupHandlers } from './handlers';
import { xcmTransfer } from '../../../src/langchain/xcm/index';

dotenv.config();

interface BotConfig {
  botToken: string;
  openAiApiKey?: string;
  privateKey?: string;
  delegatePrivateKey?: string;
  chains: { url: string; name: string }[];
}

export class TelegramBot {
  private bot: Telegraf;
  private agent: PolkadotAgentKit;
  private llm: ChatOpenAI;

  constructor(config: BotConfig) {
    const {
      botToken,
      openAiApiKey = process.env.OPENAI_API_KEY || '',
      privateKey,
      delegatePrivateKey,
      chains,
    } = config;

    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN must be provided!');
    }

    this.bot = new Telegraf(botToken);

    this.agent = new PolkadotAgentKit({
      privateKey: privateKey || process.env.PRIVATE_KEY || '',
      delegatePrivateKey: delegatePrivateKey || process.env.DELEGATE_PRIVATE_KEY || '',
      chains,
    });

    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: openAiApiKey,
    });

    const tools = new PolkadotTools(this.agent);
    const xcmTool = xcmTransfer(tools) as unknown as Tool;

    setupHandlers(this.bot, this.llm, { xcmTransfer: xcmTool });
  }

  public async start(): Promise<void> {
    try {
      await this.bot.launch();
      console.log('Telegram bot is running...');
    } catch (error) {
      console.error('Failed to start bot:', error);
      throw error;
    }
  }

  public stop(): void {
    this.agent.disconnectAll();
    this.bot.stop();
    console.log('Bot stopped.');
  }
}