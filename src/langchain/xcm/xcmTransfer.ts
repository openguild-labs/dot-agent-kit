import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ApiPromise } from '../../tools/substrace/substraceConnector';
import { buildAccountSigner } from '../../types/account';
import { teleportToRelayChain, teleportToParaChain } from '../../tools/xcm/teleport/teleport';

export const xcmTransfer = (api?: ApiPromise | null, accountAddress?: string) =>
  tool(
    async ({ chain, amount }: { chain: 'RelayChain' | 'ParaChain'; amount: number }) => {
      try {
        if (!api) {
          throw new Error('API connection not initialized');
        }
        if (!accountAddress) {
          throw new Error('Account address not provided');
        }

        const signer = buildAccountSigner();
        let result;

        if (chain === 'RelayChain') {
          result = await teleportToRelayChain(accountAddress, BigInt(amount)).signAndSubmit(signer);
        } else {
          result = await teleportToParaChain(accountAddress, BigInt(amount)).signAndSubmit(signer); // Giả định paraId 1000
        }

        const txHash = result.txHash.toString();
        return {
          content: JSON.stringify({
            message: `Successfully transferred ${amount} tokens to ${chain}`,
            hash: txHash,
          }),
          tool_call_id: `xcm_${Date.now()}`,
        };
      } catch (error) {
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
        amount: z.number(),
      }),
    },
  );