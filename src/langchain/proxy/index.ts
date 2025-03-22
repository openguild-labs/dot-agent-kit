import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PolkadotTools } from '../../tools/index';
import { ChainMap, defaultChainMap } from '../../chain/chainMap';

export const checkProxiesTool = (tools: PolkadotTools, chainMap: ChainMap = defaultChainMap) =>
  tool(
    async (input) => {
      try {
        const chainName = input.chainName;
        const targetChainName = chainName || Object.keys(chainMap)[0];
        
        if (!chainMap[targetChainName]) {
          return {
            content: JSON.stringify({
              error: true,
              message: `Chain "${targetChainName}" not found in chainMap`
            }),
            tool_call_id: `proxies_${Date.now()}`,
          };
        }

        const proxies = await tools.checkProxies(targetChainName);
        
        if (proxies.length === 1 && 'error' in proxies[0]) {
          return {
            content: JSON.stringify({
              error: true,
              message: proxies[0].error
            }),
            tool_call_id: `proxies_${Date.now()}`,
          };
        }
        
        if (proxies.length === 0) {
          return {
            content: JSON.stringify({
              message: `No proxy found on ${targetChainName}`
            }),
            tool_call_id: `proxies_${Date.now()}`,
          };
        }
        
        return {
          content: JSON.stringify({
            message: `Proxy info on ${targetChainName}`,
            data: proxies
          }),
          tool_call_id: `proxies_${Date.now()}`,
        };
      } catch (error) {
        console.error('Error: ', error);
        return {
          content: JSON.stringify({
            error: true,
            message: `Can't check proxy: ${error instanceof Error ? error.message : String(error)}`
          }),
          tool_call_id: `proxies_${Date.now()}`,
        };
      }
    },
    {
      name: 'checkProxies',
      description: 'Kiểm tra tất cả tài khoản proxy cho tài khoản mặc định trên chain được chỉ định',
      schema: z.object({
        chainName: z.string().optional().describe('Tên của chain để kiểm tra proxy (nếu không cung cấp, sẽ sử dụng chain đầu tiên trong chainMap)')
      }),
    },
  );