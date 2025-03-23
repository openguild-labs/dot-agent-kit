import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PolkadotLangTools } from '../../tools/index';
import { buildAccountSigner } from '../../types/account';
import { teleportToRelayChain, teleportToParaChain } from '../../tools/xcm/teleport';
import { substrateApi } from '../../tools/substrace';
import { ChainMap, defaultChainMap } from '../../chain/chainMap';

export const xcmTransfer = (tools: PolkadotLangTools, chainMap: ChainMap = defaultChainMap) =>
  tool(
    async ({ chainName, amount, address }: { chainName: string; amount: number, address: string }) => {
      try {
        if (!chainMap[chainName]) {
          throw new Error(`Chain "${chainName}" does not exist in chainMap`);
        }

        const chainInfo = chainMap[chainName];
        let txHash: string;

        const { api, disconnect } = await substrateApi({ url: chainInfo.url, name: chainInfo.name }, chainInfo.apiKey);
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
            message: `Successfully transferred ${amount} tokens to ${chainName}`,
            hash: txHash,
          }),
          tool_call_id: `xcm_${Date.now()}`,
        };
      } catch (error) {
        console.error(`Error in xcmTransfer: ${error}`);
        return {
          content: JSON.stringify({
            error: true,
            message: `Unable to transfer tokens: ${error instanceof Error ? error.message : String(error)}`,
          }),
          tool_call_id: `xcm_${Date.now()}`,
        };
      }
    },
    {
      name: 'xcmTransfer',
      description: 'Transfer tokens between chains using XCM with your account',
      schema: z.object({
        chainName: z.string().describe('Name of the chain to transfer tokens to (must exist in chainMap)'),
        amount: z.number().positive().describe('Amount of tokens to transfer'),
        address: z.string().describe('Address to receive tokens'),
      }),
    },
  );