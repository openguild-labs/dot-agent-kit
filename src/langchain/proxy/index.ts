import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PolkadotTools } from '../../tools/index';

export const checkProxiesTool = (tools: PolkadotTools) =>
  tool(
    async () => {
      try {
        const proxies = await tools.checkProxies('westend2_asset_hub');
        if (proxies.length === 0) {
          return {
            content: 'No proxies found for this account on Westend',
            tool_call_id: `proxies_${Date.now()}`,
          };
        }
        return {
          content: `Proxy information on Westend:\n${JSON.stringify(proxies, null, 2)}`,
          tool_call_id: `proxies_${Date.now()}`,
        };
      } catch (error) {
        console.error('Proxy check error:', error);
        return {
          content: JSON.stringify({
            error: true,
            message: `Failed to check proxies: ${error instanceof Error ? error.message : String(error)}`,
          }),
          tool_call_id: `proxies_${Date.now()}`,
        };
      }
    },
    {
      name: 'checkProxies',
      description: 'Check all proxy accounts for the default account on Westend',
      schema: z.object({}),
    },
  );