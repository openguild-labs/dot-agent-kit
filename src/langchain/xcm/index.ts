import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PolkadotTools } from '../../tools/index';

export const xcmTransfer = (tools: PolkadotTools) =>
  tool(
    async ({ chain, amount }: { chain: 'RelayChain' | 'ParaChain'; amount: number }) => {
      console.log(`xcmTransfer called with chain: ${chain}, amount: ${amount}`);
      try {
        let txHash: string;
        if (chain === 'RelayChain') {
          txHash = await tools.xcmTransferToRelayChain('westend2_asset_hub', BigInt(amount * 1e12));
          console.log(`RelayChain txHash: ${txHash}`);
        } else {
          txHash = await tools.xcmTransferToParaChain('westend', BigInt(amount * 1e12));
          console.log(`ParaChain txHash: ${txHash}`);
        }
        return {
          content: JSON.stringify({
            message: `Successfully transferred ${amount} tokens to ${chain}`,
            hash: txHash,
          }),
          tool_call_id: `xcm_${Date.now()}`,
        };
      } catch (error) {
        console.error(`Error in xcmTransfer: ${error}`);
        return {
          content: JSON.stringify({
            error: true,
            message: `Failed to transfer tokens: ${error instanceof Error ? error.message : String(error)}`,
          }),
          tool_call_id: `xcm_${Date.now()}`,
        };
      }
    },
    {
      name: 'xcmTransfer',
      description: 'Transfer tokens between chains using XCM with your account',
      schema: z.object({
        chain: z.enum(['RelayChain', 'ParaChain']),
        amount: z.number().positive().describe('Amount of tokens to transfer'),
      }),
    },
  );