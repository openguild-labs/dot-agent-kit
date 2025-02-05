import { brand } from './commands/brand';
import { earnings } from './commands/earnings';
import { events } from './commands/events';
import { help } from './commands/help';
import { jobs } from './commands/jobs';
import { start } from './commands/start';

export const execCommand = function (ctx: any, command: string): string {
  if (command === '/start') {
    start(ctx);
  }
  if (command === '/help') {
    help(ctx);
  }
  if (command === '/events') {
    events(ctx);
  }
  if (command === '/jobs') {
    jobs(ctx);
  }
  if (command === '/earnings') {
    earnings(ctx);
  }
  if (command === '/faq') {
    return '';
  }
  if (command === '/brand') {
    brand(ctx);
  }
  return 'Sorry, I do not understand that command. Please try again.';
};
