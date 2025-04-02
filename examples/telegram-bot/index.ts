import dotenv from 'dotenv';
import { TelegramBot } from './TelegramBot';
import {defaultChainMap} from '../../src/chain/chainMap';

dotenv.config();

async function runBot() {
  const bot = new TelegramBot({
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    openAiApiKey: process.env.OPENAI_API_KEY!,
    privateKey: process.env.PRIVATE_KEY!,
    delegatePrivateKey: process.env.DELEGATE_PRIVATE_KEY!,
    chains: Object.values(defaultChainMap),
  });

  await bot.start();

  process.once('SIGINT', () => bot.stop());
  process.once('SIGTERM', () => bot.stop());
}

runBot();