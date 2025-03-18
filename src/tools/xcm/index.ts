import { PolkadotAgentKit } from '../../agent/index';
import { teleportToParaChain, teleportToRelayChain } from './teleport';
import { buildAccountSigner } from '../../../test/config-tests/account';

export class PolkadotTools {
  private agent: PolkadotAgentKit;

  constructor(agent: PolkadotAgentKit) {
    this.agent = agent;
  }

  async xcmTransferToRelayChain(chainName: string, amount: bigint, recipient?: string): Promise<string> {
    console.log(`xcmTransferToRelayChain called: ${chainName}, amount: ${amount}`);
    const { api } = await this.agent.getConnection(chainName);
    const signer = buildAccountSigner();
    const tx = await teleportToRelayChain(chainName, recipient || this.agent.address, amount);
    const result = await tx.signAndSubmit(signer);
    if (!result || !result.txHash) {
      throw new Error('Transaction result or txHash is undefined');
    }
    console.log(`xcmTransferToRelayChain result: ${result.txHash.toString()}`);
    return result.txHash.toString();
  }

  async xcmTransferToParaChain(chainName: string, amount: bigint): Promise<string> {
    console.log(`xcmTransferToParaChain called: ${chainName}, amount: ${amount}`);
    const { api } = await this.agent.getConnection(chainName);
    const signer = buildAccountSigner();
    const tx = await teleportToParaChain(chainName, this.agent.address, amount);
    const result = await tx.signAndSubmit(signer);
    if (!result || !result.txHash) {
      throw new Error('Transaction result or txHash is undefined');
    }
    console.log(`xcmTransferToParaChain result: ${result.txHash.toString()}`);
    return result.txHash.toString();
  }
}