import { Telegraf, session } from 'telegraf';
import dotenv from 'dotenv';
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { addressOfSubstrate, buildAccountSigner, publicKeyOf } from "./account";
import { magicApi } from "../../src/tools/substrace/substraceConnector";
import { teleportToRelayChain, teleportToParaChain } from "../../src/tools/xcm/teleport/teleport";

dotenv.config();

const SYSTEM_PROMPT = `I am Kisos, an AI Agent created by OpenGuild, helping users with:

- Check balance
- Transfer tokens
- XCM transfers between chains
- Swap tokens
- Staking
- Check XP ranking
- Mint NFT

I will analyze requests and suggest appropriate actions. I'll respond clearly and concisely in English.

For XCM transfers, I can help transfer tokens between RelayChain and ParaChain.

Key OpenGuild members:
- Brother Cris: funny, cute
- Sister Zoe: funny, cute, playful
- Brother Tin: honest, hardworking, introverted
- Sister Ngoc: cute
- Brother Ippo: honest, hardworking, extroverted`;

const checkXP = tool(
    async ({ userId }) => {
        console.log(`Checking XP for user: ${userId}`);
        return {
            content: `Your XP: 1000\nRank: Silver\nLevel: 5`,
            tool_call_id: userId 
        };
    },
    {
        name: "checkXP",
        description: "Check user's XP and ranking",
        schema: z.object({
            userId: z.string()
        })
    }
);

type ApiConnection = {
  api: any;
  disconnect: () => void;
};

class TelegramBot {
    private bot: Telegraf;
    private apiConnection: ApiConnection | null = null;
    private llm: ChatOpenAI;
    private llmWithTools: ChatOpenAI = new ChatOpenAI({
        modelName: "gpt-4",
        temperature: 0.7,
        openAIApiKey: process.env.OPENAI_API_KEY || "",
        streaming: true,
    });
    private toolsByName: Record<string, any> = {};

    constructor() {

        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        if (!BOT_TOKEN) {
            throw new Error('TELEGRAM_BOT_TOKEN must be provided!');
        }
        this.bot = new Telegraf(BOT_TOKEN);
        this.bot.use(session());

        this.llm = new ChatOpenAI({
            modelName: "gpt-4",
            temperature: 0.7,
            openAIApiKey: process.env.OPENAI_API_KEY || "",
            streaming: true,
        });

        this.initializeTools();

        this.setupHandlers();
    }

    private async initializeApi(): Promise<void> {
        this.apiConnection = await magicApi(
            { url: 'wss://westmint-rpc-tn.dwellir.com', name: 'westend2_asset_hub' }, 
            'westend2_asset_hub'
        );
    }

    private initializeTools(): void {
        const xcmTransfer = tool(
            async ({ chain, amount, address }) => {
                console.log(`XCM Transfer to ${chain} for amount: ${amount}`);
                try {
                    if (!this.apiConnection) {
                        throw new Error('API connection not initialized');
                    }

                    const { api } = this.apiConnection;
                    const publicKey = publicKeyOf(process.env.PRIVATE_KEY)
                    const myAccount = addressOfSubstrate(publicKey)

                    const result = await teleportToRelayChain(myAccount, BigInt(amount))
                        .signAndSubmit(buildAccountSigner());

                    const txHash = result.txHash;
                    const subscanLink = `https://assethub-westend.subscan.io/extrinsic/${txHash}`;
                    
                    return {
                        content: JSON.stringify({
                            message: `Successfully transferred ${amount} tokens to ${chain}`,
                            hash: txHash,
                            link: subscanLink
                        }),
                        tool_call_id: `xcm_${Date.now()}`
                    };
                } catch (error) {
                    console.error('XCM Transfer error:', error);
                    return {
                        content: JSON.stringify({
                            error: true,
                            message: `Failed to transfer tokens: ${error instanceof Error ? error.message : String(error)}`
                        }),
                        tool_call_id: `xcm_${Date.now()}`
                    };
                }
            },
            {
                name: "xcmTransfer",
                description: "Transfer tokens between chains using XCM",
                schema: z.object({
                    chain: z.enum(["RelayChain", "ParaChain"]),
                    amount: z.number(),
                    address: z.string().optional()
                })
            }
        );
        const checkBalance = tool(
            async () => {
                try {
                    if (!this.apiConnection) {
                        throw new Error('API connection not initialized');
                    }

                    const { api } = this.apiConnection;
                    const publicKey = publicKeyOf(process.env.PRIVATE_KEY)
                    const myAccount = addressOfSubstrate(publicKey)
                    const accountInfo = await api.query.System.Account.getValue(myAccount);
                    
                    const planckBalance = BigInt(accountInfo.data.free.toString());
                    const wndBalance = Number(planckBalance) / Math.pow(10, 12);
                    
                    return {
                        content: `WND Balance: ${wndBalance.toFixed(4)} WND`,
                        tool_call_id: `balance_${Date.now()}`
                    };
                } catch (error) {
                    console.error('Balance check error:', error);
                    return {
                        content: JSON.stringify({
                            error: true,
                            message: `Failed to check balance: ${error instanceof Error ? error.message : String(error)}`
                        }),
                        tool_call_id: `balance_${Date.now()}`
                    };
                }
            },
            {
                name: "checkBalance",
                description: "Check WND balance on Westend network",
                schema: z.object({})
            }
        );

        const checkProxies = tool(
            async () => {
                try {
                    if (!this.apiConnection) {
                        throw new Error('API connection not initialized');
                    }

                    const { api } = this.apiConnection;
                    const publicKey = publicKeyOf(process.env.PRIVATE_KEY)
                    const myAccount = addressOfSubstrate(publicKey)
                    
                    const proxiesInfo = await api.query.Proxy.Proxies.getValue(myAccount);
            
                    if (!proxiesInfo) {
                        return {
                            content: "No proxies found for this account",
                            tool_call_id: `proxies_${Date.now()}`
                        };
                    }
                    const serializer = (key: string, value: any) => {
                        if (typeof value === 'bigint') {
                            return value.toString();
                        }
                        return value;
                    };
                    
                    return {
                        content: `Proxy information:\n${JSON.stringify(proxiesInfo, serializer, 2)}`,
                        tool_call_id: `proxies_${Date.now()}`
                    };
                } catch (error) {
                    console.error('Proxy check error:', error);
                    return {
                        content: JSON.stringify({
                            error: true,
                            message: `Failed to check proxies: ${error instanceof Error ? error.message : String(error)}`
                        }),
                        tool_call_id: `proxies_${Date.now()}`
                    };
                }
            },
            {
                name: "checkProxies",
                description: "Check all proxy accounts for the default account",
                schema: z.object({})
            }
        );

        this.toolsByName = {
            checkXP,
            xcmTransfer,
            checkBalance,
            checkProxies
        };

        this.llmWithTools = this.llm.bindTools([
            checkXP,
            xcmTransfer,
            checkBalance,
            checkProxies
        ]);
    }

    private setupHandlers(): void {
        this.bot.on('text', async (ctx) => {
            const message = ctx.message.text;
            if (message.startsWith('/')) return;

            try {
                const messages = [
                    new SystemMessage({ content: SYSTEM_PROMPT }),
                    new HumanMessage({ content: message })
                ];
                
                const aiMessage = await this.llmWithTools.invoke(messages);
                messages.push(aiMessage);

                if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
                    for (const toolCall of aiMessage.tool_calls) {
                        const selectedTool = this.toolsByName[toolCall.name];
                        if (selectedTool) {
                            const toolMessage = await selectedTool.invoke(toolCall);
                            messages.push(toolMessage);

                            // Handle XCM transfer response
                            if (toolCall.name === 'xcmTransfer') {
                                try {
                                    const response = JSON.parse(toolMessage.content);
                                    if (!response.error && response.hash) {
                                        await ctx.reply(response.message, {
                                            reply_markup: {
                                                inline_keyboard: [[
                                                    {
                                                        text: '🔍 View Transaction',
                                                        url: response.link
                                                    }
                                                ]]
                                            }
                                        });
                                        continue;
                                    }
                                } catch (e) {
                                    console.error('Error parsing XCM response:', e);
                                }
                            }
                        }
                    }
                    
                    const finalResponse = await this.llmWithTools.invoke(messages);
                    await ctx.reply(String(finalResponse.content));
                } else {
                    await ctx.reply(String(aiMessage.content));
                }
            } catch (error: any) {
                console.error('Detailed error:', error);
                await ctx.reply('Sorry, an error occurred. Please try again later.');
            }
        });

        this.bot.catch((err, ctx) => {
            console.error(`Error for ${ctx.updateType}`, err);
            ctx.reply('Error');
        });
    }

    public async start(): Promise<void> {
        try {
            await this.initializeApi();
            await this.bot.launch();
            console.log('Bot and API connection are running...');
        } catch (error) {
            console.error('Failed to start bot:', error);
            throw error;
        }
    }

    public stop(): void {
        if (this.apiConnection) {
            this.apiConnection.disconnect();
        }
        this.bot.stop();
    }
}

// Initialize and start the bot
const telegramBot = new TelegramBot();
telegramBot.start();

// Setup shutdown handlers
process.once('SIGINT', () => telegramBot.stop());
process.once('SIGTERM', () => telegramBot.stop());