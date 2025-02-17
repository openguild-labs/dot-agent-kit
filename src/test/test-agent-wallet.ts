import { PolkadotAgent } from '../agent/agentWallet/agentWallet';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const agent = new PolkadotAgent({
    openAIApiKey: process.env.OPENAI_API_KEY || '',
    wsEndpoint: process.env.WS_ENDPOINT || 'wss://westend-rpc.polkadot.io:443',
    privateKey: process.env.PRIVATE_KEY || '',
  });

  await agent.waitForReady();

  try {
    const response = await agent.handlePrompt('add proxy 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
    console.log('Test result:', response);
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await agent.disconnect();
  }
}

main().catch(console.error);