export const jobs = async (ctx: any) => {
  try {
    const message = `🚀 *Polkadot and Openguild Ecosystem Jobs*

🌱 *Join Growing Startups*
Be part of innovative teams building the future of web3! Most roles are with dynamic startups where you'll have real impact and growth opportunities.

🌍 *Remote-First Culture*
Work from anywhere in the world! Most positions are remote-friendly, giving you the freedom to work where you're most productive.

✈️ *Global Community*
Travel opportunities abound! Connect with the Polkadot and Openguild community at events worldwide – from hackathons to conferences.

💪 *Key Benefits*
• 🎯 High impact roles
• 📈 Growth potential in early-stage projects
• 🤝 Direct access to founders
• 🎓 Learn from ecosystem experts
• 🌐 Global networking opportunities

🔍 *View All Opportunities:*`;

    await ctx.replyWithMarkdown(message, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔗 Browse Solana Jobs',
              url: 'https://openguild.wtf/activity',
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('Error in jobs command:', error);
    await ctx.reply('Sorry, I encountered an error. Please try again later.');
  }
};
