import { PolkadotAgent } from '../src/agent/agentWallet/agentWallet';
import dotenv from 'dotenv';

dotenv.config();

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

    await new Promise(resolve => setTimeout(resolve, 6000));

    const response2 = await agent.handlePrompt('check proxy 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
    console.log('Test result:', response2);

    await new Promise(resolve => setTimeout(resolve, 6000));

    const response3 = await agent.handlePrompt('remove proxy 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
    console.log('Test result:', response3);

    await new Promise(resolve => setTimeout(resolve, 6000));

    const response4 = await agent.handlePrompt('check proxy 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
    console.log('Test result:', response4);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await agent.disconnect();
  }
}

main().catch(console.error);