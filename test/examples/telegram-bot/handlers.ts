import { Telegraf } from 'telegraf';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Tool } from '@langchain/core/tools';

const SYSTEM_PROMPT = `I am a Telegram bot powered by PolkadotAgentKit. I can help you:
- Transfer tokens between chains using XCM (e.g., "transfer 1 token to westend_asset_hub to 5CSox4ZSN4SGLKUG9NYPtfVK9sByXLtxP4hmoF4UgkM4jgDJ")
- Check WND balance on Westend (e.g., "check balance")
- Check proxies (e.g., "check proxies")

When transferring tokens, please provide:
1. The number of tokens to transfer (e.g., 1)
2. The destination chain name (e.g., westend, westend_asset_hub)
3. The recipient address (e.g., 5CSox4ZSN4SGLKUG9NYPtfVK9sByXLtxP4hmoF4UgkM4jgDJ)

Suggested syntax: "transfer [amount] token to [chain name] to [address]"

Please provide instructions, and I will assist you!`;

export function setupHandlers(
  bot: Telegraf,
  llm: ChatOpenAI,
  toolsByName: Record<string, Tool>,
): void {
  bot.start((ctx) => {
    ctx.reply(
      'Welcome to Polkadot Bot!\n' +
      'I can help you:\n' +
      '- Transfer XCM tokens (e.g., "transfer 1 token to westend_asset_hub to 5CSox4ZSN4SGLKUG9NYPtfVK9sByXLtxP4hmoF4UgkM4jgDJ")\n' +
      '- Check WND balance (e.g., "check balance")\n' +
      '- Check proxies (e.g., "check proxies")\n' +
      'Try asking something!',
    );
  });

  bot.on('text', async (ctx) => {
    const message = ctx.message.text;
    console.log(`Received message: ${message}`);
    if (message.startsWith('/')) return;

    try {
      const llmWithTools = llm.bindTools(Object.values(toolsByName));
      const messages = [
        new SystemMessage({ content: SYSTEM_PROMPT }),
        new HumanMessage({ content: message }),
      ];

      const aiMessage = await llmWithTools.invoke(messages);
      console.log('aiMessage:', JSON.stringify(aiMessage, null, 2));
      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        for (const toolCall of aiMessage.tool_calls) {
          console.log('toolCall:', JSON.stringify(toolCall, null, 2));
          const selectedTool = toolsByName[toolCall.name];
          if (selectedTool) {
            const toolMessage = await selectedTool.invoke(toolCall);
            console.log('toolMessage:', JSON.stringify(toolMessage, null, 2));
            if (!toolMessage || !toolMessage.content) {
              await ctx.reply('Tool did not return a response.');
              return;
            }
            const response = JSON.parse(toolMessage.content || '{}');
            if (response.error) {
              await ctx.reply(`Error: ${response.message}`);
            } else {
              await ctx.reply(response.content || response.message || 'No message from tool.');
            }
          } else {
            await ctx.reply(`Tool ${toolCall.name} not found.`);
          }
        }
      } else {
        const content = String(aiMessage.content || 'No response from LLM.');
        console.log('LLM content:', content);
        await ctx.reply(content);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await ctx.reply(`Sorry, an error occurred: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}`, err);
    ctx.reply('An error occurred. Please try again.');
  });
}