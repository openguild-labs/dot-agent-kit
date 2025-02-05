import { Context, Markup } from 'telegraf';

// FAQ data structure
interface FAQItem {
  question: string;
  answer: string;
}

export const FAQs: Record<string, FAQItem> = {
  what_is_superteamuk: {
    question: 'What is SuperteamUK?',
    answer:
      'SuperteamUK is the UK-focused community within the larger Superteam ecosystem. We help grow the Solana ecosystem in the UK by connecting talented individuals with opportunities, providing resources, and fostering collaboration.',
  },
  how_to_join: {
    question: 'How do I join SuperteamUK?',
    answer:
      'To join SuperteamUK, you can:\n\n1. Join our Telegram group https://t.me/+ar4LpWCwTuA3MWI0\n2. Introduce yourself in the #introductions channel\n3. Start participating in community activities\n4. Choose your pathway and start building your XP',
  },
  entrepreneur_pathway: {
    question: 'What is pathway for Entrepreneur?',
    answer:
      "The Entrepreneur pathway is designed for individuals looking to build projects or startups on Solana. You'll get:\n\n• Access to mentorship\n• Funding opportunities\n• Network with other founders\n• Resources to help validate and launch your idea \nContact @HeyCap for support",
  },
  developer_pathway: {
    question: 'What is pathway for Developer?',
    answer:
      'The Developer pathway focuses on technical skills in the Solana ecosystem:\n\n• Learn Solana development\n• Access to technical workshops\n• Hackathon opportunities\n• Bounties and job opportunities\n• Mentorship from experienced developers',
  },
  content_creator_pathway: {
    question: 'What is pathway for Content Creator?',
    answer:
      'The Content Creator pathway is for those interested in creating educational and engaging content:\n\n• Writing opportunities\n• Video content creation\n• Social media management\n• Community education\n• Paid content opportunities',
  },
  researcher_pathway: {
    question: 'What is pathway for Researcher?',
    answer:
      'The Researcher pathway involves:\n\n• Conducting ecosystem research\n• Writing research reports\n• Market analysis\n• Token economics\n• Protocol analysis\n• Paid research opportunities',
  },
  superteam_xp: {
    question: 'What is Superteam XP?',
    answer:
      'Superteam XP is our reputation system that tracks your contributions and engagement:\n\n• Earn XP through contributions\n• Access higher-tier opportunities\n• Build your reputation\n• Unlock exclusive benefits\n• Track your growth in the ecosystem',
  },
};

export function getFAQKeyboard() {
  return Markup.inlineKeyboard([
    [
      {
        text: 'What is SuperteamUK?',
        callback_data: 'faq_what_is_superteamuk',
      },
    ],
    [{ text: 'How do I join SuperteamUK?', callback_data: 'faq_how_to_join' }],
    [
      {
        text: 'What is pathway for Entrepreneur?',
        callback_data: 'faq_entrepreneur_pathway',
      },
    ],
    [
      {
        text: 'What is pathway for Developer?',
        callback_data: 'faq_developer_pathway',
      },
    ],
    [
      {
        text: 'What is pathway for Content Creator?',
        callback_data: 'faq_content_creator_pathway',
      },
    ],
    [
      {
        text: 'What is pathway for Researcher?',
        callback_data: 'faq_researcher_pathway',
      },
    ],
    [{ text: 'What is Superteam XP?', callback_data: 'faq_superteam_xp' }],
  ]);
}

const setupFAQHandlers = (bot: any) => {
  // FAQ command handler
  bot.command('faq', async (ctx: Context) => {
    try {
      await ctx.reply(
        '📚 Frequently Asked Questions\n\nSelect a question below:',
        getFAQKeyboard()
      );
    } catch (error) {
      console.error('Error in FAQ command:', error);
      await ctx.reply('Sorry, I encountered an error. Please try again later.');
    }
  });

  // Handle FAQ callback queries
  bot.action(/^faq_(.+)$/, async (ctx: Context) => {
    try {
      const faqKey = (ctx as any).match[1];
      const faq = FAQs[faqKey];

      if (!faq) {
        await ctx.reply("Sorry, I couldn't find the answer to that question.");
        return;
      }

      // Answer the question
      await ctx.reply(`❓ *${faq.question}*\n\n${faq.answer}`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '« Back to FAQ', callback_data: 'faq_back' }],
          ],
        },
      });

      // Answer the callback query to remove loading state
      await ctx.answerCbQuery();
    } catch (error) {
      console.error('Error handling FAQ callback:', error);
      await ctx.reply('Sorry, I encountered an error. Please try again later.');
    }
  });

  // Handle back to FAQ button
  bot.action('faq_back', async (ctx: Context) => {
    try {
      await ctx.deleteMessage();
      await ctx.reply(
        '📚 Frequently Asked Questions\n\nSelect a question below:',
        getFAQKeyboard()
      );
      await ctx.answerCbQuery();
    } catch (error) {
      console.error('Error handling back to FAQ:', error);
    }
  });
};
export { setupFAQHandlers };
