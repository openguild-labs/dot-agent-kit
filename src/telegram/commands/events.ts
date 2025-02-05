import { Markup } from 'telegraf';
import { LUMA_SECRET } from '../../config';

interface LumaEvent {
  name: string;
  description: string;
  startAt: string;
  endAt: string;
  timezone: string;
  url: string;
}

export const events = async (ctx: any) => {
  try {
    const now = new Date();
    const lumaApi =
      'https://api.lu.ma/public/v1/calendar/list-events?after=' +
      now.toISOString();
    const response = await fetch(lumaApi, {
      method: 'GET',
      headers: {
        'x-luma-api-key': LUMA_SECRET,
      },
    });
    const body = await response.json();
    const entries = body.entries;
    const ukEntries = entries.filter((entry: any) => {
      const tags = entry.tags;
      // each tag has api_id and name; find the one with name 'UK'
      const isCorrectTag = tags.some((tag: any) => tag.name === 'UK');
      const isPublic = entry.event.visibility === 'public';
      return isCorrectTag && isPublic;
    });
    const events = ukEntries.map((e: any) => {
      return {
        name: e.event.name,
        description: e.event.description_md,
        startAt: e.event.start_at,
        endAt: e.event.end_at,
        timezone: e.event.timezone,
        url: e.event.url,
      };
    });
    events.sort((a: any, b: any) => {
      return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    });
    for (const event of events.slice(0, 3)) {
      await ctx.replyWithMarkdown(formatEventMessage(event), {
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎟️ Register Now',
                url: event.url,
              },
            ],
          ],
        },
      });
    }

    // Add footer message
    await ctx.reply(
      'For the full list of event, follow this link https://lu.ma/superteam?tag=uk !',
      Markup.keyboard([
        ['/events', '/jobs', '/earnings'],
        ['/help', '/faq', '/brand'],
      ]).resize()
    );
  } catch (error) {
    console.error('Error in events command:', error);
    await ctx.reply(
      'Sorry, I encountered an error while fetching events. Please try again later.'
    );
  }
};

// Function to format event date
function formatEventDate(
  startAt: string,
  endAt: string,
  timezone: string
): string {
  const start = new Date(startAt);
  const end = new Date(endAt);

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  };

  const date = start.toLocaleDateString('en-GB', dateOptions);
  const startTime = start.toLocaleTimeString('en-GB', timeOptions);
  const endTime = end.toLocaleTimeString('en-GB', timeOptions);

  return `${date}\n${startTime} - ${endTime}`;
}

function formatEventMessage(event: LumaEvent) {
  return `
  🎯 *${event.name}*
  
  📅 ${formatEventDate(event.startAt, event.endAt, event.timezone)}
  
  🔗 [Join Event](${event.url})
  `;
}
