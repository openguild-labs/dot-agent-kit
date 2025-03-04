import { PolkadotAgent } from '../src/agent/agentWallet/agentWallet';
import dotenv from 'dotenv';
import { ChainRegistry } from '../src/chain/chainRegistry';
import { ChainType } from '../src/types/xcmTypes';

dotenv.config();

const ENDPOINTS = {
  'Westend': 'wss://westend-rpc.polkadot.io',
  'Asset Hub': 'wss://westend-asset-hub-rpc.polkadot.io'
};

async function main() {
  try {
    const chainRegistry = new ChainRegistry();
    
    // Register chains
    chainRegistry.registerChain({
      name: 'Westend',
      type: ChainType.RELAY_CHAIN,
      endpoint: ENDPOINTS['Westend'],
      xcmPallet: 'xcmPallet'
    });

    chainRegistry.registerChain({
      name: 'Asset Hub',
      type: ChainType.SYSTEM_PARACHAIN,
      parachainId: 1000,
      endpoint: ENDPOINTS['Asset Hub'],
      xcmPallet: 'polkadotXcm'
    });

    // Test transfer from relay chain to parachain
    const relayAgent = new PolkadotAgent({
      openAIApiKey: process.env.OPENAI_API_KEY || '',
      wsEndpoint: ENDPOINTS['Westend'],
      privateKey: process.env.PRIVATE_KEY || '',
      chainRegistry
    });

    await relayAgent.waitForReady();

    const message1 = "transfer 0.1 from Westend to 1000";
    console.log(message1);

    const response1 = await relayAgent.handlePrompt(message1);
    console.log('Test result 1:', response1);

    await relayAgent.disconnect();
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Test transfer from Asset Hub to Relay Chain
    const parachainAgent = new PolkadotAgent({
      openAIApiKey: process.env.OPENAI_API_KEY || '',
      wsEndpoint: ENDPOINTS['Asset Hub'],
      privateKey: process.env.PRIVATE_KEY || '',
      chainRegistry
    });

    await parachainAgent.waitForReady();
    await new Promise(resolve => setTimeout(resolve, 5000));

    const message2 = "transfer 0.1 from Asset Hub to relay";
    console.log(message2);

    const response2 = await parachainAgent.handlePrompt(message2);
    console.log('Test result 2:', response2);

    await parachainAgent.disconnect();

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit(0);
  }
}

main().catch(console.error);