import { Markup } from 'telegraf';
import { SessionManager } from '../session';
import { TICKET_CHAT_ID } from '../../config';

const sessionManager = new SessionManager();

export const help = async (ctx: any) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) return;

    // Initialize or reset session
    const sessionCreated = sessionManager.set(userId, {
      waitingForTicket: true,
    });

    if (!sessionCreated) {
      await ctx.reply(
        'Sorry, the support system is currently at maximum capacity. Please try again in a few minutes.',
        Markup.keyboard([
          ['/events', '/jobs', '/earnings'],
          ['/help', '/faq', '/brand'],
        ]).resize()
      );
      return;
    }

    await ctx.reply(
      "Please describe your issue in detail. I'll create a support ticket for you.\n\n" +
        "Type your message and send it. I'll ask for confirmation before submitting the ticket.",
      Markup.keyboard([['Cancel Ticket']])
        .oneTime()
        .resize()
    );
  } catch (error) {
    console.error('Error in help command:', error);
  }
};

// Handle ticket cancellation
export const cancelTicket = async (ctx: any) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) return;

    sessionManager.delete(userId);
    await ctx.reply(
      'Ticket creation cancelled.',
      Markup.keyboard([
        ['/events', '/jobs', '/earnings'],
        ['/help', '/faq', '/brand'],
      ]).resize()
    );
  } catch (error) {
    console.error('Error canceling ticket:', error);
  }
};

export const isSessionValid = async (ctx: any) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const session = sessionManager.get(userId);
  if (!session?.pendingTicket) {
    await ctx.reply(
      'Your session has expired. Please start a new ticket with /help.',
      Markup.keyboard([
        ['/events', '/jobs', '/earnings'],
        ['/help', '/faq', '/brand'],
      ]).resize()
    );
    return false;
  }
  return true;
};

export const submitTicket = async (ctx: any, bot: any) => {
  const valid = isSessionValid(ctx);
  const userId = ctx.from?.id;
  const session = sessionManager.get(userId);
  if (!valid || !session) return;

  await bot.telegram.sendMessage(
    TICKET_CHAT_ID,
    `New Support Ticket\n\nFrom: ${ctx.from.first_name} ${
      ctx.from.last_name || ''
    } (@${
      ctx.from.username || 'no_username'
    })\nUser ID: ${userId}\n\nMessage:\n${session.pendingTicket}`
  );

  // Confirm to user
  await ctx.reply(
    'Your ticket has been submitted successfully! Our support team will review it shortly.',
    Markup.keyboard([
      ['/events', '/jobs', '/earnings'],
      ['/help', '/faq', '/brand'],
    ]).resize()
  );

  // Clear session
  sessionManager.delete(userId);
};

export const editTicket = async (ctx: any, bot: any) => {
  const valid = isSessionValid(ctx);
  const userId = ctx.from?.id;
  const session = sessionManager.get(userId);
  if (!valid || !session) return;
  const sessionCreated = sessionManager.set(userId, {
    waitingForTicket: true,
    pendingTicket: ctx.message.text,
  });

  if (!sessionCreated) {
    await ctx.reply(
      'Sorry, the support system is currently at maximum capacity. Please try again in a few minutes.',
      Markup.keyboard([
        ['/events', '/jobs', '/earnings'],
        ['/help', '/faq', '/brand'],
      ]).resize()
    );
    return;
  }

  await ctx.reply(
    'Please review your ticket message:\n\n' +
      `${ctx.message.text}\n\n` +
      'Type new message if you want to change the tick or submit or cancel it.',
    Markup.keyboard([['Yes, submit ticket'], ['Cancel Ticket']])
      .oneTime()
      .resize()
  );
};

export const handleMessageForTicket = async (ctx: any, bot: any) => {
  const userId = ctx.from?.id;
  if (!userId) return false;

  const session = sessionManager.get(userId);

  // If waiting for ticket message
  if (session?.waitingForTicket) {
    console.log('watian ticket');
    try {
      switch (ctx.message.text) {
        case 'Cancel Ticket':
          console.log('Cancelling ticket');
          cancelTicket(ctx);
          break;
        case 'Yes, submit ticket':
          console.log('Submitting ticket');
          await submitTicket(ctx, bot);
          await ctx.reply(
            'Your ticket has been submitted successfully! Our support team will review it shortly.',
            Markup.keyboard([
              ['/events', '/jobs', '/earnings'],
              ['/help', '/faq', '/brand'],
            ]).resize()
          );
          break;
        default:
          editTicket(ctx, bot);
      }
    } catch (e) {
      console.error('Error handling ticket message');
      ctx.reply(
        'Sorry, something went wrong. Please try again later or contact https://twitter.com/SuperteamUK for support.'
      );
    }
    return true;
  }
  return false;
};
