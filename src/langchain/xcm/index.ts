import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PolkadotTools } from '../../tools/index';
import { buildAccountSigner } from '../../types/account';
import { teleportToRelayChain, teleportToParaChain } from '../../tools/xcm/teleport';
import { magicApi } from '../../tools/substrace';
import { ChainMap, defaultChainMap } from '../../chain/chainMap';

export const xcmTransfer = (tools: PolkadotTools, chainMap: ChainMap = defaultChainMap) =>
  tool(
    async ({ chainName, amount, address }: { chainName: string; amount: number, address: string }) => {
      try {
        if (!chainMap[chainName]) {
          throw new Error(`Chain "${chainName}" không tồn tại trong chainMap`);
        }

        const chainInfo = chainMap[chainName];
        let txHash: string;

        const { api, disconnect } = await magicApi({ url: chainInfo.url, name: chainInfo.name }, chainInfo.apiKey);
        const signer = buildAccountSigner();

        if (chainInfo.type === 'RelayChain') {
          const tx = teleportToRelayChain(address, BigInt(amount * 1e12));
          const result = await tx.signAndSubmit(signer);
          txHash = await result.txHash.toString();
        } else {
          const tx = teleportToParaChain(address, BigInt(amount * 1e12));
          const result = await tx.signAndSubmit(signer);
          txHash = await result.txHash.toString();
        }

        if (disconnect) disconnect();
        
        return {
          content: JSON.stringify({
            message: `Đã chuyển thành công ${amount} tokens tới ${chainName}`,
            hash: txHash,
          }),
          tool_call_id: `xcm_${Date.now()}`,
        };
      } catch (error) {
        console.error(`Lỗi trong xcmTransfer: ${error}`);
        return {
          content: JSON.stringify({
            error: true,
            message: `Không thể chuyển tokens: ${error instanceof Error ? error.message : String(error)}`,
          }),
          tool_call_id: `xcm_${Date.now()}`,
        };
      }
    },
    {
      name: 'xcmTransfer',
      description: 'Chuyển tokens giữa các chain sử dụng XCM với tài khoản của bạn',
      schema: z.object({
        chainName: z.string().describe('Tên của chain muốn chuyển tokens (phải tồn tại trong chainMap)'),
        amount: z.number().positive().describe('Số lượng tokens muốn chuyển'),
        address: z.string().describe('Địa chỉ nhận tokens'),
      }),
    },
  );