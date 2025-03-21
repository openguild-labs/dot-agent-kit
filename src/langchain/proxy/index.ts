import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PolkadotTools } from '../../tools/index';
import { ChainMap, defaultChainMap } from '../../chain/chainMap';

export const checkProxiesTool = (tools: PolkadotTools, chainMap: ChainMap = defaultChainMap) =>
  tool(
    async (input) => {
      try {
        // Trích xuất chainName từ input hoặc sử dụng giá trị mặc định
        const chainName = input.chainName;
        
        // Mặc định sử dụng chain đầu tiên nếu không có chainName
        const targetChainName = chainName || Object.keys(chainMap)[0];
        
        if (!chainMap[targetChainName]) {
          return {
            content: JSON.stringify({
              error: true,
              message: `Chain "${targetChainName}" không tồn tại trong chainMap`
            }),
            tool_call_id: `proxies_${Date.now()}`,
          };
        }

        const proxies = await tools.checkProxies(targetChainName);
        
        // Kiểm tra nếu có lỗi
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
              message: `Không tìm thấy proxy nào cho tài khoản này trên ${targetChainName}`
            }),
            tool_call_id: `proxies_${Date.now()}`,
          };
        }
        
        return {
          content: JSON.stringify({
            message: `Thông tin proxy trên ${targetChainName}`,
            data: proxies
          }),
          tool_call_id: `proxies_${Date.now()}`,
        };
      } catch (error) {
        console.error('Lỗi kiểm tra proxy:', error);
        return {
          content: JSON.stringify({
            error: true,
            message: `Không thể kiểm tra proxy: ${error instanceof Error ? error.message : String(error)}`
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