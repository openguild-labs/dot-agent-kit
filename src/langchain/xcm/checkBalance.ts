import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PolkadotTools } from '../../tools/index';

export const checkBalanceTool = (tools: PolkadotTools) =>
  tool(
    async () => {
      try {
        const wndBalance = await tools.checkBalance('westend2_asset_hub');
        return {
          content: `Balance : ${wndBalance.toFixed(4)}`,
          tool_call_id: `balance_${Date.now()}`,
        };
      } catch (error) {
        console.error('Balance check error:', error);
        return {
          content: JSON.stringify({
            error: true,
            message: `Failed to check balance: ${error instanceof Error ? error.message : String(error)}`,
          }),
          tool_call_id: `balance_${Date.now()}`,
        };
      }
    },
    {
      name: 'checkBalance',
      description: 'Check WND balance on Westend network',
      schema: z.object({}),
    },
  );