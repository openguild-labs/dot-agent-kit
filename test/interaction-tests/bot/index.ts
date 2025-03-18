import dotenv from 'dotenv';
import { TelegramBot } from '../bot/TelegramBot';

dotenv.config();

async function runBot() {
  const bot = new TelegramBot({
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    openAiApiKey: process.env.OPENAI_API_KEY!,
    privateKey: process.env.PRIVATE_KEY!,
    delegatePrivateKey: process.env.DELEGATE_PRIVATE_KEY!,
    chains: [
      { url: 'wss://westmint-rpc-tn.dwellir.com', name: 'westend2_asset_hub' },
    ],
  });

  await bot.start();

  process.once('SIGINT', () => bot.stop());
  process.once('SIGTERM', () => bot.stop());
}

runBot();