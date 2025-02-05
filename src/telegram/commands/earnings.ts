export const earnings = async (ctx: any) => {
  try {
    const message = `🚀 *SuperteamUK Earning Opportunities*
  
  Find all available earning opportunities on our website:
  
  💼 Full-time roles
  💰 Bounties
  ✨ Microgrants
  🎯 Project-based work
  Click below to explore all opportunities! 👇
  P/S: Exclusive opportunies will not display here, please contact team.`;

    await ctx.replyWithMarkdown(message, {
      disable_web_page_preview: false, // Enable link preview
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔍 View Opportunities',
              url: 'https://earn.superteam.fun/regions/uk/',
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('Error in earnings command:', error);
    await ctx.reply('Sorry, I encountered an error. Please try again later.');
  }
};
