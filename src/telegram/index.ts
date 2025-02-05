// src/bot.ts
import { Telegraf, Context } from 'telegraf';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_SUPPORT_CHANNEL } from '../config';
import { MessageObject } from '../types';
import { queryAIWelcome } from '../services/aiwelcomeApi';
import { checkRateLimit } from '../services/rateLimiter';
import { isNoMessage } from '../services/isNoMessage';
import { commands } from './constant';
import { execCommand } from './model';
import { handleMessageForTicket } from './commands/help';
import { setupFAQHandlers } from './commands/faq';
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

async function handleMessage(ctx: any, question: string, isPrivate: boolean) {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    ctx.reply('Unable to process your request. Please try again later.');
    return;
  }

  const withinLimit = checkRateLimit(userId);
  if (!withinLimit) {
    ctx.reply(
      'You have reached your daily limit for AI queries. Please try again tomorrow.'
    );
    return;
  }

  try {
    const answer = await queryAIWelcome(question);
    if (isNoMessage(answer)) {
      // post question to a dedicated channel
      await bot.telegram.sendMessage(
        TELEGRAM_SUPPORT_CHANNEL, // replace with your channel ID
        `Following question from @${ctx.from.username} has no answer:\n ${question}`
      );
    }
    if (isPrivate) {
      await ctx.reply(answer, {
        reply_to_message_id: ctx.message?.message_id,
        parse_mode: 'Markdown',
      });
    } else {
      ctx.reply(`${question}\n${answer}`, {
        chat_id: ctx.message?.from.id,
        parse_mode: 'Markdown',
      });
    }
  } catch (error) {
    console.error('Error forwarding unknown question to Dandy operator');
    // ctx.reply(
    //   'Sorry, something went wrong. Please try again later or contact support.'
    // );
  }
}

setupFAQHandlers(bot);

bot.on('text', async (ctx) => {
  const isTicket = await handleMessageForTicket(ctx, bot);
  if (isTicket) return;
  if (commands.includes(ctx.message.text)) {
    execCommand(ctx, ctx.message.text);
    return;
  }
  if ('text' in ctx.message) {
    const chatId = ctx.message.chat.id.toString();
    const messageObj: MessageObject = {
      from: ctx.message.from.username || ctx.message.from.first_name,
      text: ctx.message.text,
      date: new Date(ctx.message.date * 1000),
      reply_to_message: ctx.message.reply_to_message
        ? ctx.message.reply_to_message.message_id
        : null,
    };

    const chatType = ctx.message.chat.type;
    if (chatType === 'private') {
      await handleMessage(ctx, ctx.message.text, true);
    } else if (chatType === 'group' || chatType === 'supergroup') {
        const question = ctx.message.text;
        await handleMessage(ctx, question, false);
    }
  }
});

export function startBot() {
  bot.launch();
  console.log('Bot is running...');

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}