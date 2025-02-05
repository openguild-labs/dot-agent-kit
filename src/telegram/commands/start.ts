import { Markup } from 'telegraf';

export const start = async (ctx: any) => {
  try {
    const welcomeMessage = `
🎉 Welcome to Openguild! 

I'm Dandy, your AI assistant here to help you navigate Openguild. Feel free to chat with me about anything:
You can try generic questions like "What is Superteam?" to specific questions like "How to learn Ink".
I will try my best to provide you with the information you need. If there is any question that I cannot answer, I will forward it to a human to serve you.

Here are the available commands:

🎫 /help - Submit a support ticket to Openguild team
🎪 /events - Get the latest Openguild events
💼 /jobs - Browse available jobs for Openguild members
💰 /earnings - View earning opportunities from earn.superteam.fun
❓ /faq - View frequently asked questions
🎨 /brand - Access Openguild brand materials

Just send me a message anytime and I'll do my best to help you! If I can't answer your question, I'll make sure it reaches our support team.
`;

    await ctx.reply(
      welcomeMessage,
      Markup.keyboard([
        ['/events', '/jobs', '/earnings'],
        ['/help', '/faq', '/brand'],
      ]).resize()
    );
  } catch (error) {
    console.error('Error in start command:', error);
  }
};
