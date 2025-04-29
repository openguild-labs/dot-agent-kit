import { Telegraf } from 'telegraf';
import { ChatOpenAI } from '@langchain/openai';
import { setupHandlers } from './handlers';
import { PolkadotAgentKit } from '@polkadot-agent-kit/sdk';
export class TelegramBot {
    constructor(config) {
        const { botToken, openAiApiKey, privateKey,
        // delegatePrivateKey,
        // chains,
         } = config;
        if (!botToken) {
            throw new Error('TELEGRAM_BOT_TOKEN must be provided!');
        }
        this.bot = new Telegraf(botToken);
        this.agent = new PolkadotAgentKit(privateKey, { keyType: 'Sr25519' });
        this.llm = new ChatOpenAI({
            modelName: 'gpt-4',
            temperature: 0.7,
            openAIApiKey: openAiApiKey,
            streaming: true,
        });
    }
    async initialize() {
        console.log("Initializing bot...");
        try {
            // Initialize APIs first
            await this.agent.initializeApi();
            // Set up tools 
            // Get balance of agent account
            const checkBalance = this.agent.getNativeBalanceTool();
            setupHandlers(this.bot, this.llm, {
                checkBalance: checkBalance,
            });
            console.log("Bot initialization complete");
        }
        catch (error) {
            console.error("Failed to initialize bot:", error);
            throw error;
        }
    }
    async start() {
        try {
            await this.initialize();
            await this.bot.launch();
            console.log('Bot is running!');
        }
        catch (error) {
            console.error('Failed to start bot:', error);
            throw error;
        }
    }
    async stop() {
        try {
            await this.agent.disconnect();
            this.bot.stop();
        }
        catch (error) {
            console.error('Error during shutdown:', error);
        }
    }
}
