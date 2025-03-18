import { PolkadotAgentKit } from '../agent/index';
import { teleportToParaChain, teleportToRelayChain } from '../../src/tools/xcm/teleport/index';
import { buildAccountSigner } from '../types/account';

export class PolkadotTools {
  private agent: PolkadotAgentKit;

  constructor(agent: PolkadotAgentKit) {
    this.agent = agent;
  }

  /**
   * Perform XCM transfer to Relay Chain
   * @param chainName Name of the source chain (e.g., 'westmint')
   * @param amount Amount of tokens to transfer (in Planck)
   * @param recipient Recipient address (defaults to agent's address)
   * @returns Transaction hash
   */
  async xcmTransferToRelayChain(chainName: string, amount: bigint, recipient?: string): Promise<string> {
    console.log(`xcmTransferToRelayChain called: ${chainName}, amount: ${amount}`);
    const { api } = this.agent.getConnection(chainName);
    const signer = buildAccountSigner();
    const tx = teleportToRelayChain(recipient || this.agent.address, amount);
    const result = await tx.signAndSubmit(signer);
    if (!result || !result.txHash) {
      throw new Error('Transaction result or txHash is undefined');
    }
    console.log(`xcmTransferToRelayChain result: ${result.txHash.toString()}`);
    return result.txHash.toString();
  }

  /**
   * Perform XCM transfer to ParaChain
   * @param chainName Name of the destination chain (e.g., 'westend')
   * @param amount Amount of tokens to transfer (in Planck)
   * @param paraId ID of the destination parachain (e.g., 1000 for Westmint)
   * @returns Transaction hash
   */
  async xcmTransferToParaChain(chainName: string, amount: bigint, paraId: number = 1000): Promise<string> {
    console.log(`xcmTransferToParaChain called: ${chainName}, amount: ${amount}, paraId: ${paraId}`);
    const { api } = this.agent.getConnection(chainName);
    const signer = buildAccountSigner();
    const tx = teleportToParaChain(this.agent.address, amount);
    const result = await tx.signAndSubmit(signer);
    if (!result || !result.txHash) {
      throw new Error('Transaction result or txHash is undefined');
    }
    console.log(`xcmTransferToParaChain result: ${result.txHash.toString()}`);
    return result.txHash.toString();
  }

  /**
   * Check the WND balance of the agent's account on a specific chain
   * @param chainName Name of the chain (e.g., 'westend')
   * @returns Balance in WND
   */
  async checkBalance(chainName: string): Promise<number> {
    console.log(`checkBalance called for chain: ${chainName}`);
    const { api } = this.agent.getConnection(chainName);
    const accountInfo = await api.query.System.Account.getValue(this.agent.address);

    const planckBalance = BigInt(accountInfo.data.free.toString());
    const wndBalance = Number(planckBalance) / Math.pow(10, 12); 

    console.log(`Balance on ${chainName}: ${wndBalance.toFixed(4)}`);
    return wndBalance;
  }

  async checkProxies(chainName: string): Promise<any[]> {
        console.log(`checkProxies called for chain: ${chainName}`);
        const { api } = this.agent.getConnection(chainName);
        const proxiesInfo = await api.query.Proxy.Proxies.getValue(this.agent.address);
        const [proxies] = proxiesInfo;

        if (!proxies || proxies.length === 0) {
            console.log(`No proxies found for ${this.agent.address} on ${chainName}`);
            return [];
        }
        console.log(`Found ${proxies.length} proxies for ${this.agent.address} on ${chainName}`);
        return proxies;
    }
}