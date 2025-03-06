import { PolkadotAgent } from '../src/agent/agentWallet/agentWallet';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const agent = new PolkadotAgent({
    openAIApiKey: process.env.OPENAI_API_KEY || '',
    wsEndpoint: 'wss://westend-rpc.polkadot.io',
    privateKey: process.env.PRIVATE_KEY || '',
  });

  await agent.waitForReady();

  try {
    // Test AI prompt for XCM transfer
    const response1 = await agent.handlePrompt(
      'transfer 0.1 from Westend to 1000'
    );
    console.log('AI XCM Transfer result 1:', response1);

    await new Promise(resolve => setTimeout(resolve, 5000));

    // await new Promise(resolve => setTimeout(resolve, 30000));

    // const response2 = await agent.handlePrompt(
    //   'transfer 0.1 from Asset Hub to relay'  
    // );
    // console.log('AI XCM Transfer result 2:', response2);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await agent.disconnect();
    // Thêm process.exit() để đảm bảo chương trình kết thúc
    process.exit(0);
  }
}

main().catch(console.error); 